package vendorsvc

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type VendorController struct {
	service *VendorService
}

func NewVendorController(service *VendorService) *VendorController {
	return &VendorController{service: service}
}

func writeJSON(w http.ResponseWriter, payload any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}

func respondError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}

type VendorRateLimitEntry struct {
	Count      int
	ResetTime  time.Time
	LastUpdate time.Time
}

type VendorIdempotencyEntry struct {
	Response   []byte
	StatusCode int
	CreatedAt  time.Time
	ExpiresAt  time.Time
}

var (
	vendorRateLimitStore   = make(map[string]*VendorRateLimitEntry)
	vendorRateLimitMutex   sync.RWMutex
	vendorIdempotencyStore = make(map[string]*VendorIdempotencyEntry)
	vendorIdempotencyMutex sync.RWMutex
)

func checkVendorWalletRateLimit(key string, maxRequests int, windowDuration time.Duration) (bool, int) {
	vendorRateLimitMutex.Lock()
	defer vendorRateLimitMutex.Unlock()

	entry, exists := vendorRateLimitStore[key]
	now := time.Now()

	if !exists {
		vendorRateLimitStore[key] = &VendorRateLimitEntry{
			Count:      1,
			ResetTime:  now.Add(windowDuration),
			LastUpdate: now,
		}
		return true, 0
	}

	if now.After(entry.ResetTime) {
		entry.Count = 1
		entry.ResetTime = now.Add(windowDuration)
		entry.LastUpdate = now
		return true, 0
	}

	if entry.Count >= maxRequests {
		retryAfter := int(entry.ResetTime.Sub(now).Seconds()) + 1
		return false, retryAfter
	}

	entry.Count++
	entry.LastUpdate = now
	return true, 0
}

func checkVendorWalletIdempotency(idempotencyKey string) (bool, int, []byte) {
	vendorIdempotencyMutex.RLock()
	defer vendorIdempotencyMutex.RUnlock()

	entry, exists := vendorIdempotencyStore[idempotencyKey]
	if !exists {
		return false, 0, nil
	}

	if time.Now().After(entry.ExpiresAt) {
		return false, 0, nil
	}

	return true, entry.StatusCode, entry.Response
}

func storeVendorWalletIdempotencyResult(idempotencyKey string, statusCode int, response []byte, ttl time.Duration) {
	vendorIdempotencyMutex.Lock()
	defer vendorIdempotencyMutex.Unlock()

	vendorIdempotencyStore[idempotencyKey] = &VendorIdempotencyEntry{
		Response:   response,
		StatusCode: statusCode,
		CreatedAt:  time.Now(),
		ExpiresAt:  time.Now().Add(ttl),
	}
}

func cleanupExpiredVendorWalletEntries() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()

		vendorRateLimitMutex.Lock()
		for key, entry := range vendorRateLimitStore {
			if now.After(entry.ResetTime.Add(1 * time.Minute)) {
				delete(vendorRateLimitStore, key)
			}
		}
		vendorRateLimitMutex.Unlock()

		vendorIdempotencyMutex.Lock()
		for key, entry := range vendorIdempotencyStore {
			if now.After(entry.ExpiresAt) {
				delete(vendorIdempotencyStore, key)
			}
		}
		vendorIdempotencyMutex.Unlock()
	}
}

func extractVendorWalletIdempotencyKey(r *http.Request) string {
	key := r.Header.Get("Idempotency-Key")
	if key == "" {
		if r.Method == http.MethodPost || r.Method == http.MethodPut {
			bodyHash := r.Header.Get("X-Request-Hash")
			if bodyHash != "" {
				return fmt.Sprintf("auto_%s", bodyHash)
			}
		}
	}
	return key
}

func init() {
	go cleanupExpiredVendorWalletEntries()
}

func isValidWalletServiceSecret(r *http.Request) bool {
	expected := strings.TrimSpace(os.Getenv("WALLET_SERVICE_SECRET"))
	if expected == "" {
		return false
	}
	return r.Header.Get("X-Wallet-Service-Secret") == expected
}

func (c *VendorController) GetNigerianBanks(w http.ResponseWriter, r *http.Request) {
	authUID := strings.TrimSpace(r.Header.Get("X-UID"))
	if authUID == "" {
		respondError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	banks, err := c.service.GetNigerianBanks()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch banks")
		return
	}

	writeJSON(w, map[string]any{"status": true, "banks": banks})
}

// CreateVendorFromAuth accepts a JSON payload from auth-service containing vendor info and file URLs
func (c *VendorController) CreateVendorFromAuth(w http.ResponseWriter, r *http.Request) {
	if !isValidWalletServiceSecret(r) {
		respondError(w, http.StatusForbidden, "Invalid internal service authentication")
		return
	}

	authUID := strings.TrimSpace(r.Header.Get("X-UID"))
	if authUID == "" {
		respondError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var input CreateVendorInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if strings.TrimSpace(input.FirebaseUID) == "" || authUID != input.FirebaseUID {
		respondError(w, http.StatusForbidden, "Cannot create vendor for another user")
		return
	}

	// Basic rate-limit: 3 creations per day
	allowed, retryAfter := checkVendorWalletRateLimit("create_vendor_"+input.FirebaseUID, 3, 24*time.Hour)
	if !allowed {
		w.Header().Set("Retry-After", fmt.Sprintf("%d", retryAfter))
		respondError(w, http.StatusTooManyRequests, fmt.Sprintf("Too many vendor creation attempts. Retry in %d seconds.", retryAfter))
		return
	}

	// Idempotency: check header
	idKey := extractVendorWalletIdempotencyKey(r)
	if idKey != "" {
		if found, statusCode, resp := checkVendorWalletIdempotency(idKey); found {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(statusCode)
			w.Write(resp)
			return
		}
	}

	result, err := c.service.CreateVendor(input)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]any{
		"success":        result.Success,
		"account_number": result.AccountNumber,
		"bank_name":      result.BankName,
		"account_name":   result.AccountName,
		"message":        "Vendor created",
	}

	if idKey != "" {
		b, _ := json.Marshal(response)
		storeVendorWalletIdempotencyResult(idKey, http.StatusCreated, b, 48*time.Hour)
		w.Header().Set("Idempotency-Key", idKey)
	}

	w.WriteHeader(http.StatusCreated)
	writeJSON(w, response)
}

func (c *VendorController) VerifyBankAccount(w http.ResponseWriter, r *http.Request) {
	authUID := strings.TrimSpace(r.Header.Get("X-UID"))
	if authUID == "" {
		respondError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var req VerifyAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request")
		return
	}

	response, err := c.service.VerifyBankAccount(req)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, response)
}

func (c *VendorController) Withdraw(w http.ResponseWriter, r *http.Request) {
	authUID := strings.TrimSpace(r.Header.Get("X-UID"))
	if authUID == "" {
		respondError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var req WithdrawRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request")
		return
	}

	if strings.TrimSpace(req.FirebaseUID) == "" || authUID != req.FirebaseUID {
		respondError(w, http.StatusForbidden, "Cannot withdraw from another user's wallet")
		return
	}

	if req.Amount <= 0 {
		respondError(w, http.StatusBadRequest, "amount must be greater than zero")
		return
	}
	if req.Amount < 10 {
		respondError(w, http.StatusBadRequest, "Minimum withdrawal is ₦10")
		return
	}
	if req.Amount > 5_000_000 {
		respondError(w, http.StatusBadRequest, "Maximum withdrawal is ₦5,000,000")
		return
	}

	allowed, retryAfter := checkVendorWalletRateLimit("withdraw_"+req.FirebaseUID, 20, 1*time.Hour)
	if !allowed {
		w.Header().Set("Retry-After", fmt.Sprintf("%d", retryAfter))
		respondError(w, http.StatusTooManyRequests, fmt.Sprintf("Too many withdrawal attempts. Retry in %d seconds.", retryAfter))
		return
	}

	idempotencyKey := extractVendorWalletIdempotencyKey(r)
	if idempotencyKey != "" {
		if found, statusCode, cachedResponse := checkVendorWalletIdempotency(idempotencyKey); found {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(statusCode)
			w.Write(cachedResponse)
			return
		}
	}

	response, err := c.service.Withdraw(req)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if idempotencyKey != "" {
		responseBytes, _ := json.Marshal(response)
		storeVendorWalletIdempotencyResult(idempotencyKey, http.StatusOK, responseBytes, 24*time.Hour)
		w.Header().Set("Idempotency-Key", idempotencyKey)
	}

	writeJSON(w, response)
}

func (c *VendorController) GetVendorWallet(w http.ResponseWriter, r *http.Request) {
	authUID := strings.TrimSpace(r.Header.Get("X-UID"))
	if authUID == "" {
		respondError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	uid := strings.TrimSpace(r.URL.Query().Get("firebase_uid"))
	if uid == "" {
		respondError(w, http.StatusBadRequest, "firebase_uid required")
		return
	}
	if uid != authUID {
		respondError(w, http.StatusForbidden, "Cannot access another user's wallet")
		return
	}

	wallet, err := c.service.GetVendorWallet(uid)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if wallet == nil {
		respondError(w, http.StatusNotFound, "Vendor wallet not found")
		return
	}

	writeJSON(w, wallet)
}

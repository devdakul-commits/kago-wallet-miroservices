package controllers

import (
	"encoding/json"
	"net/http"
	"strings"

	"kago-wallet-service/user/service"
)

type WalletController struct {
	service *service.WalletService
}

func NewWalletController(service *service.WalletService) *WalletController {
	return &WalletController{service: service}
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

func (c *WalletController) CreateWallet(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FirebaseUID string `json:"firebase_uid"`
		Name        string `json:"name"`
		Phone       string `json:"phone"`
		Email       string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	wallet, err := c.service.CreateWallet(service.CreateWalletInput{
		FirebaseUID: req.FirebaseUID,
		Name:        req.Name,
		Phone:       req.Phone,
		Email:       req.Email,
	})
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, map[string]any{
		"account_number": wallet.AccountNumber,
		"account_name":   wallet.Name,
		"bank_name":      wallet.BankName,
		"message":        "Wallet created successfully with ₦1000 welcome bonus",
	})
}

func (c *WalletController) FundWallet(w http.ResponseWriter, r *http.Request) {
	var req struct {
		AccountNumber string  `json:"account_number"`
		Amount        float64 `json:"amount"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	_, err := c.service.FundWallet(req.AccountNumber, req.Amount)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, map[string]string{"message": "Wallet funded successfully"})
}

func (c *WalletController) GetWalletByFirebase(w http.ResponseWriter, r *http.Request) {
	firebaseUID := strings.TrimSpace(r.URL.Query().Get("firebase_uid"))
	if firebaseUID == "" {
		respondError(w, http.StatusBadRequest, "Firebase UID required")
		return
	}

	wallet, err := c.service.GetWalletByFirebaseUID(firebaseUID)
	if err != nil || wallet == nil {
		respondError(w, http.StatusNotFound, "Wallet not found")
		return
	}

	writeJSON(w, wallet)
}

func (c *WalletController) GetWallet(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, map[string]any{"service": "wallet-service", "endpoint": "/user/wallet/get", "success": true, "transactions": []any{}})
}

func (c *WalletController) TransferRewards(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, map[string]any{"service": "wallet-service", "endpoint": "/user/wallet/transfer-rewards", "success": true, "status": "transferred"})
}

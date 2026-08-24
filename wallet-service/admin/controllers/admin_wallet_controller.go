package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"kago-wallet-service/admin/model"
	"kago-wallet-service/admin/service"
)

type AdminWalletController struct {
	service *service.AdminWalletService
}

func NewAdminWalletController(svc *service.AdminWalletService) *AdminWalletController {
	return &AdminWalletController{service: svc}
}

func (c *AdminWalletController) writeJSON(w http.ResponseWriter, payload any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}

func (c *AdminWalletController) respondError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}

func (c *AdminWalletController) GetAdminWalletBalance(w http.ResponseWriter, _r *http.Request) {
	wallet, err := c.service.GetBalance()
	if err != nil {
		c.respondError(w, http.StatusInternalServerError, "Failed to fetch wallet")
		return
	}
	c.writeJSON(w, map[string]any{"status": "success", "wallet": wallet})
}

func (c *AdminWalletController) GetAdminWalletTransactions(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	if limitStr == "" {
		limitStr = "100"
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 100
	}
	transactions, err := c.service.GetTransactions(limit)
	if err != nil {
		c.respondError(w, http.StatusInternalServerError, "Failed to fetch transactions")
		return
	}
	c.writeJSON(w, map[string]any{"status": "success", "transactions": transactions, "count": len(transactions)})
}

func (c *AdminWalletController) WithdrawAdminWallet(w http.ResponseWriter, r *http.Request) {
	var req model.AdminWithdrawalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		c.respondError(w, http.StatusBadRequest, "Invalid request")
		return
	}
	if req.VerificationKey == "" {
		c.respondError(w, http.StatusUnauthorized, "Verification required")
		return
	}
	txID, err := c.service.Withdraw(req)
	if err != nil {
		status := http.StatusBadRequest
		if err.Error() == "insufficient balance" {
			status = http.StatusPaymentRequired
		}
		c.respondError(w, status, err.Error())
		return
	}
	c.writeJSON(w, map[string]any{
		"status":         "success",
		"message":        "Withdrawal initiated successfully.",
		"transaction_id": txID,
	})
}

func (c *AdminWalletController) GetAdminWalletStats(w http.ResponseWriter, r *http.Request) {
	timeframe := r.URL.Query().Get("timeframe")
	if timeframe == "" {
		timeframe = "month"
	}
	stats := c.service.GetStats(timeframe)
	c.writeJSON(w, map[string]any{"status": "success", "stats": stats})
}

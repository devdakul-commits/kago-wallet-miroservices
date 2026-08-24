package model

type AdminWallet struct {
	ID               int     `json:"id"`
	WalletBalance    float64 `json:"wallet_balance"`
	TotalRevenue     float64 `json:"total_revenue"`
	TotalWithdrawals float64 `json:"total_withdrawals"`
	LastWithdrawal   *string `json:"last_withdrawal"`
	UpdatedAt        string  `json:"updated_at"`
}

type AdminWalletTransaction struct {
	ID            int     `json:"id"`
	Type          string  `json:"type"`
	Amount        float64 `json:"amount"`
	Description   string  `json:"description"`
	ReferenceType string  `json:"reference_type"`
	ReferenceID   int     `json:"reference_id"`
	Status        string  `json:"status"`
	CreatedAt     string  `json:"created_at"`
}

type AdminWithdrawalRequest struct {
	Amount          float64 `json:"amount"`
	BankAccountID   string  `json:"bank_account_id"`
	VerificationKey string  `json:"verification_key"`
}

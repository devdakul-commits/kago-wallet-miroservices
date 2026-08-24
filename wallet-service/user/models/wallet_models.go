package models

type CreateWalletRequest struct {
	FirebaseUID string `json:"firebase_uid"`
	Name        string `json:"name"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
}

type FundWalletRequest struct {
	AccountNumber string  `json:"account_number"`
	Amount        float64 `json:"amount"`
}

package vendorsvc

import "kago-wallet-service/internal/repository"

type Transaction = repository.Transaction

type WalletResponse struct {
	WalletID      string        `json:"wallet_id"`
	AccountNumber string        `json:"account_number"`
	AccountName   string        `json:"account_name"`
	BankName      string        `json:"bank_name"`
	Balance       float64       `json:"wallet_balance"`
	Cashback      float64       `json:"cashback_balance"`
	Rewards       float64       `json:"rewards_balance"`
	Transactions  []Transaction `json:"transactions"`
}

type Bank struct {
	Name string `json:"name"`
	Code string `json:"code"`
}

type WithdrawRequest struct {
	FirebaseUID   string  `json:"firebase_uid"`
	AccountNumber string  `json:"account_number"`
	BankCode      string  `json:"bank_code"`
	BankName      string  `json:"bank_name"`
	Amount        float64 `json:"amount"`
	Remark        string  `json:"remark"`
	CallbackURL   string  `json:"callback_url"`
}

type WithdrawResponse struct {
	Success       bool    `json:"success"`
	Message       string  `json:"message"`
	Reference     string  `json:"reference"`
	Amount        float64 `json:"amount"`
	BankName      string  `json:"bank_name"`
	AccountNumber string  `json:"account_number"`
	NewBalance    float64 `json:"new_balance"`
}

type VerifyAccountRequest struct {
	AccountNumber string `json:"account_number"`
	BankCode      string `json:"bank_code"`
}

type VerifyAccountResponse struct {
	AccountName   string `json:"account_name"`
	AccountNumber string `json:"account_number"`
	BankCode      string `json:"bank_code"`
}

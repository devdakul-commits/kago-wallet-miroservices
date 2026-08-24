package vendorsvc

import (
	"fmt"
	"strings"
	"time"

	"kago-wallet-service/internal/cache"
	"kago-wallet-service/internal/db"
	"kago-wallet-service/internal/repository"
)

type VendorService struct {
	repo  repository.WalletRepository
	cache cache.Cache
	store db.Store
}

func NewVendorService(repo repository.WalletRepository, cache cache.Cache, store db.Store) *VendorService {
	return &VendorService{repo: repo, cache: cache, store: store}
}

func (s *VendorService) GetVendorWallet(firebaseUID string) (*WalletResponse, error) {
	wallet, err := s.repo.GetByFirebaseUID(firebaseUID)
	if err != nil {
		return nil, err
	}
	if wallet == nil {
		return nil, nil
	}

	return &WalletResponse{
		WalletID:      wallet.ID,
		AccountNumber: wallet.AccountNumber,
		AccountName:   wallet.Name,
		BankName:      wallet.BankName,
		Balance:       wallet.Balance,
		Cashback:      0,
		Rewards:       0,
		Transactions:  wallet.Transactions,
	}, nil
}

func (s *VendorService) Withdraw(req WithdrawRequest) (*WithdrawResponse, error) {
	wallet, err := s.repo.GetByFirebaseUID(req.FirebaseUID)
	if err != nil {
		return nil, err
	}
	if wallet == nil {
		return nil, fmt.Errorf("wallet not found")
	}
	if wallet.Balance < req.Amount {
		return nil, fmt.Errorf("insufficient balance")
	}

	reference := fmt.Sprintf("KAGO-WD-%s-%d", strings.ToUpper(strings.TrimSpace(req.FirebaseUID)), time.Now().UnixNano())
	if len(reference) > 64 {
		reference = reference[:64]
	}

	transferPayload := map[string]interface{}{
		"account_bank":   req.BankCode,
		"account_number": req.AccountNumber,
		"amount":         req.Amount,
		"narration":      req.Remark,
		"currency":       "NGN",
		"reference":      reference,
		"callback_url":   req.CallbackURL,
		"debit_currency": "NGN",
	}

	var transferResult struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Data    struct {
			ID        int    `json:"id"`
			Reference string `json:"reference"`
			Status    string `json:"status"`
		} `json:"data"`
	}

	if err := flwPost("/transfers", transferPayload, &transferResult); err != nil {
		return nil, err
	}
	if transferResult.Status != "success" {
		return nil, fmt.Errorf("transfer failed: %s", transferResult.Message)
	}

	wallet.Balance -= req.Amount
	wallet.Transactions = append(wallet.Transactions, repository.Transaction{Type: "Withdraw", Amount: req.Amount, Description: fmt.Sprintf("Withdrawal to %s", req.BankName)})

	updated, err := s.repo.Update(*wallet)
	if err != nil {
		return nil, err
	}

	s.cache.Set(fmt.Sprintf("wallet:%s", updated.FirebaseUID), updated)
	s.store.Save(fmt.Sprintf("wallet:%s", updated.FirebaseUID), updated)

	return &WithdrawResponse{
		Success:       true,
		Message:       "Withdrawal successful",
		Reference:     transferResult.Data.Reference,
		Amount:        req.Amount,
		BankName:      req.BankName,
		AccountNumber: req.AccountNumber,
		NewBalance:    updated.Balance,
	}, nil
}

func (s *VendorService) GetNigerianBanks() ([]Bank, error) {
	var result struct {
		Status string `json:"status"`
		Data   []struct {
			Name string `json:"name"`
			Code string `json:"code"`
		} `json:"data"`
		Message string `json:"message"`
	}

	if err := flwGet("/banks/NG", &result); err != nil {
		return nil, err
	}
	if result.Status != "success" {
		return nil, fmt.Errorf("failed to fetch banks: %s", result.Message)
	}

	banks := make([]Bank, 0, len(result.Data))
	for _, bank := range result.Data {
		banks = append(banks, Bank{Name: bank.Name, Code: bank.Code})
	}
	return banks, nil
}

func (s *VendorService) VerifyBankAccount(req VerifyAccountRequest) (*VerifyAccountResponse, error) {
	if len(req.AccountNumber) != 10 || strings.TrimSpace(req.BankCode) == "" {
		return nil, fmt.Errorf("account_number (10 digits) and bank_code required")
	}

	var result struct {
		Status string `json:"status"`
		Data   struct {
			AccountName   string `json:"account_name"`
			AccountNumber string `json:"account_number"`
		} `json:"data"`
		Message string `json:"message"`
	}

	payload := map[string]string{
		"account_number": req.AccountNumber,
		"account_bank":   req.BankCode,
	}

	if err := flwPost("/accounts/resolve", payload, &result); err != nil {
		return nil, err
	}
	if result.Status != "success" {
		return nil, fmt.Errorf("account verification failed: %s", result.Message)
	}

	return &VerifyAccountResponse{
		AccountName:   result.Data.AccountName,
		AccountNumber: result.Data.AccountNumber,
		BankCode:      req.BankCode,
	}, nil
}

type CreateVendorInput struct {
	FirebaseUID   string `json:"firebase_uid"`
	OwnerName     string `json:"owner_name"`
	BusinessName  string `json:"business_name"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
	Category      string `json:"category"`
	BankAccount   string `json:"bank_account"`
	BankName      string `json:"bank_name"`
	BVN           string `json:"bvn"`
	NIN           string `json:"nin"`
	CACDocument   string `json:"cac_document"`
	ValidID       string `json:"valid_id"`
	BusinessImage string `json:"business_image"`
}

type CreateVendorResult struct {
	Success       bool   `json:"success"`
	AccountNumber string `json:"account_number"`
	BankName      string `json:"bank_name"`
	AccountName   string `json:"account_name"`
}

func (s *VendorService) CreateVendor(input CreateVendorInput) (*CreateVendorResult, error) {
	// Call Flutterwave to create a virtual account
	flwResp, err := createFlutterwaveAccount(input.OwnerName, input.Email, input.Phone, input.BusinessName, input.BVN, input.NIN, nil)
	if err != nil {
		return nil, err
	}

	// Create in-memory wallet record
	wallet := repository.Wallet{
		FirebaseUID:   input.FirebaseUID,
		Name:          input.BusinessName,
		Phone:         input.Phone,
		Email:         input.Email,
		AccountNumber: flwResp.AccountNumber,
		BankName:      flwResp.BankName,
	}
	_, err = s.repo.Create(wallet)
	if err != nil {
		return nil, err
	}

	// Persist to cache/store
	s.cache.Set(fmt.Sprintf("wallet:%s", input.FirebaseUID), wallet)
	s.store.Save(fmt.Sprintf("wallet:%s", input.FirebaseUID), wallet)

	return &CreateVendorResult{Success: true, AccountNumber: flwResp.AccountNumber, BankName: flwResp.BankName, AccountName: flwResp.AccountName}, nil
}

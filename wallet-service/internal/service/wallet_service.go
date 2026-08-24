package service

import (
	"fmt"
	"strings"

	"kago-wallet-service/internal/cache"
	"kago-wallet-service/internal/db"
	"kago-wallet-service/internal/events"
	"kago-wallet-service/internal/repository"
)

type CreateWalletInput struct {
	FirebaseUID string
	Name        string
	Phone       string
	Email       string
}

type WalletService struct {
	repository repository.WalletRepository
	cache      cache.Cache
	store      db.Store
}

func NewWalletService(repo repository.WalletRepository, c cache.Cache, s db.Store) *WalletService {
	return &WalletService{repository: repo, cache: c, store: s}
}

func (s *WalletService) CreateWallet(input CreateWalletInput) (*repository.Wallet, error) {
	if strings.TrimSpace(input.FirebaseUID) == "" {
		return nil, fmt.Errorf("firebase uid is required")
	}
	if existing, err := s.repository.GetByFirebaseUID(input.FirebaseUID); err != nil {
		return nil, err
	} else if existing != nil {
		return existing, nil
	}

	wallet := repository.Wallet{
		FirebaseUID:   input.FirebaseUID,
		Name:          input.Name,
		Phone:         input.Phone,
		Email:         input.Email,
		AccountNumber: fmt.Sprintf("KAGO-%s", strings.ToUpper(input.FirebaseUID)),
		BankName:      "Kago Wallet",
		Balance:       1000,
		Transactions:  []repository.Transaction{{Type: "credit", Amount: 1000, Description: "Welcome bonus"}},
	}
	created, err := s.repository.Create(wallet)
	if err != nil {
		return nil, err
	}
	s.cache.Set(fmt.Sprintf("wallet:%s", input.FirebaseUID), created)
	s.store.Save(fmt.Sprintf("wallet:%s", input.FirebaseUID), created)
	events.Publish(events.EventTypeWalletUpdated, map[string]any{
		"firebaseUid":   created.FirebaseUID,
		"accountNumber": created.AccountNumber,
		"balance":       created.Balance,
	})
	return &created, nil
}

func (s *WalletService) FundWallet(accountNumber string, amount float64) (*repository.Wallet, error) {
	if amount <= 0 {
		return nil, fmt.Errorf("amount must be positive")
	}
	wallet, err := s.repository.GetByAccountNumber(accountNumber)
	if err != nil {
		return nil, err
	}
	if wallet == nil {
		return nil, fmt.Errorf("wallet not found")
	}
	wallet.Balance += amount
	wallet.Transactions = append(wallet.Transactions, repository.Transaction{Type: "credit", Amount: amount, Description: "Wallet funded"})
	updated, err := s.repository.Update(*wallet)
	if err != nil {
		return nil, err
	}
	s.cache.Set(fmt.Sprintf("wallet:%s", updated.FirebaseUID), updated)
	s.store.Save(fmt.Sprintf("wallet:%s", updated.FirebaseUID), updated)
	events.Publish(events.EventTypeWalletUpdated, map[string]any{
		"firebaseUid":   updated.FirebaseUID,
		"accountNumber": updated.AccountNumber,
		"balance":       updated.Balance,
		"amount":        amount,
	})
	return &updated, nil
}

func (s *WalletService) GetWalletByFirebaseUID(firebaseUID string) (*repository.Wallet, error) {
	return s.repository.GetByFirebaseUID(firebaseUID)
}

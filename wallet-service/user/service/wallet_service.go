package service

import (
	"fmt"
	"kago-wallet-service/internal/cache"
	"kago-wallet-service/internal/db"
	"kago-wallet-service/internal/events"
	"kago-wallet-service/internal/repository"
	"strings"
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
	return createWallet(input, s.repository, s.cache, s.store)
}

func (s *WalletService) FundWallet(accountNumber string, amount float64) (*repository.Wallet, error) {
	return fundWallet(accountNumber, amount, s.repository, s.cache, s.store)
}

func (s *WalletService) GetWalletByFirebaseUID(firebaseUID string) (*repository.Wallet, error) {
	return s.repository.GetByFirebaseUID(firebaseUID)
}

func createWallet(input CreateWalletInput, repo repository.WalletRepository, cacheImpl cache.Cache, storeImpl db.Store) (*repository.Wallet, error) {
	if input.FirebaseUID == "" {
		return nil, fmt.Errorf("firebase uid is required")
	}
	if existing, err := repo.GetByFirebaseUID(input.FirebaseUID); err != nil {
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
	created, err := repo.Create(wallet)
	if err != nil {
		return nil, err
	}
	cacheImpl.Set(fmt.Sprintf("wallet:%s", input.FirebaseUID), created)
	storeImpl.Save(fmt.Sprintf("wallet:%s", input.FirebaseUID), created)
	events.Publish(events.EventTypeWalletUpdated, map[string]any{
		"firebaseUid":   created.FirebaseUID,
		"accountNumber": created.AccountNumber,
		"balance":       created.Balance,
	})
	return &created, nil
}

func fundWallet(accountNumber string, amount float64, repo repository.WalletRepository, cacheImpl cache.Cache, storeImpl db.Store) (*repository.Wallet, error) {
	if amount <= 0 {
		return nil, fmt.Errorf("amount must be positive")
	}
	wallet, err := repo.GetByAccountNumber(accountNumber)
	if err != nil {
		return nil, err
	}
	if wallet == nil {
		return nil, fmt.Errorf("wallet not found")
	}
	wallet.Balance += amount
	wallet.Transactions = append(wallet.Transactions, repository.Transaction{Type: "credit", Amount: amount, Description: "Wallet funded"})
	updated, err := repo.Update(*wallet)
	if err != nil {
		return nil, err
	}
	cacheImpl.Set(fmt.Sprintf("wallet:%s", updated.FirebaseUID), updated)
	storeImpl.Save(fmt.Sprintf("wallet:%s", updated.FirebaseUID), updated)
	events.Publish(events.EventTypeWalletUpdated, map[string]any{
		"firebaseUid":   updated.FirebaseUID,
		"accountNumber": updated.AccountNumber,
		"balance":       updated.Balance,
		"amount":        amount,
	})
	return &updated, nil
}

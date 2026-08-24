package repository

import (
	"fmt"
	"strings"
	"sync"
)

type Wallet struct {
	ID            string
	FirebaseUID   string
	Name          string
	Phone         string
	Email         string
	AccountNumber string
	BankName      string
	Balance       float64
	Transactions  []Transaction
}

type Transaction struct {
	Type        string
	Amount      float64
	Description string
}

type WalletRepository interface {
	Create(wallet Wallet) (Wallet, error)
	GetByFirebaseUID(firebaseUID string) (*Wallet, error)
	GetByAccountNumber(accountNumber string) (*Wallet, error)
	Update(wallet Wallet) (Wallet, error)
}

type InMemoryWalletRepository struct {
	mu        sync.RWMutex
	byUID     map[string]Wallet
	byAccount map[string]Wallet
}

func NewInMemoryWalletRepository() *InMemoryWalletRepository {
	return &InMemoryWalletRepository{byUID: map[string]Wallet{}, byAccount: map[string]Wallet{}}
}

func (r *InMemoryWalletRepository) Create(wallet Wallet) (Wallet, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	wallet.AccountNumber = strings.ToUpper(strings.ReplaceAll(wallet.AccountNumber, " ", "-"))
	if wallet.AccountNumber == "" {
		wallet.AccountNumber = fmt.Sprintf("KAGO-%s", strings.ToUpper(wallet.FirebaseUID))
	}
	if wallet.BankName == "" {
		wallet.BankName = "Kago Wallet"
	}
	if wallet.Balance == 0 {
		wallet.Balance = 1000
	}
	if len(wallet.Transactions) == 0 {
		wallet.Transactions = []Transaction{{Type: "credit", Amount: wallet.Balance, Description: "Welcome bonus"}}
	}
	r.byUID[wallet.FirebaseUID] = wallet
	r.byAccount[wallet.AccountNumber] = wallet
	return wallet, nil
}

func (r *InMemoryWalletRepository) GetByFirebaseUID(firebaseUID string) (*Wallet, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	wallet, ok := r.byUID[firebaseUID]
	if !ok {
		return nil, nil
	}
	clone := wallet
	clone.Transactions = append([]Transaction(nil), wallet.Transactions...)
	return &clone, nil
}

func (r *InMemoryWalletRepository) GetByAccountNumber(accountNumber string) (*Wallet, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	wallet, ok := r.byAccount[accountNumber]
	if !ok {
		return nil, nil
	}
	clone := wallet
	clone.Transactions = append([]Transaction(nil), wallet.Transactions...)
	return &clone, nil
}

func (r *InMemoryWalletRepository) Update(wallet Wallet) (Wallet, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.byUID[wallet.FirebaseUID] = wallet
	r.byAccount[wallet.AccountNumber] = wallet
	return wallet, nil
}

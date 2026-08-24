package service

import (
	"testing"

	"kago-wallet-service/internal/cache"
	"kago-wallet-service/internal/db"
	"kago-wallet-service/internal/repository"
)

func TestCreateWalletAddsWelcomeBonus(t *testing.T) {
	repo := repository.NewInMemoryWalletRepository()
	svc := NewWalletService(repo, cache.NewInMemoryCache(), db.NewInMemoryStore())

	wallet, err := svc.CreateWallet(CreateWalletInput{FirebaseUID: "user-123", Name: "Ada", Phone: "08012345678", Email: "ada@example.com"})
	if err != nil {
		t.Fatalf("expected wallet creation to succeed, got error %v", err)
	}
	if wallet.Balance != 1000 {
		t.Fatalf("expected welcome bonus balance 1000, got %v", wallet.Balance)
	}
	if len(wallet.Transactions) == 0 {
		t.Fatalf("expected transactions to be recorded")
	}
}

func TestFundWalletUpdatesBalance(t *testing.T) {
	repo := repository.NewInMemoryWalletRepository()
	svc := NewWalletService(repo, cache.NewInMemoryCache(), db.NewInMemoryStore())

	wallet, err := svc.CreateWallet(CreateWalletInput{FirebaseUID: "user-456", Name: "Grace", Phone: "08022222222", Email: "grace@example.com"})
	if err != nil {
		t.Fatalf("expected wallet creation to succeed, got error %v", err)
	}

	updated, err := svc.FundWallet(wallet.AccountNumber, 250)
	if err != nil {
		t.Fatalf("expected funding to succeed, got error %v", err)
	}
	if updated.Balance != 1250 {
		t.Fatalf("expected balance 1250 after funding, got %v", updated.Balance)
	}
}

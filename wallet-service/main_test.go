package main

import (
	"net/http/httptest"
	"strings"
	"testing"

	"kago-wallet-service/internal/cache"
	"kago-wallet-service/internal/db"
	"kago-wallet-service/internal/repository"
	servicepkg "kago-wallet-service/internal/service"
)

func resetWalletState() {
	walletService = servicepkg.NewWalletService(
		repository.NewInMemoryWalletRepository(),
		cache.NewInMemoryCache(),
		db.NewInMemoryStore(),
	)
}

func TestCreateWalletReturnsAccountAndBonus(t *testing.T) {
	resetWalletState()

	req := httptest.NewRequest("POST", "/user/wallet/create", strings.NewReader(`{"firebase_uid":"user-123","name":"Ada Lovelace","phone":"08012345678","email":"ada@example.com"}`))
	rec := httptest.NewRecorder()

	createWalletHandler(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	if !strings.Contains(body, "account_number") || !strings.Contains(body, "Wallet created successfully") {
		t.Fatalf("expected wallet creation payload, got %s", body)
	}
}

func TestFundWalletUpdatesBalance(t *testing.T) {
	resetWalletState()
	createWalletHandler(httptest.NewRecorder(), httptest.NewRequest("POST", "/user/wallet/create", strings.NewReader(`{"firebase_uid":"user-456","name":"Grace Hopper","phone":"08022222222","email":"grace@example.com"}`)))

	req := httptest.NewRequest("POST", "/user/wallet/fund", strings.NewReader(`{"account_number":"KAGO-USER-456","amount":250}`))
	rec := httptest.NewRecorder()

	fundWalletHandler(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	if !strings.Contains(body, "Wallet funded successfully") {
		t.Fatalf("expected funding response, got %s", body)
	}
}

package service

import (
	"fmt"
	"strings"
	"time"

	"kago-wallet-service/admin/model"
	"kago-wallet-service/admin/repository"
)

type AdminWalletService struct {
	repo repository.AdminWalletRepository
}

func NewAdminWalletService(repo repository.AdminWalletRepository) *AdminWalletService {
	return &AdminWalletService{repo: repo}
}

func (s *AdminWalletService) GetBalance() (*model.AdminWallet, error) {
	record, err := s.repo.GetAdminWalletBalance()
	if err != nil {
		return nil, err
	}

	return &model.AdminWallet{
		ID:               record.ID,
		WalletBalance:    record.WalletBalance,
		TotalRevenue:     record.TotalRevenue,
		TotalWithdrawals: record.TotalWithdrawals,
		LastWithdrawal:   record.LastWithdrawal,
		UpdatedAt:        time.Now().Format(time.RFC3339),
	}, nil
}

func (s *AdminWalletService) GetTransactions(limit int) ([]model.AdminWalletTransaction, error) {
	records, err := s.repo.GetAdminWalletTransactions(limit)
	if err != nil {
		return nil, err
	}

	transactions := make([]model.AdminWalletTransaction, 0, len(records))
	for _, tx := range records {
		transactions = append(transactions, model.AdminWalletTransaction{
			ID:            tx.ID,
			Type:          tx.Type,
			Amount:        tx.Amount,
			Description:   tx.Description,
			ReferenceType: tx.ReferenceType,
			ReferenceID:   tx.ReferenceID,
			Status:        tx.Status,
			CreatedAt:     tx.CreatedAt,
		})
	}
	return transactions, nil
}

func (s *AdminWalletService) Withdraw(req model.AdminWithdrawalRequest) (int, error) {
	if strings.TrimSpace(req.VerificationKey) == "" {
		return 0, fmt.Errorf("verification required")
	}
	if req.Amount < 1000 {
		return 0, fmt.Errorf("minimum withdrawal amount is ₦1000")
	}

	balance, err := s.repo.GetAdminWalletBalance()
	if err != nil {
		return 0, err
	}
	if balance.WalletBalance < req.Amount {
		return 0, fmt.Errorf("insufficient balance")
	}

	if err := s.repo.DeductBalance(req.Amount); err != nil {
		return 0, err
	}

	txID, err := s.repo.CreateTransaction(repository.AdminWalletTransactionRecord{
		Type:          "debit",
		Amount:        req.Amount,
		Description:   "Withdrawal to FlutterWave",
		ReferenceType: "withdrawal",
		ReferenceID:   0,
		Status:        "pending",
		CreatedAt:     time.Now().Format(time.RFC3339),
	})
	if err != nil {
		return 0, err
	}

	return txID, nil
}

func (s *AdminWalletService) GetStats(timeframe string) map[string]any {
	daysBack := 30
	switch strings.ToLower(strings.TrimSpace(timeframe)) {
	case "day":
		daysBack = 1
	case "week":
		daysBack = 7
	case "month":
		daysBack = 30
	}

	balance, _ := s.repo.GetAdminWalletBalance()
	totalRevenue := balance.TotalRevenue
	laundryRevenue := 0.0
	serviceRevenue := 0.0
	transactionCount := 0

	return map[string]any{
		"timeframe":         timeframe,
		"days_back":         daysBack,
		"total_revenue":     totalRevenue,
		"laundry_revenue":   laundryRevenue,
		"service_revenue":   serviceRevenue,
		"transaction_count": transactionCount,
	}
}

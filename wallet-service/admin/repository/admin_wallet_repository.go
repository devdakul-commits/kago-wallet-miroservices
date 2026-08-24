package repository

type AdminWalletRepository interface {
	GetAdminWalletBalance() (*AdminWalletRecord, error)
	GetAdminWalletTransactions(limit int) ([]AdminWalletTransactionRecord, error)
	DeductBalance(amount float64) error
	CreateTransaction(tx AdminWalletTransactionRecord) (int, error)
}

type AdminWalletRecord struct {
	ID               int
	WalletBalance    float64
	TotalRevenue     float64
	TotalWithdrawals float64
	LastWithdrawal   *string
	UpdatedAt        string
}

type AdminWalletTransactionRecord struct {
	ID            int
	Type          string
	Amount        float64
	Description   string
	ReferenceType string
	ReferenceID   int
	Status        string
	CreatedAt     string
}

// lightweight in-memory fallback repository
// This is intentionally simple because wallet-service currently uses in-memory store patterns.
// If a real DB backend is added later, this interface can be implemented against it.

type InMemoryAdminWalletRepository struct {
	balance      AdminWalletRecord
	transactions []AdminWalletTransactionRecord
}

func NewInMemoryAdminWalletRepository() *InMemoryAdminWalletRepository {
	return &InMemoryAdminWalletRepository{
		balance: AdminWalletRecord{
			ID:               1,
			WalletBalance:    10000,
			TotalRevenue:     10000,
			TotalWithdrawals: 0,
			UpdatedAt:        "",
		},
		transactions: []AdminWalletTransactionRecord{},
	}
}

func (r *InMemoryAdminWalletRepository) GetAdminWalletBalance() (*AdminWalletRecord, error) {
	return &r.balance, nil
}

func (r *InMemoryAdminWalletRepository) GetAdminWalletTransactions(limit int) ([]AdminWalletTransactionRecord, error) {
	if limit <= 0 {
		limit = 100
	}
	if limit > len(r.transactions) {
		limit = len(r.transactions)
	}
	return r.transactions[:limit], nil
}

func (r *InMemoryAdminWalletRepository) DeductBalance(amount float64) error {
	if amount > r.balance.WalletBalance {
		return nil
	}
	r.balance.WalletBalance -= amount
	r.balance.TotalWithdrawals += amount
	return nil
}

func (r *InMemoryAdminWalletRepository) CreateTransaction(tx AdminWalletTransactionRecord) (int, error) {
	tx.ID = len(r.transactions) + 1
	r.transactions = append([]AdminWalletTransactionRecord{tx}, r.transactions...)
	return tx.ID, nil
}

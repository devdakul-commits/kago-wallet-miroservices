package vendorsvc

import (
	"database/sql"
	"fmt"
	"os"
	"time"
)

// ═══════════════════════════════════════════════════════════════════════════
// 💾 DATABASE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

// VendorCreationResult represents the result of successful vendor creation
type VendorCreationResult struct {
	VendorID      int
	WalletID      int
	AccountNumber string
	BankName      string
	AccountName   string
}

// createVendorInDB creates wallet and vendor records in database transaction
func createVendorInDB(tx *sql.Tx, firebaseUID, ownerName, businessName, phone, email, category, bankAccount, bankName string,
	accountNumber string, files *SavedFiles) (*VendorCreationResult, error) {

	result := &VendorCreationResult{
		AccountNumber: accountNumber,
		BankName:      bankName,
	}

	// ✅ Check for existing wallet by account_number
	var walletID int
	err := tx.QueryRow(`SELECT id FROM wallets WHERE account_number = $1`, accountNumber).Scan(&walletID)
	if err == sql.ErrNoRows {
		// Insert new wallet if not found
		err = tx.QueryRow(
			`INSERT INTO wallets (firebase_uid, name, phone, email, account_number, balance, bank_name, cashback_balance, rewards_balance)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
			firebaseUID, businessName, phone, email,
			accountNumber, 0, bankName, 0, 0,
		).Scan(&walletID)
	} else if err != nil {
		return nil, fmt.Errorf("failed to query wallet: %v", err)
	}

	if walletID == 0 {
		return nil, fmt.Errorf("invalid wallet ID returned")
	}

	result.WalletID = walletID

	// Insert vendor profile
	var vendorID int
	err = tx.QueryRow(
		`INSERT INTO vendors (
            firebase_uid, owner_name, business_name, phone, email, category,
            bank_account, bank_name, wallet_id, cac_document, valid_id,
            business_image, status, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending',$13)
        RETURNING id`,
		firebaseUID, ownerName, businessName, phone, email,
		category, bankAccount, bankName, walletID,
		files.CACFilename, files.IDFilename, files.ImageFilename, time.Now(),
	).Scan(&vendorID)
	if err != nil {
		return nil, fmt.Errorf("failed to create vendor profile: %v", err)
	}

	result.VendorID = vendorID
	return result, nil
}

// syncProfileToDB syncs vendor data to profiles table for frontend access
func syncProfileToDB(tx *sql.Tx, firebaseUID, businessName, email, phone string, files *SavedFiles) error {
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8081"
	}

	_, err := tx.Exec(`
    INSERT INTO profiles (
        firebase_uid, display_name, email, phone, photo_url,
        cac_document, valid_id, business_image, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT (firebase_uid) DO UPDATE SET
        display_name=$2, email=$3, phone=$4,
        cac_document=$6, valid_id=$7, business_image=$8, updated_at=$9
    `,
		firebaseUID, businessName, email, phone, "",
		fmt.Sprintf("%s/uploads/cac/%s", baseURL, files.CACFilename),
		fmt.Sprintf("%s/uploads/id/%s", baseURL, files.IDFilename),
		fmt.Sprintf("%s/uploads/business/%s", baseURL, files.ImageFilename),
		time.Now(),
	)

	if err != nil {
		return fmt.Errorf("failed to sync profile: %v", err)
	}

	return nil
}

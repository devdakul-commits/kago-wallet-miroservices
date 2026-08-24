package vendorsvc

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

// SavedFiles holds temporary vendor document paths and filenames for cleanup and DB storage.
type SavedFiles struct {
	CACPath       string
	IDPath        string
	ImagePath     string
	CACFilename   string
	IDFilename    string
	ImageFilename string
}

// getFlutterwaveKey chooses test/live key based on APP_ENV.
func getFlutterwaveKey() string {
	env := os.Getenv("APP_ENV")
	if env == "production" {
		return os.Getenv("FLW_SECRET_KEY_LIVE")
	}
	return os.Getenv("FLW_SECRET_KEY_TEST")
}

// FlutterwaveResponse represents a successful account creation response.
type FlutterwaveResponse struct {
	AccountNumber string
	BankName      string
	AccountName   string
}

// createFlutterwaveAccount creates a virtual account via Flutterwave API.
func createFlutterwaveAccount(ownerName, email, phone, businessName, bvn, nin string, files *SavedFiles) (*FlutterwaveResponse, error) {
	names := strings.SplitN(ownerName, " ", 2)
	firstname := names[0]
	lastname := ""
	if len(names) > 1 {
		lastname = names[1]
	}

	flwURL := "https://api.flutterwave.com/v3/virtual-account-numbers"
	payload := map[string]any{
		"email":        email,
		"tx_ref":       fmt.Sprintf("vendor-%d", time.Now().UnixNano()),
		"amount":       1,
		"firstname":    firstname,
		"lastname":     lastname,
		"phonenumber":  phone,
		"is_permanent": true,
		"narration":    businessName,
	}
	if bvn != "" {
		payload["bvn"] = bvn
	}
	if nin != "" {
		payload["nin"] = nin
	}

	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", flwURL, bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+getFlutterwaveKey())
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		cleanupVendorFiles(files)
		return nil, fmt.Errorf("Flutterwave API error: %v", err)
	}
	defer resp.Body.Close()

	var flwResp struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Data    struct {
			AccountNumber string `json:"account_number"`
			BankName      string `json:"bank_name"`
			AccountName   string `json:"account_name"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&flwResp); err != nil {
		cleanupVendorFiles(files)
		return nil, fmt.Errorf("failed to parse Flutterwave response: %v", err)
	}
	if flwResp.Status != "success" {
		cleanupVendorFiles(files)
		return nil, fmt.Errorf("Flutterwave error: %s", flwResp.Message)
	}

	return &FlutterwaveResponse{
		AccountNumber: flwResp.Data.AccountNumber,
		BankName:      flwResp.Data.BankName,
		AccountName:   flwResp.Data.AccountName,
	}, nil
}

// cleanupVendorFiles removes temporary uploaded files when account creation fails.
func cleanupVendorFiles(files *SavedFiles) {
	if files == nil {
		return
	}
	if files.CACPath != "" {
		os.Remove(files.CACPath)
	}
	if files.IDPath != "" {
		os.Remove(files.IDPath)
	}
	if files.ImagePath != "" {
		os.Remove(files.ImagePath)
	}
}

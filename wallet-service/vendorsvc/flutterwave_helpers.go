package vendorsvc

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

func flwSecretKey() string {
	if os.Getenv("APP_ENV") == "production" {
		return os.Getenv("FLW_SECRET_KEY_LIVE")
	}
	return os.Getenv("FLW_SECRET_KEY_TEST")
}

func flwGet(path string, target interface{}) error {
	url := "https://api.flutterwave.com/v3" + path

	var lastErr error
	for attempt := 1; attempt <= 3; attempt++ {
		req, err := http.NewRequest(http.MethodGet, url, nil)
		if err != nil {
			return err
		}
		req.Header.Set("Authorization", "Bearer "+flwSecretKey())
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{Timeout: 15 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			lastErr = err
			log.Printf("⚠️ Flutterwave GET attempt %d failed: %v", attempt, err)
			time.Sleep(time.Duration(attempt) * 500 * time.Millisecond)
			continue
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)
		if resp.StatusCode != http.StatusOK {
			lastErr = fmt.Errorf("flw %s returned %d: %s", path, resp.StatusCode, string(body))
			log.Printf("⚠️ Flutterwave GET attempt %d bad status: %v", attempt, lastErr)
			time.Sleep(time.Duration(attempt) * 500 * time.Millisecond)
			continue
		}

		return json.Unmarshal(body, target)
	}
	return fmt.Errorf("flw GET %s failed after 3 attempts: %w", path, lastErr)
}

func flwPost(path string, payload interface{}, target interface{}) error {
	url := "https://api.flutterwave.com/v3" + path

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	var lastErr error
	for attempt := 1; attempt <= 3; attempt++ {
		req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(bodyBytes))
		if err != nil {
			return err
		}
		req.Header.Set("Authorization", "Bearer "+flwSecretKey())
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{Timeout: 30 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			lastErr = err
			log.Printf("⚠️ Flutterwave POST attempt %d failed: %v", attempt, err)
			time.Sleep(time.Duration(attempt) * time.Second)
			continue
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)
		if resp.StatusCode >= 400 && resp.StatusCode < 500 {
			return fmt.Errorf("flw %s client error %d: %s", path, resp.StatusCode, string(body))
		}
		if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
			lastErr = fmt.Errorf("flw %s returned %d: %s", path, resp.StatusCode, string(body))
			log.Printf("⚠️ Flutterwave POST attempt %d bad status: %v", attempt, lastErr)
			time.Sleep(time.Duration(attempt) * time.Second)
			continue
		}

		return json.Unmarshal(body, target)
	}
	return fmt.Errorf("flw POST %s failed after 3 attempts: %w", path, lastErr)
}

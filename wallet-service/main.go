package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"kago-wallet-service/admin/controllers"
	"kago-wallet-service/admin/repository"
	adminroutes "kago-wallet-service/admin/routes"
	adminservice "kago-wallet-service/admin/service"
	"kago-wallet-service/internal/cache"
	"kago-wallet-service/internal/db"
	internalRepository "kago-wallet-service/internal/repository"
	usercontrollers "kago-wallet-service/user/controllers"
	userroutes "kago-wallet-service/user/routes"
	userservice "kago-wallet-service/user/service"
	vendor "kago-wallet-service/vendorsvc"
)

func buildRedisURL() string {
	if url := os.Getenv("REDIS_URL"); url != "" {
		return url
	}
	host := os.Getenv("REDIS_HOST")
	port := os.Getenv("REDIS_PORT")
	if host == "" {
		return ""
	}
	if port == "" {
		port = "6379"
	}
	return fmt.Sprintf("redis://%s:%s", host, port)
}

var adminWalletController = buildAdminWalletController()
var adminWalletRouter = buildAdminWalletRouter()
var sharedWalletRepo = internalRepository.NewInMemoryWalletRepository()
var sharedCache = cache.NewInMemoryCache()
var sharedStore = db.NewInMemoryStore()
var userWalletController = buildUserWalletController()
var userWalletRouter = buildUserWalletRouter()
var vendorRouter = buildVendorRouter()

func buildAdminWalletController() *controllers.AdminWalletController {
	repo := repository.NewInMemoryAdminWalletRepository()
	service := adminservice.NewAdminWalletService(repo)
	return controllers.NewAdminWalletController(service)
}

func buildAdminWalletRouter() *adminroutes.AdminWalletRouter {
	return adminroutes.NewAdminWalletRouter(adminWalletController)
}

func buildUserWalletController() *usercontrollers.WalletController {
	return usercontrollers.NewWalletController(
		userservice.NewWalletService(
			sharedWalletRepo,
			sharedCache,
			sharedStore,
		),
	)
}

func buildUserWalletRouter() *userroutes.UserRouter {
	return userroutes.NewUserRouter(userWalletController)
}

func buildVendorRouter() *vendor.VendorRouter {
	return vendor.NewVendorRouter(
		vendor.NewVendorController(
			vendor.NewVendorService(
				sharedWalletRepo,
				sharedCache,
				sharedStore,
			),
		),
	)
}

func writeJSON(w http.ResponseWriter, payload any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}

func respondError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, map[string]string{"status": "ok", "service": "wallet-service"})
}

func mainHandler(w http.ResponseWriter, r *http.Request) {
	if userWalletRouter.Route(w, r) {
		return
	}
	if vendorRouter.Route(w, r) {
		return
	}

	path := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(path, "/")

	switch {
	case r.URL.Path == "/health":
		healthHandler(w, r)
	case r.URL.Path == "/vendor/create":
		writeJSON(w, map[string]any{"service": "wallet-service", "endpoint": "/vendor/create", "success": true, "status": "created"})
	case len(parts) == 2 && parts[0] == "vendor" && parts[1] != "":
		writeJSON(w, map[string]any{"service": "wallet-service", "endpoint": "/vendor/{firebase_uid}", "vendorUid": parts[1]})
	case adminWalletRouter.Route(w, r):
		return
	default:
		http.NotFound(w, r)
	}
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", mainHandler)

	secret := strings.TrimSpace(os.Getenv("WALLET_SERVICE_SECRET"))
	if secret == "" {
		log.Fatal("[wallet-service] WALLET_SERVICE_SECRET is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3005"
	}

	fmt.Printf("[wallet-service] listening on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

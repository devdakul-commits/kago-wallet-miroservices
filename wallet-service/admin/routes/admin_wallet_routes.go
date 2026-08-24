package routes

import (
	"net/http"

	"kago-wallet-service/admin/controllers"
)

type AdminWalletRouter struct {
	controller *controllers.AdminWalletController
}

func NewAdminWalletRouter(controller *controllers.AdminWalletController) *AdminWalletRouter {
	return &AdminWalletRouter{controller: controller}
}

func (r *AdminWalletRouter) Route(w http.ResponseWriter, req *http.Request) bool {
	switch req.URL.Path {
	case "/admin/wallet/balance":
		if req.Method == http.MethodGet {
			r.controller.GetAdminWalletBalance(w, req)
			return true
		}
	case "/admin/wallet/transactions":
		if req.Method == http.MethodGet {
			r.controller.GetAdminWalletTransactions(w, req)
			return true
		}
	case "/admin/wallet/stats":
		if req.Method == http.MethodGet {
			r.controller.GetAdminWalletStats(w, req)
			return true
		}
	case "/admin/wallet/withdraw":
		if req.Method == http.MethodPost {
			r.controller.WithdrawAdminWallet(w, req)
			return true
		}
	}

	return false
}

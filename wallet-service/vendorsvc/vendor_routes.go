package vendorsvc

import (
	"net/http"
)

type VendorRouter struct {
	controller *VendorController
}

func NewVendorRouter(controller *VendorController) *VendorRouter {
	return &VendorRouter{controller: controller}
}

func (r *VendorRouter) Route(w http.ResponseWriter, req *http.Request) bool {
	// create vendor via JSON (used by auth-service)
	if req.URL.Path == "/vendor/create" {
		if req.Method == http.MethodPost {
			r.controller.CreateVendorFromAuth(w, req)
			return true
		}
	}
	switch req.URL.Path {
	case "/vendor/wallet/banks":
		if req.Method == http.MethodGet {
			r.controller.GetNigerianBanks(w, req)
			return true
		}
	case "/vendor/wallet/verify-account":
		if req.Method == http.MethodPost {
			r.controller.VerifyBankAccount(w, req)
			return true
		}
	case "/vendor/wallet/withdraw":
		if req.Method == http.MethodPost {
			r.controller.Withdraw(w, req)
			return true
		}
	case "/vendor/wallet":
		if req.Method == http.MethodGet {
			r.controller.GetVendorWallet(w, req)
			return true
		}
	}

	return false
}

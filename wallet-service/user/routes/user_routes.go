package routes

import (
	"net/http"
	"strings"

	"kago-wallet-service/user/controllers"
)

type UserRouter struct {
	controller *controllers.WalletController
}

func NewUserRouter(controller *controllers.WalletController) *UserRouter {
	return &UserRouter{controller: controller}
}

func (r *UserRouter) Route(w http.ResponseWriter, req *http.Request) bool {
	switch req.URL.Path {
	case "/user/wallet/create":
		if req.Method == http.MethodPost {
			r.controller.CreateWallet(w, req)
			return true
		}
	case "/user/wallet/fund":
		if req.Method == http.MethodPost {
			r.controller.FundWallet(w, req)
			return true
		}
	case "/user/wallet/by-firebase":
		if req.Method == http.MethodGet {
			r.controller.GetWalletByFirebase(w, req)
			return true
		}
	case "/user/wallet/get":
		if req.Method == http.MethodGet {
			r.controller.GetWallet(w, req)
			return true
		}
	case "/user/wallet/transfer-rewards":
		if req.Method == http.MethodPost {
			r.controller.TransferRewards(w, req)
			return true
		}
	}

	if strings.HasPrefix(req.URL.Path, "/vendor/") {
		return false
	}

	return false
}

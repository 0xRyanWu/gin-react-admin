// internal/controller/auth_controller.go
// 身份驗證 HTTP Handler
// 負責請求解析與回應序列化，業務邏輯委派給 AuthService

package controller

import (
	"gin-react-admin/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthController 身份驗證控制器
type AuthController struct {
	authService service.AuthService
}

// NewAuthController 建立 AuthController 實例
func NewAuthController(authService service.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

// LoginRequest 登入請求 Body
type LoginRequest struct {
	Username string `json:"username" binding:"required" example:"admin"`
	Password string `json:"password" binding:"required" example:"admin123"`
}

// LoginResponse 登入成功回應
type LoginResponse struct {
	Token     string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	ExpiresIn int    `json:"expires_in" example:"86400"`
}

// Login 處理 POST /api/v1/auth/login
// @Summary      使用者登入
// @Description  驗證帳號密碼，成功時回傳 JWT Token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      LoginRequest   true  "登入資訊"
// @Success      200      {object}  LoginResponse  "登入成功"
// @Failure      400      {object}  map[string]string "請求參數不完整"
// @Failure      401      {object}  map[string]string "帳號或密碼錯誤"
// @Router       /auth/login [post]
func (c *AuthController) Login(ctx *gin.Context) {
	var req LoginRequest

	// 解析並驗證請求 Body
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "請求參數不完整",
		})
		return
	}

	// 呼叫 AuthService 執行登入邏輯
	resp, err := c.authService.Login(req.Username, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"token":      resp.Token,
		"expires_in": resp.ExpiresIn,
	})
}

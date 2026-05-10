// internal/middleware/jwt_middleware.go
// JWT 認證 Middleware
// 驗證 Authorization: Bearer <token> Header，失敗時回傳 401 並中止請求

package middleware

import (
	"gin-react-admin/pkg/config"
	pkgjwt "gin-react-admin/pkg/jwt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// JWTAuth 回傳 JWT 驗證 Middleware
func JWTAuth(cfg *config.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// 從 Authorization Header 取得 Token
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "未提供認證 Token",
			})
			return
		}

		// 驗證格式：必須為 "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Token 格式錯誤，請使用 Bearer <token>",
			})
			return
		}

		tokenStr := parts[1]

		// 解析並驗證 Token
		claims, err := pkgjwt.ParseToken(tokenStr, cfg.JWTSecret)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "無效的 Token",
			})
			return
		}

		// 將使用者資訊注入 Gin Context，供後續 Handler 與 RBAC Middleware 使用
		ctx.Set("user_id", claims.UserID)
		ctx.Set("username", claims.Username)
		ctx.Set("role", claims.Role)

		ctx.Next()
	}
}

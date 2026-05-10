// internal/middleware/rbac_middleware.go
// 角色型存取控制 (RBAC) Middleware
// 必須置於 JWTAuth middleware 之後使用，依賴 JWTAuth 注入的 "role" Context 值

package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireRole 回傳角色驗證 Middleware
// 傳入允許存取的角色清單，任一符合即通過
//
// 使用範例（路由註冊）：
//
//	adminGroup := r.Group("/admin")
//	adminGroup.Use(middleware.JWTAuth(cfg))
//	adminGroup.Use(middleware.RequireRole("superadmin"))
func RequireRole(roles ...string) gin.HandlerFunc {
	// 將允許的角色轉為 set，O(1) 查詢效率
	allowed := make(map[string]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}

	return func(ctx *gin.Context) {
		// 從 JWTAuth middleware 注入的 Context 取得角色
		role, exists := ctx.Get("role")
		if !exists {
			ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "無法取得角色資訊，請確認已通過身份驗證",
			})
			return
		}

		roleStr, ok := role.(string)
		if !ok {
			ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "角色資訊格式錯誤",
			})
			return
		}

		// 驗證角色是否在允許清單中
		if _, ok := allowed[roleStr]; !ok {
			ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "權限不足，此操作需要更高的存取等級",
			})
			return
		}

		ctx.Next()
	}
}

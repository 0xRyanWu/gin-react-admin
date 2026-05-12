// internal/router/router.go
// 路由註冊
// 將所有 Controller 的路由集中管理，清楚分隔公開與受保護路由

package router

import (
	"gin-react-admin/internal/controller"
	"gin-react-admin/internal/middleware"
	"gin-react-admin/pkg/config"
	_ "gin-react-admin/docs" // swag 自動生成的文件包（執行 make swagger 後產生）
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRouter 初始化 Gin 路由並註冊所有端點
func SetupRouter(
	cfg *config.Config,
	authCtrl *controller.AuthController,
	articleCtrl *controller.ArticleController,
	schedulerCtrl *controller.SchedulerController,
	userCtrl *controller.UserController,
) *gin.Engine {
	// 使用 gin.New() 取代 gin.Default()，手動掛載 Zap Logger 與 Recovery
	r := gin.New()
	r.Use(middleware.ZapLogger())
	r.Use(middleware.ZapRecovery())

	// Prometheus 請求指標 Middleware（全域，在所有路由生效）
	r.Use(middleware.PrometheusMiddleware())

	// 全域 CORS Middleware（允許前端跨域請求）
	r.Use(corsMiddleware())

	// 健康檢查端點（不需認證）
	r.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Prometheus 指標採集端點（不需認證，通常由 Prometheus Server 內網拉取）
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Swagger UI 文件端點（開發環境使用）
	// 訪問 http://localhost:8080/swagger/index.html
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API v1 路由群組
	v1 := r.Group("/api/v1")
	{
		// 公開路由（無需 JWT 驗證）
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authCtrl.Login)
		}

		// 受保護路由（需要有效 JWT Token）
		protected := v1.Group("")
		protected.Use(middleware.JWTAuth(cfg))
		{
			articles := protected.Group("/articles")
			{
				articles.POST("", articleCtrl.Create)
				articles.GET("", articleCtrl.List)
				articles.GET("/:id", articleCtrl.GetByID)
				articles.PUT("/:id", articleCtrl.Update)
				articles.DELETE("/:id", articleCtrl.Delete)
			}

			// 超級管理員專屬路由
			// 在 JWTAuth 之後串接 RequireRole，雙重驗證：已登入 + 擁有 superadmin 角色
			admin := protected.Group("/admin")
			admin.Use(middleware.RequireRole("superadmin"))
			{
				// 取得系統概覽（示範端點）
				admin.GET("/overview", func(ctx *gin.Context) {
					ctx.JSON(http.StatusOK, gin.H{
						"message": "Welcome, superadmin!",
						"user":    ctx.GetString("username"),
					})
				})

				// 排程管理
				admin.GET("/jobs", schedulerCtrl.ListJobs)
				admin.POST("/jobs/:type/trigger", schedulerCtrl.TriggerJob)

				// 使用者管理
				users := admin.Group("/users")
				{
					users.GET("", userCtrl.List)
					users.POST("", userCtrl.Create)
					users.GET("/:id", userCtrl.GetByID)
					users.PUT("/:id", userCtrl.Update)
					users.DELETE("/:id", userCtrl.Delete)
				}
			}
		}
	}

	return r
}

// corsMiddleware 處理跨域請求（CORS）
// 開發環境允許來自前端開發伺服器的請求
func corsMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("Access-Control-Allow-Origin", "*")
		ctx.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		ctx.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// 預檢請求直接回應 204
		if ctx.Request.Method == http.MethodOptions {
			ctx.AbortWithStatus(http.StatusNoContent)
			return
		}
		ctx.Next()
	}
}

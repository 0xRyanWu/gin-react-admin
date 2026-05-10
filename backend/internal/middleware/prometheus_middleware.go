// internal/middleware/prometheus_middleware.go
// Gin Middleware：記錄每個 HTTP 請求的 Prometheus 指標
// 統計維度：URL 路徑樣板（避免高基數）、HTTP 方法、回應狀態碼

package middleware

import (
	"fmt"
	"time"

	"gin-react-admin/pkg/metrics"

	"github.com/gin-gonic/gin"
)

// PrometheusMiddleware 攔截所有請求，記錄請求次數與耗時
func PrometheusMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		start := time.Now()

		ctx.Next()

		// 使用路由樣板（例如 /api/v1/articles/:id）避免每個 ID 都成為獨立標籤（高基數問題）
		path := ctx.FullPath()
		if path == "" {
			path = "unknown"
		}
		method := ctx.Request.Method
		status := fmt.Sprintf("%d", ctx.Writer.Status())
		duration := time.Since(start).Seconds()

		metrics.HttpRequestsTotal.WithLabelValues(path, method, status).Inc()
		metrics.HttpRequestDuration.WithLabelValues(path, method).Observe(duration)
	}
}

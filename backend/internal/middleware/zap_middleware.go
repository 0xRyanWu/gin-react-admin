// internal/middleware/zap_middleware.go
// 替換 Gin 預設 Logger 與 Recovery 的 Zap 版本
// 以 JSON 格式輸出每個 HTTP 請求的存取日誌

package middleware

import (
	"net"
	"net/http"
	"net/http/httputil"
	"os"
	"runtime/debug"
	"strings"
	"time"

	"gin-react-admin/pkg/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// ZapLogger 替換 gin.Default() 的 Logger 中介軟體
// 以 JSON 格式記錄：method、path、status、latency、client_ip、user_agent
func ZapLogger() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		start := time.Now()
		path := ctx.Request.URL.Path
		query := ctx.Request.URL.RawQuery

		ctx.Next()

		latency := time.Since(start)
		status := ctx.Writer.Status()

		fields := []zap.Field{
			zap.Int("status", status),
			zap.String("method", ctx.Request.Method),
			zap.String("path", path),
			zap.String("query", query),
			zap.String("ip", ctx.ClientIP()),
			zap.String("user_agent", ctx.Request.UserAgent()),
			zap.Duration("latency", latency),
		}

		// 若有錯誤訊息也一併記錄
		if len(ctx.Errors) > 0 {
			fields = append(fields, zap.String("errors", ctx.Errors.String()))
		}

		switch {
		case status >= http.StatusInternalServerError:
			logger.Log.Error("HTTP Request", fields...)
		case status >= http.StatusBadRequest:
			logger.Log.Warn("HTTP Request", fields...)
		default:
			logger.Log.Info("HTTP Request", fields...)
		}
	}
}

// ZapRecovery 替換 gin.Default() 的 Recovery 中介軟體
// 捕捉 panic 並以 zap 記錄完整的 stack trace，然後回傳 500
func ZapRecovery() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// 檢查是否為「連線已中斷」的 broken pipe（不需記錄 stack）
				var brokenPipe bool
				if ne, ok := err.(*net.OpError); ok {
					if se, ok := ne.Err.(*os.SyscallError); ok {
						if strings.Contains(strings.ToLower(se.Error()), "broken pipe") ||
							strings.Contains(strings.ToLower(se.Error()), "connection reset by peer") {
							brokenPipe = true
						}
					}
				}

				httpRequest, _ := httputil.DumpRequest(ctx.Request, false)

				if brokenPipe {
					logger.Log.Error("Broken pipe",
						zap.Any("error", err),
						zap.String("request", string(httpRequest)),
					)
					ctx.Error(err.(error)) //nolint:errcheck
					ctx.Abort()
					return
				}

				logger.Log.Error("Recovery from panic",
					zap.Any("error", err),
					zap.String("request", string(httpRequest)),
					zap.String("stack", string(debug.Stack())),
				)
				ctx.AbortWithStatus(http.StatusInternalServerError)
			}
		}()
		ctx.Next()
	}
}

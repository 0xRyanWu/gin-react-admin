// pkg/queue/server.go
// asynq Server 初始化：Worker，負責從 Redis 取出任務並執行 Handler

package queue

import (
	"context"
	"gin-react-admin/pkg/logger"

	"github.com/hibiken/asynq"
	"go.uber.org/zap"
)

// NewServer 建立 asynq Server（Consumer / Worker 端）
// concurrency：同時處理的任務數量
func NewServer(redisAddr string, concurrency int) *asynq.Server {
	return asynq.NewServer(
		asynq.RedisClientOpt{Addr: redisAddr},
		asynq.Config{
			Concurrency: concurrency,
			ErrorHandler: asynq.ErrorHandlerFunc(func(_ context.Context, task *asynq.Task, err error) {
				logger.Log.Error("任務執行失敗",
					zap.String("type", task.Type()),
					zap.Error(err),
				)
			}),
		},
	)
}

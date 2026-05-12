// internal/task/handlers.go
// 任務 Handler 實作
// 每個 Handler 對應一個任務類型，實際業務邏輯寫在此處

package task

import (
	"context"
	"encoding/json"
	"fmt"
	"gin-react-admin/internal/repository"
	"gin-react-admin/pkg/logger"

	"github.com/hibiken/asynq"
	"go.uber.org/zap"
)

// NewArticleStatsTask 建立「文章統計」任務（不帶 payload）
func NewArticleStatsTask() (*asynq.Task, error) {
	return asynq.NewTask(TypeArticleStats, nil), nil
}

// NewCleanupLogTask 建立「清理示範 Log」任務（不帶 payload）
func NewCleanupLogTask() (*asynq.Task, error) {
	return asynq.NewTask(TypeCleanupLog, nil), nil
}

// HandleArticleStats 執行文章統計任務
// 查詢文章總數後記錄至 Zap log
func HandleArticleStats(articleRepo repository.ArticleRepository) asynq.HandlerFunc {
	return func(ctx context.Context, t *asynq.Task) error {
		_, total, err := articleRepo.FindAll(1, 1) // 僅取總數
		if err != nil {
			return fmt.Errorf("查詢文章失敗: %w", err)
		}
		logger.Log.Info("[排程] 文章統計",
			zap.Int64("total", total),
			zap.String("task", t.Type()),
		)
		return nil
	}
}

// HandleCleanupLog 執行清理示範 Log 任務
func HandleCleanupLog() asynq.HandlerFunc {
	return func(ctx context.Context, t *asynq.Task) error {
		// 取出 payload（若有）
		var payload map[string]interface{}
		if len(t.Payload()) > 0 {
			_ = json.Unmarshal(t.Payload(), &payload)
		}
		logger.Log.Info("[排程] 清理作業完成",
			zap.String("task", t.Type()),
		)
		return nil
	}
}

// internal/task/types.go
// 定義任務名稱常數與 JobDefinition（排程管理頁使用）

package task

// 任務名稱常數（asynq task type）
const (
	TypeArticleStats = "task:article:stats"
	TypeCleanupLog   = "task:cleanup:log"
)

// JobDefinition 描述一個排程任務的靜態資訊（用於 API 回應）
type JobDefinition struct {
	ID          string `json:"id"`           // 任務名稱（即 task type）
	Name        string `json:"name"`         // 顯示名稱
	Description string `json:"description"`  // 功能說明
	CronSpec    string `json:"cron_spec"`    // Cron 表達式
}

// RegisteredJobs 所有已註冊的排程任務定義
// 新增排程任務時，在此處加入對應的 JobDefinition
var RegisteredJobs = []JobDefinition{
	{
		ID:          TypeArticleStats,
		Name:        "文章統計",
		Description: "統計資料庫中文章總數，記錄至 log",
		CronSpec:    "0 * * * *", // 每小時執行
	},
	{
		ID:          TypeCleanupLog,
		Name:        "清理示範 Log",
		Description: "輸出清理作業完成訊息（示範用途）",
		CronSpec:    "0 2 * * *", // 每日凌晨 2 點執行
	},
}

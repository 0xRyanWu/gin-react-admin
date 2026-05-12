// internal/controller/scheduler_controller.go
// 排程管理 HTTP Handler
// 提供「列出 Job」與「手動觸發 Job」兩個端點

package controller

import (
	"gin-react-admin/internal/task"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hibiken/asynq"
)

// SchedulerController 排程管理控制器
type SchedulerController struct {
	client *asynq.Client
}

// NewSchedulerController 建立 SchedulerController 實例
func NewSchedulerController(client *asynq.Client) *SchedulerController {
	return &SchedulerController{client: client}
}

// ListJobs 列出所有已註冊的排程 Job 定義
// @Summary      列出排程任務
// @Description  回傳所有已定義的排程任務資訊（名稱、說明、Cron 表達式）
// @Tags         scheduler
// @Produce      json
// @Success      200  {object}  map[string]interface{}  "任務清單"
// @Security     BearerAuth
// @Router       /admin/jobs [get]
func (c *SchedulerController) ListJobs(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"data": task.RegisteredJobs,
	})
}

// TriggerJob 手動觸發指定排程任務（立即放入佇列）
// @Summary      手動觸發排程任務
// @Description  將指定任務立即排入 Redis 佇列，由 Worker 馬上處理
// @Tags         scheduler
// @Produce      json
// @Param        type  path      string  true  "任務類型 ID"  example("task:article:stats")
// @Success      200   {object}  map[string]string  "觸發成功"
// @Failure      400   {object}  map[string]string  "任務類型不存在"
// @Failure      500   {object}  map[string]string  "排入佇列失敗"
// @Security     BearerAuth
// @Router       /admin/jobs/{type}/trigger [post]
func (c *SchedulerController) TriggerJob(ctx *gin.Context) {
	jobType := ctx.Param("type")

	// 查找對應的 JobDefinition
	var found bool
	for _, j := range task.RegisteredJobs {
		if j.ID == jobType {
			found = true
			break
		}
	}
	if !found {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "任務類型不存在：" + jobType,
		})
		return
	}

	// 建立任務並排入佇列（立即執行）
	t := asynq.NewTask(jobType, nil)
	if _, err := c.client.Enqueue(t); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "排入佇列失敗：" + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "任務已排入佇列",
		"type":    jobType,
	})
}

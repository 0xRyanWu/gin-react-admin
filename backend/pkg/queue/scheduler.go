// pkg/queue/scheduler.go
// asynq Scheduler 初始化：Cron 排程，定時將任務推入佇列

package queue

import "github.com/hibiken/asynq"

// NewScheduler 建立 asynq Scheduler
// 使用與 Server 相同的 Redis 連線
func NewScheduler(redisAddr string) *asynq.Scheduler {
	return asynq.NewScheduler(
		asynq.RedisClientOpt{Addr: redisAddr},
		&asynq.SchedulerOpts{},
	)
}

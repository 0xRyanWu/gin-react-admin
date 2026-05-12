// pkg/queue/client.go
// asynq Client 初始化：用於將任務排入 Redis 佇列（Enqueue）

package queue

import "github.com/hibiken/asynq"

// NewClient 建立 asynq Client（Producer 端）
// 呼叫端負責在程式結束時呼叫 client.Close()
func NewClient(redisAddr string) *asynq.Client {
	return asynq.NewClient(asynq.RedisClientOpt{Addr: redisAddr})
}

// cmd/server/main.go
// 應用程式入口
// 初始化順序：logger → config → database → AutoMigrate → seed → asynq → router → HTTP Server

// @title           後台管理系統 API
// @version         1.0
// @description     Gin + React 前後端分離後台管理系統 API 文件
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support

// @license.name  MIT

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description 格式：Bearer {token}

package main

import (
	"context"
	"fmt"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"gin-react-admin/internal/controller"
	"gin-react-admin/internal/model"
	"gin-react-admin/internal/repository"
	"gin-react-admin/internal/router"
	"gin-react-admin/internal/service"
	"gin-react-admin/internal/task"
	"gin-react-admin/pkg/config"
	"gin-react-admin/pkg/database"
	"gin-react-admin/pkg/logger"
	"gin-react-admin/pkg/queue"

	"github.com/hibiken/asynq"
	"go.uber.org/zap"
)

func main() {
	// 0. 初始化 Zap Logger（必須最先執行，後續所有日誌依賴它）
	logger.Init(logger.IsDevelopment())
	defer logger.Sync()

	// 1. 載入設定（缺少 JWT_SECRET 時會直接 Fatal）
	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		logger.Log.Fatal("設定驗證失敗", zap.Error(err))
	}

	// 2. 初始化資料庫連線
	db := database.Connect(cfg.DBdsn)

	// 3. 自動遷移資料表結構
	if err := db.AutoMigrate(&model.User{}, &model.Article{}); err != nil {
		logger.Log.Fatal("資料庫遷移失敗", zap.Error(err))
	}
	logger.Log.Info("資料庫結構遷移完成")

	// 4. 初始化依賴（Repository → Service → Controller）
	userRepo := repository.NewUserRepository(db)
	articleRepo := repository.NewArticleRepository(db)

	// 5. 建立預設測試使用者（admin / admin123）
	service.SeedDefaultUser(userRepo)

	authSvc := service.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTExpireHours)
	articleSvc := service.NewArticleService(articleRepo)
	userSvc := service.NewUserService(userRepo)

	authCtrl := controller.NewAuthController(authSvc)
	articleCtrl := controller.NewArticleController(articleSvc)
	userCtrl := controller.NewUserController(userSvc)

	// 6. 初始化 asynq（Client / Server / Scheduler）
	asynqClient := queue.NewClient(cfg.RedisAddr)
	defer asynqClient.Close()

	asynqServer := queue.NewServer(cfg.RedisAddr, 10)

	// 6a. 註冊任務 Handler（任務類型 → 執行函式）
	mux := setupTaskMux(articleRepo)

	// 6b. 啟動 Worker（背景 goroutine）
	go func() {
		if err := asynqServer.Run(mux); err != nil {
			logger.Log.Error("asynq Worker 異常停止", zap.Error(err))
		}
	}()
	logger.Log.Info("asynq Worker 已啟動", zap.String("redis", cfg.RedisAddr))

	// 6c. 設定並啟動 Cron Scheduler（背景 goroutine）
	scheduler := queue.NewScheduler(cfg.RedisAddr)
	for _, job := range task.RegisteredJobs {
		t, err := asynqTaskFactory(job.ID)
		if err != nil {
			logger.Log.Warn("排程任務建立失敗，略過",
				zap.String("id", job.ID), zap.Error(err))
			continue
		}
		if _, err := scheduler.Register(job.CronSpec, t); err != nil {
			logger.Log.Warn("排程任務註冊失敗",
				zap.String("id", job.ID), zap.Error(err))
		} else {
			logger.Log.Info("排程任務已註冊",
				zap.String("id", job.ID),
				zap.String("cron", job.CronSpec))
		}
	}
	go func() {
		if err := scheduler.Run(); err != nil {
			logger.Log.Error("asynq Scheduler 異常停止", zap.Error(err))
		}
	}()
	logger.Log.Info("asynq Scheduler 已啟動")

	// 7. 建立 SchedulerController 並設定路由
	schedulerCtrl := controller.NewSchedulerController(asynqClient)
	r := router.SetupRouter(cfg, authCtrl, articleCtrl, schedulerCtrl, userCtrl)

	// 8. 啟動 HTTP Server（使用 net/http.Server 以支援優雅關閉）
	addr := fmt.Sprintf(":%s", cfg.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	// 8a. 背景啟動 HTTP Server
	go func() {
		logger.Log.Info("後端伺服器啟動", zap.String("addr", "http://localhost"+addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Log.Fatal("伺服器啟動失敗", zap.Error(err))
		}
	}()

	// 8b. 等待 OS 終止信號（Ctrl+C = SIGINT，docker stop = SIGTERM）
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()

	logger.Log.Info("收到終止信號，開始優雅關閉...")

	// 8c. 給予 10 秒讓進行中的請求完成
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Log.Error("HTTP Server 關閉失敗", zap.Error(err))
	} else {
		logger.Log.Info("HTTP Server 已關閉")
	}

	// 8d. 關閉 asynq Worker 與 Scheduler
	asynqServer.Shutdown()
	scheduler.Shutdown()
	logger.Log.Info("asynq Worker / Scheduler 已關閉")

	logger.Log.Info("伺服器已完全停止")
}

// setupTaskMux 建立 asynq ServeMux，將任務類型對應到 Handler
func setupTaskMux(articleRepo repository.ArticleRepository) *asynq.ServeMux {
	mux := asynq.NewServeMux()
	mux.HandleFunc(task.TypeArticleStats, task.HandleArticleStats(articleRepo))
	mux.HandleFunc(task.TypeCleanupLog, task.HandleCleanupLog())
	return mux
}

// asynqTaskFactory 根據任務 ID 建立對應的 asynq.Task
func asynqTaskFactory(id string) (*asynq.Task, error) {
	switch id {
	case task.TypeArticleStats:
		return task.NewArticleStatsTask()
	case task.TypeCleanupLog:
		return task.NewCleanupLogTask()
	default:
		return nil, fmt.Errorf("未知的任務類型：%s", id)
	}
}


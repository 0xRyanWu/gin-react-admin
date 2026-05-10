// cmd/server/main.go
// 應用程式入口
// 初始化順序：logger → config → database → AutoMigrate → seed → router → HTTP Server

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
	"fmt"
	"gin-react-admin/internal/controller"
	"gin-react-admin/internal/model"
	"gin-react-admin/internal/repository"
	"gin-react-admin/internal/router"
	"gin-react-admin/internal/service"
	"gin-react-admin/pkg/config"
	"gin-react-admin/pkg/database"
	"gin-react-admin/pkg/logger"

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

	authCtrl := controller.NewAuthController(authSvc)
	articleCtrl := controller.NewArticleController(articleSvc)

	// 6. 設定路由
	r := router.SetupRouter(cfg, authCtrl, articleCtrl)

	// 7. 啟動 HTTP Server
	addr := fmt.Sprintf(":%s", cfg.Port)
	logger.Log.Info("後端伺服器啟動", zap.String("addr", "http://localhost"+addr))
	if err := r.Run(addr); err != nil {
		logger.Log.Fatal("伺服器啟動失敗", zap.Error(err))
	}
}

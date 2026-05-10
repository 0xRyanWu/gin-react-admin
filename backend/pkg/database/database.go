// pkg/database/database.go
// 負責初始化 GORM PostgreSQL 資料庫連線
// 連線失敗時輸出錯誤並退出應用程式

package database

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB 全域資料庫連線實例
var DB *gorm.DB

// Connect 建立 PostgreSQL 連線並初始化全域 DB 實例
func Connect(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		// 開發環境顯示 SQL 日誌，Production 可改為 logger.Silent
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("資料庫連線失敗：%v", err)
	}

	// 取得底層 *sql.DB 進行連線池設定
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("無法取得底層資料庫連線：%v", err)
	}

	// 連線池設定
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	log.Println("資料庫連線成功")
	DB = db
	return db
}

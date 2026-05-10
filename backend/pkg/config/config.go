// pkg/config/config.go
// 負責從 .env 檔案或環境變數讀取應用程式設定
// 缺少必要設定時終止應用程式啟動

package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config 儲存所有應用程式設定
type Config struct {
	Port            string
	DBdsn           string
	JWTSecret       string
	JWTExpireHours  int
}

// Load 讀取環境變數並回傳 Config
// 優先載入 .env 檔案（開發環境），Production 環境直接設定環境變數即可
func Load() *Config {
	// 按優先順序嘗試載入 .env：
	//   1. 當前工作目錄（從 backend/ 執行時對應 backend/.env）
	//   2. 父目錄（從 backend/ 執行時對應專案根目錄 .env）
	// 任一成功即停止；都不存在時（Production 環境）直接讀取系統環境變數
	loaded := false
	for _, path := range []string{".env", "../.env"} {
		if err := godotenv.Load(path); err == nil {
			log.Printf("已載入環境變數檔案：%s", path)
			loaded = true
			break
		}
	}
	if !loaded {
		log.Println("未找到 .env 檔案，將直接讀取系統環境變數")
	}

	// JWT_SECRET 為必要設定，缺少時立即終止
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("環境變數 JWT_SECRET 未設定，應用程式無法啟動")
	}

	expireHours := 24
	if h := os.Getenv("JWT_EXPIRE_HOURS"); h != "" {
		if parsed, err := strconv.Atoi(h); err == nil && parsed > 0 {
			expireHours = parsed
		}
	}

	return &Config{
		Port:           getEnvOrDefault("PORT", "8080"),
		DBdsn:          getEnvOrDefault("DB_DSN", ""),
		JWTSecret:      jwtSecret,
		JWTExpireHours: expireHours,
	}
}

// getEnvOrDefault 讀取環境變數，若不存在則回傳預設值
func getEnvOrDefault(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

// Validate 驗證必要設定是否齊全
func (c *Config) Validate() error {
	if c.DBdsn == "" {
		return fmt.Errorf("環境變數 DB_DSN 未設定")
	}
	return nil
}

// pkg/logger/logger.go
// 初始化全域 Zap Logger（JSON 格式，適合 ELK / 日誌分析系統串接）
// 使用方式：logger.Log.Info("訊息", zap.String("key", "value"))

package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Log 是全域 Logger 實例，在 Init() 之後即可使用
var Log *zap.Logger

// Init 初始化 Logger，依據環境選擇輸出格式
// development=true 時：human-friendly 格式（彩色 console）
// development=false 時：JSON 格式（Production，適合機器解析）
func Init(development bool) {
	var err error

	if development {
		cfg := zap.NewDevelopmentConfig()
		cfg.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		Log, err = cfg.Build()
	} else {
		cfg := zap.NewProductionConfig()
		cfg.EncoderConfig.TimeKey = "ts"
		cfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		Log, err = cfg.Build()
	}

	if err != nil {
		// 初始化失敗時回退到基本 logger 避免 nil panic
		Log = zap.NewExample()
		Log.Error("Zap logger 初始化失敗，使用 fallback logger", zap.Error(err))
		return
	}

	// 同步替換全域 zap.L() 與標準庫 log 的輸出
	zap.ReplaceGlobals(Log)
	zap.RedirectStdLog(Log)
}

// Sync 在程式結束前呼叫，確保緩衝的日誌已寫出
// 用法：defer logger.Sync()
func Sync() {
	if Log != nil {
		_ = Log.Sync()
	}
}

// isDevelopment 判斷當前是否為開發環境（GIN_MODE != release）
func IsDevelopment() bool {
	return os.Getenv("GIN_MODE") != "release"
}

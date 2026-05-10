// internal/model/article.go
// Article GORM 資料模型定義，含軟刪除支援

package model

import (
	"time"

	"gorm.io/gorm"
)

// Article 文章資料模型（CRUD 範例實體）
type Article struct {
	ID        uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Title     string         `gorm:"not null;size:255" json:"title"`
	Content   string         `gorm:"type:text" json:"content"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	// DeletedAt 啟用 GORM 軟刪除功能（刪除時記錄時間戳，不實際移除資料）
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 指定資料表名稱
func (Article) TableName() string {
	return "articles"
}

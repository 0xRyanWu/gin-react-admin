// internal/model/user.go
// User GORM 資料模型定義

package model

import (
	"time"
)

// Role 定義系統角色類型
type Role string

const (
	RoleSuperAdmin Role = "superadmin"
	RoleUser       Role = "user"
)

// User 使用者資料模型
type User struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Username     string    `gorm:"uniqueIndex;not null;size:50" json:"username"`
	PasswordHash string    `gorm:"not null" json:"-"` // 密碼雜湊值，不輸出至 JSON
	// Role 角色欄位：決定使用者的存取權限等級
	// 預設為 'user'，只有透過後台指定才能設為 'superadmin'
	Role         Role      `gorm:"not null;default:'user';size:20" json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// TableName 指定資料表名稱
func (User) TableName() string {
	return "users"
}

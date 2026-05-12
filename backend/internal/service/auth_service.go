// internal/service/auth_service.go
// 身份驗證業務邏輯層
// 負責驗證使用者密碼並生成 JWT Token

package service

import (
	"errors"
	"gin-react-admin/internal/model"
	"gin-react-admin/internal/repository"
	pkgjwt "gin-react-admin/pkg/jwt"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// LoginResponse 登入成功回傳資料
type LoginResponse struct {
	Token     string `json:"token"`
	ExpiresIn int    `json:"expires_in"` // Token 有效秒數
	Role      string `json:"role"`
}

// AuthService 定義身份驗證業務介面
type AuthService interface {
	Login(username, password string) (*LoginResponse, error)
}

// authService 實作 AuthService
type authService struct {
	userRepo    repository.UserRepository
	jwtSecret   string
	expireHours int
}

// NewAuthService 建立 AuthService 實例
func NewAuthService(userRepo repository.UserRepository, jwtSecret string, expireHours int) AuthService {
	return &authService{
		userRepo:    userRepo,
		jwtSecret:   jwtSecret,
		expireHours: expireHours,
	}
}

// Login 驗證使用者帳密，成功則回傳 JWT Token
func (s *authService) Login(username, password string) (*LoginResponse, error) {
	// 查詢使用者是否存在
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 帳號不存在，回傳通用錯誤（避免使用者枚舉攻擊）
			return nil, errors.New("帳號或密碼錯誤")
		}
		return nil, err
	}

	// 驗證密碼雜湊值（bcrypt 比對）
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("帳號或密碼錯誤")
	}

	// 生成 JWT Token（包含角色資訊）
	token, err := pkgjwt.GenerateToken(user.ID, user.Username, string(user.Role), s.jwtSecret, s.expireHours)
	if err != nil {
		return nil, errors.New("Token 生成失敗")
	}

	return &LoginResponse{
		Token:     token,
		ExpiresIn: s.expireHours * 3600,
		Role:      string(user.Role),
	}, nil
}

// HashPassword 工具函式：生成 bcrypt 密碼雜湊（供 seed 資料使用）
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// SeedDefaultUser 建立預設測試使用者（若不存在）
func SeedDefaultUser(userRepo repository.UserRepository) {
	_, err := userRepo.FindByUsername("admin")
	if err == nil {
		return // 已存在，跳過
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return
	}

	hash, err := HashPassword("admin123")
	if err != nil {
		return
	}

	userRepo.Create(&model.User{
		Username:     "admin",
		PasswordHash: hash,
		Role:         model.RoleSuperAdmin, // 預設管理員帳號設為超級管理員
	})
}

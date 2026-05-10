// pkg/jwt/jwt.go
// JWT 工具函式：生成與驗證 Token
// 使用 HS256 演算法 + 環境變數 JWT_SECRET 簽名

package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims 自定義 JWT Claims，嵌入標準 RegisteredClaims
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"` // 角色資訊，避免每次請求查詢資料庫
	jwt.RegisteredClaims
}

// GenerateToken 根據使用者 ID、名稱與角色生成 JWT Token
func GenerateToken(userID uint, username, role, secret string, expireHours int) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			// 設定 Token 過期時間
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expireHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ParseToken 解析並驗證 JWT Token，回傳 Claims
func ParseToken(tokenStr, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// 確保簽名演算法為 HS256，防止演算法替換攻擊
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("無效的簽名演算法")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("無效的 Token")
	}
	return claims, nil
}

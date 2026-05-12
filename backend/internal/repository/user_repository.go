// internal/repository/user_repository.go
// 使用者資料存取層（Repository Pattern）
// 封裝所有與 users 資料表的 GORM 操作

package repository

import (
	"gin-react-admin/internal/model"

	"gorm.io/gorm"
)

// UserRepository 定義使用者資料存取介面
type UserRepository interface {
	FindByUsername(username string) (*model.User, error)
	FindByID(id uint) (*model.User, error)
	FindAll(page, pageSize int) ([]model.User, int64, error)
	Create(user *model.User) error
	Update(user *model.User) error
	Delete(id uint) error
}

// userRepository 實作 UserRepository
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository 建立 UserRepository 實例
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// FindByUsername 根據使用者名稱查詢使用者
func (r *userRepository) FindByUsername(username string) (*model.User, error) {
	var user model.User
	result := r.db.Where("username = ?", username).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// FindByID 根據使用者 ID 查詢使用者
func (r *userRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	result := r.db.First(&user, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// FindAll 查詢所有使用者（分頁），回傳資料列表與總筆數
func (r *userRepository) FindAll(page, pageSize int) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	offset := (page - 1) * pageSize
	if err := r.db.Model(&model.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := r.db.Offset(offset).Limit(pageSize).Order("id asc").Find(&users).Error; err != nil {
		return nil, 0, err
	}
	return users, total, nil
}

// Create 新增使用者
func (r *userRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

// Update 更新使用者資料（只更新非零值欄位）
func (r *userRepository) Update(user *model.User) error {
	return r.db.Save(user).Error
}

// Delete 刪除使用者（hard delete）
func (r *userRepository) Delete(id uint) error {
	return r.db.Delete(&model.User{}, id).Error
}

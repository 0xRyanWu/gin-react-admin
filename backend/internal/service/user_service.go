// internal/service/user_service.go
// 使用者管理業務邏輯層
// 提供 CRUD 操作，供 UserController 使用（superadmin 限定）

package service

import (
	"errors"
	"gin-react-admin/internal/model"
	"gin-react-admin/internal/repository"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserListResponse 使用者分頁列表回應
type UserListResponse struct {
	Data     []model.User `json:"data"`
	Total    int64        `json:"total"`
	Page     int          `json:"page"`
	PageSize int          `json:"page_size"`
}

// CreateUserRequest 新增使用者請求
type CreateUserRequest struct {
	Username string     `json:"username" binding:"required,min=2,max=50"`
	Password string     `json:"password" binding:"required,min=6"`
	Role     model.Role `json:"role"`
}

// UpdateUserRequest 更新使用者請求（所有欄位選填）
type UpdateUserRequest struct {
	Username string     `json:"username" binding:"omitempty,min=2,max=50"`
	Password string     `json:"password" binding:"omitempty,min=6"` // 空字串表示不更新密碼
	Role     model.Role `json:"role"`
}

// UserService 定義使用者管理業務介面
type UserService interface {
	List(page, pageSize int) (*UserListResponse, error)
	GetByID(id uint) (*model.User, error)
	Create(req *CreateUserRequest) (*model.User, error)
	Update(id uint, req *UpdateUserRequest) (*model.User, error)
	Delete(id uint, currentUserID uint) error
}

// userService 實作 UserService
type userService struct {
	userRepo repository.UserRepository
}

// NewUserService 建立 UserService 實例
func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

// List 查詢使用者列表（分頁）
func (s *userService) List(page, pageSize int) (*UserListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	users, total, err := s.userRepo.FindAll(page, pageSize)
	if err != nil {
		return nil, err
	}
	return &UserListResponse{
		Data:     users,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// GetByID 查詢單筆使用者
func (s *userService) GetByID(id uint) (*model.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}
	return user, nil
}

// Create 新增使用者
func (s *userService) Create(req *CreateUserRequest) (*model.User, error) {
	// 確認 username 是否重複
	if _, err := s.userRepo.FindByUsername(req.Username); err == nil {
		return nil, errors.New("使用者名稱已存在")
	}

	// 設定預設角色
	role := req.Role
	if role == "" {
		role = model.RoleUser
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("密碼雜湊失敗")
	}

	user := &model.User{
		Username:     req.Username,
		PasswordHash: string(hash),
		Role:         role,
	}
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}
	return user, nil
}

// Update 更新使用者資料
func (s *userService) Update(id uint, req *UpdateUserRequest) (*model.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 更新 username（若有提供且不重複）
	if req.Username != "" && req.Username != user.Username {
		if _, err := s.userRepo.FindByUsername(req.Username); err == nil {
			return nil, errors.New("使用者名稱已存在")
		}
		user.Username = req.Username
	}

	// 更新角色（若有提供）
	if req.Role != "" {
		user.Role = req.Role
	}

	// 更新密碼（若有提供）
	if req.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, errors.New("密碼雜湊失敗")
		}
		user.PasswordHash = string(hash)
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}
	return user, nil
}

// Delete 刪除使用者（防止刪除自身）
func (s *userService) Delete(id uint, currentUserID uint) error {
	if id == currentUserID {
		return errors.New("不可刪除目前登入中的帳號")
	}
	if _, err := s.userRepo.FindByID(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("使用者不存在")
		}
		return err
	}
	return s.userRepo.Delete(id)
}

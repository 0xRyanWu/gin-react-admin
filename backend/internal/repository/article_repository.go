// internal/repository/article_repository.go
// 文章資料存取層（Repository Pattern）
// 封裝所有與 articles 資料表的 GORM 操作

package repository

import (
	"gin-react-admin/internal/model"

	"gorm.io/gorm"
)

// ArticleRepository 定義文章資料存取介面
type ArticleRepository interface {
	Create(article *model.Article) error
	FindAll(page, pageSize int) ([]model.Article, int64, error)
	FindByID(id uint) (*model.Article, error)
	Update(article *model.Article) error
	Delete(id uint) error
}

// articleRepository 實作 ArticleRepository
type articleRepository struct {
	db *gorm.DB
}

// NewArticleRepository 建立 ArticleRepository 實例
func NewArticleRepository(db *gorm.DB) ArticleRepository {
	return &articleRepository{db: db}
}

// Create 新增文章
func (r *articleRepository) Create(article *model.Article) error {
	return r.db.Create(article).Error
}

// FindAll 取得文章列表（支援分頁）
func (r *articleRepository) FindAll(page, pageSize int) ([]model.Article, int64, error) {
	var articles []model.Article
	var total int64

	// 先計算總筆數（不含分頁）
	if err := r.db.Model(&model.Article{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 計算 offset 並查詢分頁資料
	offset := (page - 1) * pageSize
	result := r.db.Order("created_at DESC").Limit(pageSize).Offset(offset).Find(&articles)
	return articles, total, result.Error
}

// FindByID 根據 ID 查詢文章
func (r *articleRepository) FindByID(id uint) (*model.Article, error) {
	var article model.Article
	result := r.db.First(&article, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &article, nil
}

// Update 更新文章
func (r *articleRepository) Update(article *model.Article) error {
	// 使用 Save 更新所有欄位
	return r.db.Save(article).Error
}

// Delete 軟刪除文章（設定 deleted_at，不實際移除資料）
func (r *articleRepository) Delete(id uint) error {
	return r.db.Delete(&model.Article{}, id).Error
}

// internal/service/article_service.go
// 文章業務邏輯層
// 封裝 CRUD 業務規則，呼叫 Repository 進行資料存取

package service

import (
	"errors"
	"gin-react-admin/internal/model"
	"gin-react-admin/internal/repository"

	"gorm.io/gorm"
)

// ArticleListResponse 文章列表回應（含分頁資訊）
type ArticleListResponse struct {
	Data  []model.Article `json:"data"`
	Total int64           `json:"total"`
	Page  int             `json:"page"`
	PageSize int          `json:"page_size"`
}

// ArticleService 定義文章業務介面
type ArticleService interface {
	Create(title, content string) (*model.Article, error)
	GetList(page, pageSize int) (*ArticleListResponse, error)
	GetByID(id uint) (*model.Article, error)
	Update(id uint, title, content string) (*model.Article, error)
	Delete(id uint) error
}

// articleService 實作 ArticleService
type articleService struct {
	articleRepo repository.ArticleRepository
}

// NewArticleService 建立 ArticleService 實例
func NewArticleService(articleRepo repository.ArticleRepository) ArticleService {
	return &articleService{articleRepo: articleRepo}
}

// Create 新增文章
func (s *articleService) Create(title, content string) (*model.Article, error) {
	article := &model.Article{
		Title:   title,
		Content: content,
	}
	if err := s.articleRepo.Create(article); err != nil {
		return nil, err
	}
	return article, nil
}

// GetList 取得文章分頁列表
func (s *articleService) GetList(page, pageSize int) (*ArticleListResponse, error) {
	// 設定合理的分頁邊界
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	articles, total, err := s.articleRepo.FindAll(page, pageSize)
	if err != nil {
		return nil, err
	}

	return &ArticleListResponse{
		Data:     articles,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// GetByID 根據 ID 取得文章
func (s *articleService) GetByID(id uint) (*model.Article, error) {
	article, err := s.articleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("文章不存在")
		}
		return nil, err
	}
	return article, nil
}

// Update 更新文章內容
func (s *articleService) Update(id uint, title, content string) (*model.Article, error) {
	article, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	// 只更新有提供的欄位
	if title != "" {
		article.Title = title
	}
	if content != "" {
		article.Content = content
	}

	if err := s.articleRepo.Update(article); err != nil {
		return nil, err
	}
	return article, nil
}

// Delete 軟刪除文章
func (s *articleService) Delete(id uint) error {
	// 先確認文章存在
	if _, err := s.GetByID(id); err != nil {
		return err
	}
	return s.articleRepo.Delete(id)
}

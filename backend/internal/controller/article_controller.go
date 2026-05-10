// internal/controller/article_controller.go
// 文章 CRUD HTTP Handler
// 負責請求解析、參數驗證與回應序列化

package controller

import (
	"gin-react-admin/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ArticleController 文章控制器
type ArticleController struct {
	articleService service.ArticleService
}

// NewArticleController 建立 ArticleController 實例
func NewArticleController(articleService service.ArticleService) *ArticleController {
	return &ArticleController{articleService: articleService}
}

// CreateArticleRequest 新增文章請求 Body
type CreateArticleRequest struct {
	Title   string `json:"title" binding:"required,min=1,max=255" example:"文章標題"`
	Content string `json:"content" example:"文章內容"`
}

// UpdateArticleRequest 更新文章請求 Body
type UpdateArticleRequest struct {
	Title   string `json:"title" binding:"omitempty,min=1,max=255" example:"更新後的標題"`
	Content string `json:"content" example:"更新後的內容"`
}

// Create 處理 POST /api/v1/articles
// @Summary      新增文章
// @Description  建立一篇新文章
// @Tags         articles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      CreateArticleRequest  true  "文章內容"
// @Success      201      {object}  map[string]interface{} "新增成功"
// @Failure      400      {object}  map[string]string "請求參數錯誤"
// @Failure      401      {object}  map[string]string "未授權"
// @Failure      500      {object}  map[string]string "伺服器錯誤"
// @Router       /articles [post]
func (c *ArticleController) Create(ctx *gin.Context) {
	var req CreateArticleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	article, err := c.articleService.Create(req.Title, req.Content)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "新增文章失敗"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": article})
}

// List 處理 GET /api/v1/articles
// @Summary      取得文章列表
// @Description  分頁查詢文章列表
// @Tags         articles
// @Produce      json
// @Security     BearerAuth
// @Param        page       query     int  false  "頁碼（預設 1）"       default(1)
// @Param        page_size  query     int  false  "每頁筆數（預設 10）"  default(10)
// @Success      200        {object}  map[string]interface{} "文章列表與分頁資訊"
// @Failure      401        {object}  map[string]string "未授權"
// @Failure      500        {object}  map[string]string "伺服器錯誤"
// @Router       /articles [get]
func (c *ArticleController) List(ctx *gin.Context) {
	// 解析分頁參數，提供預設值
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "10"))

	result, err := c.articleService.GetList(page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "查詢文章列表失敗"})
		return
	}

	ctx.JSON(http.StatusOK, result)
}

// GetByID 處理 GET /api/v1/articles/:id
// @Summary      取得單篇文章
// @Description  依 ID 查詢文章詳情
// @Tags         articles
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "文章 ID"
// @Success      200  {object}  map[string]interface{} "文章資料"
// @Failure      400  {object}  map[string]string "無效的 ID"
// @Failure      401  {object}  map[string]string "未授權"
// @Failure      404  {object}  map[string]string "文章不存在"
// @Router       /articles/{id} [get]
func (c *ArticleController) GetByID(ctx *gin.Context) {
	id, err := parseUintParam(ctx, "id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "無效的 ID 格式"})
		return
	}

	article, err := c.articleService.GetByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": article})
}

// Update 處理 PUT /api/v1/articles/:id
// @Summary      更新文章
// @Description  依 ID 更新文章標題或內容
// @Tags         articles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      int                   true  "文章 ID"
// @Param        request  body      UpdateArticleRequest  true  "更新內容"
// @Success      200      {object}  map[string]interface{} "更新後的文章"
// @Failure      400      {object}  map[string]string "請求參數錯誤"
// @Failure      401      {object}  map[string]string "未授權"
// @Failure      404      {object}  map[string]string "文章不存在"
// @Failure      500      {object}  map[string]string "伺服器錯誤"
// @Router       /articles/{id} [put]
func (c *ArticleController) Update(ctx *gin.Context) {
	id, err := parseUintParam(ctx, "id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "無效的 ID 格式"})
		return
	}

	var req UpdateArticleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	article, err := c.articleService.Update(id, req.Title, req.Content)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "文章不存在" {
			status = http.StatusNotFound
		}
		ctx.JSON(status, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": article})
}

// Delete 處理 DELETE /api/v1/articles/:id
// @Summary      刪除文章
// @Description  依 ID 軟刪除文章（資料保留，僅標記刪除時間）
// @Tags         articles
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "文章 ID"
// @Success      200  {object}  map[string]string "刪除成功"
// @Failure      400  {object}  map[string]string "無效的 ID"
// @Failure      401  {object}  map[string]string "未授權"
// @Failure      404  {object}  map[string]string "文章不存在"
// @Failure      500  {object}  map[string]string "伺服器錯誤"
// @Router       /articles/{id} [delete]
func (c *ArticleController) Delete(ctx *gin.Context) {
	id, err := parseUintParam(ctx, "id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "無效的 ID 格式"})
		return
	}

	if err := c.articleService.Delete(id); err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "文章不存在" {
			status = http.StatusNotFound
		}
		ctx.JSON(status, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "刪除成功"})
}

// parseUintParam 從路由參數解析 uint 類型的 ID
func parseUintParam(ctx *gin.Context, param string) (uint, error) {
	id, err := strconv.ParseUint(ctx.Param(param), 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

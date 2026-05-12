// internal/controller/user_controller.go
// 使用者管理 HTTP Handler（superadmin 限定）
// 提供使用者 CRUD：列表、查詢、新增、更新、刪除

package controller

import (
	"net/http"
	"strconv"

	"gin-react-admin/internal/service"

	"github.com/gin-gonic/gin"
)

// UserController 使用者管理控制器
type UserController struct {
	userSvc service.UserService
}

// NewUserController 建立 UserController 實例
func NewUserController(userSvc service.UserService) *UserController {
	return &UserController{userSvc: userSvc}
}

// List 列出所有使用者（分頁）
// @Summary      列出使用者
// @Tags         users
// @Security     BearerAuth
// @Param        page      query  int  false  "頁碼（預設 1）"
// @Param        page_size query  int  false  "每頁筆數（預設 10）"
// @Success      200  {object}  service.UserListResponse
// @Failure      500  {object}  map[string]string
// @Router       /admin/users [get]
func (c *UserController) List(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "10"))

	resp, err := c.userSvc.List(page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, resp)
}

// GetByID 查詢單筆使用者
// @Summary      查詢使用者
// @Tags         users
// @Security     BearerAuth
// @Param        id   path  int  true  "使用者 ID"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /admin/users/{id} [get]
func (c *UserController) GetByID(ctx *gin.Context) {
	id, err := parseUintParam(ctx, "id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "無效的 ID"})
		return
	}

	user, err := c.userSvc.GetByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": user})
}

// Create 新增使用者
// @Summary      新增使用者
// @Tags         users
// @Security     BearerAuth
// @Param        body  body  service.CreateUserRequest  true  "使用者資料"
// @Success      201   {object}  map[string]interface{}
// @Failure      400   {object}  map[string]string
// @Failure      409   {object}  map[string]string
// @Router       /admin/users [post]
func (c *UserController) Create(ctx *gin.Context) {
	var req service.CreateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := c.userSvc.Create(&req)
	if err != nil {
		if err.Error() == "使用者名稱已存在" {
			ctx.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"data": user})
}

// Update 更新使用者資料
// @Summary      更新使用者
// @Tags         users
// @Security     BearerAuth
// @Param        id    path  int                        true  "使用者 ID"
// @Param        body  body  service.UpdateUserRequest  true  "更新資料"
// @Success      200   {object}  map[string]interface{}
// @Failure      400   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Router       /admin/users/{id} [put]
func (c *UserController) Update(ctx *gin.Context) {
	id, err := parseUintParam(ctx, "id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "無效的 ID"})
		return
	}

	var req service.UpdateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := c.userSvc.Update(id, &req)
	if err != nil {
		switch err.Error() {
		case "使用者不存在":
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case "使用者名稱已存在":
			ctx.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		default:
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": user})
}

// Delete 刪除使用者
// @Summary      刪除使用者
// @Tags         users
// @Security     BearerAuth
// @Param        id  path  int  true  "使用者 ID"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /admin/users/{id} [delete]
func (c *UserController) Delete(ctx *gin.Context) {
	id, err := parseUintParam(ctx, "id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "無效的 ID"})
		return
	}

	// 從 JWT context 取得目前登入使用者 ID，防止刪除自身
	currentUserID := ctx.GetUint("user_id")

	if err := c.userSvc.Delete(id, currentUserID); err != nil {
		switch err.Error() {
		case "使用者不存在":
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case "不可刪除目前登入中的帳號":
			ctx.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		default:
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "使用者已刪除"})
}

# Copilot 專案指引

這份文件幫助 AI 快速理解本專案的架構、慣例與技術決策。

## 專案概述

**gin-react-admin** — 前後端分離的後台管理系統模板。
- 後端：Go + Gin + GORM + PostgreSQL
- 前端：React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- 本地基礎設施：Docker Compose（PostgreSQL）

## 目錄結構

```
gin-react-admin/
├── backend/                  # Go 後端
│   ├── cmd/server/main.go    # 入口；含 Swagger 全域 @ 註解
│   ├── internal/
│   │   ├── controller/       # HTTP Handler（Gin）
│   │   ├── service/          # 業務邏輯
│   │   ├── repository/       # 資料存取（GORM）
│   │   ├── model/            # GORM 資料模型
│   │   ├── middleware/       # Gin Middleware（JWT、RBAC、Zap、Prometheus）
│   │   └── router/           # 路由集中管理
│   ├── pkg/
│   │   ├── config/           # 環境變數讀取（多路徑 .env）
│   │   ├── database/         # GORM 連線初始化
│   │   ├── jwt/              # JWT 工具（含 role claim）
│   │   ├── logger/           # Uber Zap 初始化
│   │   └── metrics/          # Prometheus 指標定義
│   ├── docs/                 # swag 自動生成（make swagger）
│   └── Makefile              # make swagger / build / run / tidy
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/layout/ # AdminLayout、Sidebar、Header
│   │   ├── pages/auth/        # LoginPage（含暗黑模式切換）
│   │   ├── pages/dashboard/   # DashboardPage
│   │   ├── router/            # React Router v6 + ProtectedRoute
│   │   ├── store/             # Zustand（authStore、themeStore）
│   │   ├── services/api.ts    # Axios 實例（Bearer Token + 401 登出 + isNetworkError）
│   │   ├── types/             # TypeScript 型別
│   │   └── generated/        # Orval 自動生成（已 gitignore）
│   ├── orval.config.ts        # Orval codegen 設定
│   └── vite.config.ts         # Vite（/api proxy → localhost:8080）
├── docker-compose.yml         # PostgreSQL 本地環境
├── .env.example               # 環境變數範例
└── .gitignore
```

## 技術棧與版本

| 技術 | 版本 / 說明 |
|------|------------|
| Go | 1.21+ |
| Gin | v1.x |
| GORM | v2，PostgreSQL driver |
| golang-jwt/jwt | v5，HS256 |
| Uber Zap | 結構化日誌，dev=彩色，prod=JSON |
| Prometheus | client_golang，HTTP 指標 |
| swaggo/swag | OpenAPI 自動生成，`make swagger` |
| React | 18，Functional Components + Hooks |
| TypeScript | strict mode |
| Vite | 5+ |
| Tailwind CSS | v4（Vite plugin，無需 postcss） |
| shadcn/ui | Button、Input、Card 等元件 |
| Zustand | 含 persist middleware |
| Orval | OpenAPI → TypeScript codegen |

## API 路由總覽

```
GET  /health                    # 健康檢查
GET  /metrics                   # Prometheus 指標
GET  /swagger/*any              # Swagger UI

POST /api/v1/auth/login         # 登入，回傳 JWT Token

# 以下需 Authorization: Bearer <token>
GET    /api/v1/articles         # 列表（?page=1&page_size=10）
POST   /api/v1/articles         # 新增
GET    /api/v1/articles/:id     # 取得單筆
PUT    /api/v1/articles/:id     # 更新
DELETE /api/v1/articles/:id     # 刪除（軟刪除）

# 以下需 role = superadmin
GET /api/v1/admin/overview      # 管理員示範端點
```

## RBAC 角色模型

- `User.Role` 欄位（VARCHAR 20，預設 `'user'`）
- 角色常數：`model.RoleSuperAdmin = "superadmin"`、`model.RoleUser = "user"`
- JWT Claims 包含 `role` 欄位
- `JWTAuth` middleware → 注入 `role` 到 gin.Context
- `RequireRole("superadmin")` → 驗證角色，回傳 403 若不符

## Middleware 載入順序（router.go）

```go
r := gin.New()
r.Use(middleware.ZapLogger())       // 1. 存取日誌
r.Use(middleware.ZapRecovery())     // 2. Panic 恢復
r.Use(middleware.PrometheusMiddleware()) // 3. 指標
r.Use(corsMiddleware())             // 4. CORS

// 受保護路由群組
protected.Use(middleware.JWTAuth(cfg))          // 5. JWT 驗證
admin.Use(middleware.RequireRole("superadmin")) // 6. RBAC
```

## Swagger 相關

- 使用 `swaggo/swag`，在 main.go 加全域 `@` 註解
- Controller handler 上加 `@Summary @Tags @Param @Success @Failure @Security @Router`
- `router.go` import `_ "gin-react-admin/docs"` 才能載入規格
- 執行 `cd backend && make swagger` 重新生成

## 前端 API 路徑設計

- `api.ts` 的 `baseURL = VITE_API_BASE_URL || ''`（空字串，使用相對路徑）
- 所有路徑包含完整前綴：`/api/v1/auth/login`、`/api/v1/articles` 等
- Vite proxy：`/api` → `http://localhost:8080`（不 rewrite，後端路由完整保留）
- 若設定 `VITE_API_BASE_URL=http://localhost:8080`，只填 scheme+host，不加 `/api`

## 環境變數

- 後端 `.env` 由 `pkg/config/config.go` 載入，查找順序：`.env` → `../.env`
- 必填：`DB_DSN`、`JWT_SECRET`
- `GIN_MODE=release` 時，Zap 切換為 JSON 格式日誌

## 開發慣例

- **語言**：繁體中文（程式碼中文註解、文件）
- **Git commit**：Conventional Commits（`feat:`、`fix:`、`docs:`、`refactor:`）
- **路由版本前綴**：`/api/v1/`
- **Zap 日誌**：使用 `logger.Log.Info/Warn/Error`，不使用標準庫 `log`
- **Prometheus 標籤**：使用 `ctx.FullPath()`（低基數），不用 `ctx.Request.URL.Path`
- **測試帳號**：`admin / admin123`（role: superadmin），僅開發用

## 注意事項

- `docs/` 目錄需提交（router.go 的 blank import 在編譯時需要）
- `frontend/src/generated/` 已加入 `.gitignore`，每次由 `npm run generate:api` 生成
- `frontend/.env` 的 `VITE_API_BASE_URL` 只填 host，不加 `/api`

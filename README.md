# 前後端分離後台管理系統模板

一個開箱即用的後台管理系統起始模板，採用 **Golang (Gin) + React (TypeScript)** 前後端分離架構，注重安全性與可維護性。

## ✨ 功能特色

- 🔐 **JWT 身份驗證** — 無狀態 HS256 Token，含登入 API 與 Middleware
- 🏗️ **Clean Architecture** — 後端採用 Controller → Service → Repository 三層分離
- 📱 **響應式設計 (RWD)** — 完整支援手機、平板、桌機，Sidebar 支援漢堡選單
- 🌙 **暗黑模式** — 基於 Tailwind CSS v4，一鍵切換亮/暗色主題（含登入頁）
- 🛡️ **路由守衛** — Protected Route + Zustand 狀態管理（localStorage 持久化）
- 📦 **Docker Compose** — 一鍵啟動本地 PostgreSQL 資料庫
- 📝 **CRUD 範例** — 完整的 Article 文章 CRUD API（含分頁、軟刪除）
- 📊 **Prometheus 監控** — 內建 HTTP 請求指標中介軟體，開放 `/metrics` 採集端點
- 📋 **結構化日誌** — Uber Zap 輸出 JSON 格式日誌，支援 ELK / 日誌分析系統串接
- 📖 **Swagger API 文件** — swaggo/swag 自動生成 OpenAPI 規格，含互動式 UI
- 🤖 **前端 API Codegen** — Orval 根據 OpenAPI 規格自動生成 TypeScript 型別與 API 函式
- 🔒 **RBAC 多角色權限** — `superadmin` / `user` 角色模型，JWT Claims 攜帶角色，`RequireRole` Middleware

---

## 🛠️ 技術棧

| 分層 | 技術 |
|------|------|
| **前端框架** | React 18 + TypeScript + Vite |
| **前端 UI** | Tailwind CSS v4 + shadcn/ui |
| **前端狀態** | Zustand（含 persist middleware） |
| **前端路由** | React Router v6 |
| **前端 API** | Axios + Orval（OpenAPI → TypeScript codegen） |
| **後端框架** | Golang + Gin Web Framework |
| **後端 ORM** | GORM v2 |
| **身份驗證** | JWT (golang-jwt/jwt/v5, HS256) |
| **日誌** | Uber Zap（JSON 結構化日誌，dev 模式彩色輸出） |
| **監控** | Prometheus client_golang（HTTP 請求指標） |
| **API 文件** | swaggo/swag（OpenAPI 3.0 自動生成） |
| **資料庫** | PostgreSQL 16 |
| **基礎設施** | Docker Compose |

---

## 📁 專案目錄結構

### 後端 (`backend/`)

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # 應用程式入口（Swagger 全域註解）
├── docs/                        # swag 自動生成的 OpenAPI 規格（make swagger）
│   ├── docs.go
│   ├── swagger.json
│   └── swagger.yaml
├── internal/
│   ├── controller/
│   │   ├── auth_controller.go   # 身份驗證 HTTP Handler（含 Swagger 註解）
│   │   └── article_controller.go # 文章 CRUD HTTP Handler（含 Swagger 註解）
│   ├── service/
│   │   ├── auth_service.go      # 身份驗證業務邏輯（bcrypt + JWT + SeedDefaultUser）
│   │   └── article_service.go   # 文章 CRUD 業務邏輯
│   ├── repository/
│   │   ├── user_repository.go   # 使用者資料存取（FindByUsername, FindByID）
│   │   └── article_repository.go # 文章資料存取（GORM，含軟刪除）
│   ├── model/
│   │   ├── user.go              # User GORM 模型（含 Role 欄位）
│   │   └── article.go           # Article GORM 模型（含軟刪除）
│   ├── middleware/
│   │   ├── jwt_middleware.go    # JWT Token 驗證，注入 user_id / username / role
│   │   ├── rbac_middleware.go   # RBAC 角色驗證 RequireRole(roles...)
│   │   ├── zap_middleware.go    # Zap HTTP 存取日誌 + Panic Recovery
│   │   └── prometheus_middleware.go # Prometheus HTTP 指標記錄
│   └── router/
│       └── router.go            # 路由註冊（公開 / JWT 保護 / Superadmin 路由）
├── pkg/
│   ├── config/
│   │   └── config.go            # 環境變數讀取（多路徑 .env 查找）
│   ├── database/
│   │   └── database.go          # GORM PostgreSQL 連線初始化
│   ├── jwt/
│   │   └── jwt.go               # JWT 工具（GenerateToken 含 role / ParseToken）
│   ├── logger/
│   │   └── logger.go            # Uber Zap 初始化（dev: 彩色 / prod: JSON）
│   └── metrics/
│       └── metrics.go           # Prometheus Counter + Histogram 定義
├── .env.example                 # 環境變數範例
├── Makefile                     # make swagger / build / run / tidy
├── go.mod
└── go.sum
```

### 前端 (`frontend/`)

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 基礎元件（Button、Input、Card）
│   │   └── layout/
│   │       ├── AdminLayout.tsx  # 後台主佈局（組合 Sidebar + Header + Outlet）
│   │       ├── Sidebar.tsx      # 側邊導航欄（RWD，手機端支援遮罩）
│   │       └── Header.tsx       # 頂部導覽列（漢堡選單、暗黑模式、登出）
│   ├── generated/               # Orval 自動生成（npm run generate:api，已加入 .gitignore）
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx    # 登入頁面（含暗黑模式切換按鈕）
│   │   └── dashboard/
│   │       └── DashboardPage.tsx # 後台首頁（儀表板）
│   ├── router/
│   │   ├── index.tsx            # React Router v6 路由樹定義
│   │   └── ProtectedRoute.tsx   # 路由守衛（ProtectedRoute + GuestRoute）
│   ├── store/
│   │   ├── authStore.ts         # Zustand 認證狀態（token、user，localStorage 持久化）
│   │   └── themeStore.ts        # Zustand 主題狀態（light/dark，localStorage 持久化）
│   ├── services/
│   │   └── api.ts               # Axios 實例（Bearer Token 自動附加、401 自動登出、isNetworkError 識別）
│   ├── types/
│   │   └── index.ts             # TypeScript 型別定義
│   ├── lib/
│   │   └── utils.ts             # Tailwind CSS class 合併工具（cn 函式）
│   ├── App.tsx                  # 根元件（RouterProvider）
│   ├── main.tsx                 # 進入點
│   └── index.css                # Tailwind CSS v4 全域樣式與主題變數
├── index.html                   # HTML 模板（含 FOUC 防止腳本）
├── orval.config.ts              # Orval codegen 設定（指向 Swagger JSON）
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts               # Vite 設定（/api proxy → localhost:8080）
```

---

## 🚀 本地啟動步驟

### 前置需求

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Go](https://golang.org/dl/) 1.21+
- [Node.js](https://nodejs.org/) 18+ & npm

### 步驟 1：複製環境變數設定

```bash
cp .env.example .env
```

編輯 `.env`，至少修改以下設定：

```env
POSTGRES_PASSWORD=your_strong_password
JWT_SECRET=your_minimum_32_chars_random_secret_key
```

### 步驟 2：啟動 PostgreSQL（Docker Compose）

```bash
# 啟動資料庫（背景執行）
docker compose up -d

# 確認資料庫已就緒
docker compose ps
```

### 步驟 3：啟動後端

```bash
cd backend

# 啟動後端伺服器（第一次啟動會自動建立資料表）
go run cmd/server/main.go
```

後端啟動後會自動：
- 建立 `users` 和 `articles` 資料表
- 建立預設測試帳號：**admin / admin123**（角色：`superadmin`）

### 步驟 4：啟動前端

```bash
cd frontend

# 安裝依賴（首次執行）
npm install

# 啟動開發伺服器（必須使用 npm run dev，Vite proxy 才會生效）
npm run dev
```

前端啟動後訪問：**http://localhost:5173**

> **注意**：前端 API 請求透過 Vite proxy（`/api` → `http://localhost:8080`）轉發。
> 必須使用 `npm run dev`，直接開啟 `dist/index.html` 或使用 `npm run preview` 均不會觸發 proxy。

---

## 🔑 環境變數說明

| 變數名稱 | 說明 | 預設值 | 必填 |
|----------|------|--------|------|
| `POSTGRES_USER` | PostgreSQL 使用者名稱 | `admin` | ❌ |
| `POSTGRES_PASSWORD` | PostgreSQL 密碼 | `secret` | ✅ 建議修改 |
| `POSTGRES_DB` | PostgreSQL 資料庫名稱 | `admindb` | ❌ |
| `POSTGRES_PORT` | PostgreSQL 監聽埠 | `5432` | ❌ |
| `PORT` | 後端 HTTP 監聽埠 | `8080` | ❌ |
| `DB_DSN` | PostgreSQL 完整連線字串 | — | ✅ |
| `JWT_SECRET` | JWT 簽名密鑰（≥ 32 字元）| — | ✅ |
| `JWT_EXPIRE_HOURS` | JWT Token 有效期（小時）| `24` | ❌ |
| `GIN_MODE` | Gin 執行模式（`release` 時啟用 JSON 日誌）| `debug` | ❌ |

> **安全提示**：`.env` 檔案已加入 `.gitignore`，請勿將含有真實密碼的 `.env` 提交至版本控制。

---

## 📡 API 端點

### 系統端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/health` | 健康檢查 |
| `GET` | `/metrics` | Prometheus 指標採集端點 |
| `GET` | `/swagger/index.html` | Swagger UI（互動式 API 文件） |

### 公開端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| `POST` | `/api/v1/auth/login` | 使用者登入，回傳 JWT Token |

### 受保護端點（需 `Authorization: Bearer <token>`）

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/api/v1/articles` | 取得文章列表（支援 `page`、`page_size` 分頁） |
| `POST` | `/api/v1/articles` | 新增文章 |
| `GET` | `/api/v1/articles/:id` | 取得單篇文章 |
| `PUT` | `/api/v1/articles/:id` | 更新文章 |
| `DELETE` | `/api/v1/articles/:id` | 刪除文章（軟刪除） |

### 管理員端點（需 `superadmin` 角色）

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/api/v1/admin/overview` | 系統概覽（示範 RBAC 保護路由） |

---

## 🔧 開發指令

### 後端

```bash
cd backend

# 建構
go build ./...

# 執行測試
go test ./...

# 程式碼檢查
go vet ./...

# 重新生成 Swagger 文件（需先安裝 swag CLI）
make swagger
# 或直接執行：swag init -g cmd/server/main.go -o docs

# 安裝 swag CLI（首次執行）
go install github.com/swaggo/swag/cmd/swag@latest
```

### 前端

```bash
cd frontend

# 開發伺服器（啟用 Vite proxy）
npm run dev

# 建構 Production
npm run build

# 型別檢查
npx tsc --noEmit

# 根據後端 OpenAPI 規格自動生成 API 客戶端（需後端先啟動）
npm run generate:api
```

---

## 🔒 RBAC 角色權限

系統內建兩種角色：

| 角色 | 說明 | 預設帳號 |
|------|------|----------|
| `superadmin` | 超級管理員，可存取所有端點 | admin / admin123 |
| `user` | 一般使用者，無法存取 `/api/v1/admin/*` | — |

**實作機制**：
1. `User.Role` 欄位儲存角色字串
2. 登入後 JWT Claims 包含 `role` 欄位
3. `JWTAuth` middleware 將 `role` 注入 gin Context
4. `RequireRole("superadmin")` middleware 驗證角色，串接於目標路由群組

---

## ⚠️ 安全注意事項

1. **JWT Secret**：生產環境請使用 `openssl rand -hex 32` 生成強隨機密鑰
2. **資料庫密碼**：絕對不可使用預設值 `secret`
3. **CORS 設定**：`router.go` 中的 CORS 目前允許所有來源（`*`），生產環境請限制為實際前端域名
4. **localStorage Token**：若需更高安全性，可考慮改用 HttpOnly Cookie 儲存 Token
5. **Docker Compose**：此配置僅供本地開發，不適合直接用於 Production 環境
6. **預設帳號**：生產環境部署前請務必移除或修改預設的 `admin / admin123` 帳號

---

## 📄 授權

MIT License

---

## 🛠️ 技術棧

| 分層 | 技術 |
|------|------|
| **前端框架** | React 18 + TypeScript + Vite |
| **前端 UI** | Tailwind CSS v4 + shadcn/ui |
| **前端狀態** | Zustand（含 persist middleware） |
| **前端路由** | React Router v6 |
| **後端框架** | Golang + Gin Web Framework |
| **後端 ORM** | GORM v2 |
| **身份驗證** | JWT (golang-jwt/jwt/v5, HS256) |
| **資料庫** | PostgreSQL 16 |
| **基礎設施** | Docker Compose |

---

## 📁 專案目錄結構

### 後端 (`backend/`)

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # 應用程式入口，初始化依賴並啟動 HTTP Server
├── internal/
│   ├── controller/
│   │   ├── auth_controller.go   # 身份驗證 HTTP Handler（POST /api/v1/auth/login）
│   │   └── article_controller.go # 文章 CRUD HTTP Handler
│   ├── service/
│   │   ├── auth_service.go      # 身份驗證業務邏輯（bcrypt 密碼驗證 + JWT 生成）
│   │   └── article_service.go   # 文章 CRUD 業務邏輯
│   ├── repository/
│   │   ├── user_repository.go   # 使用者資料存取（GORM）
│   │   └── article_repository.go # 文章資料存取（GORM，含軟刪除）
│   ├── model/
│   │   ├── user.go              # User GORM 模型
│   │   └── article.go           # Article GORM 模型（含軟刪除）
│   ├── middleware/
│   │   └── jwt_middleware.go    # JWT Token 驗證 Gin Middleware
│   └── router/
│       └── router.go            # 路由註冊（公開路由 + 受保護路由）
├── pkg/
│   ├── config/
│   │   └── config.go            # 環境變數讀取（godotenv）
│   ├── database/
│   │   └── database.go          # GORM PostgreSQL 連線初始化
│   └── jwt/
│       └── jwt.go               # JWT 工具函式（GenerateToken / ParseToken）
├── .env.example                 # 環境變數範例
├── go.mod
└── go.sum
```

### 前端 (`frontend/`)

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 基礎元件（Button、Input、Card）
│   │   └── layout/
│   │       ├── AdminLayout.tsx  # 後台主佈局（組合 Sidebar + Header + Outlet）
│   │       ├── Sidebar.tsx      # 側邊導航欄（RWD，手機端支援遮罩）
│   │       └── Header.tsx       # 頂部導覽列（漢堡選單、暗黑模式、登出）
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx    # 登入頁面
│   │   └── dashboard/
│   │       └── DashboardPage.tsx # 後台首頁（儀表板）
│   ├── router/
│   │   ├── index.tsx            # React Router v6 路由樹定義
│   │   └── ProtectedRoute.tsx   # 路由守衛（ProtectedRoute + GuestRoute）
│   ├── store/
│   │   ├── authStore.ts         # Zustand 認證狀態（token、user，localStorage 持久化）
│   │   └── themeStore.ts        # Zustand 主題狀態（light/dark，localStorage 持久化）
│   ├── services/
│   │   └── api.ts               # Axios 實例（Bearer Token 自動附加、401 自動登出）
│   ├── types/
│   │   └── index.ts             # TypeScript 型別定義
│   ├── lib/
│   │   └── utils.ts             # Tailwind CSS class 合併工具（cn 函式）
│   ├── App.tsx                  # 根元件（RouterProvider）
│   ├── main.tsx                 # 進入點
│   └── index.css                # Tailwind CSS v4 全域樣式與主題變數
├── index.html                   # HTML 模板（含 FOUC 防止腳本）
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🚀 本地啟動步驟

### 前置需求

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Go](https://golang.org/dl/) 1.21+
- [Node.js](https://nodejs.org/) 18+ & npm

### 步驟 1：複製環境變數設定

```bash
cp .env.example .env
```

編輯 `.env`，至少修改以下設定：

```env
POSTGRES_PASSWORD=your_strong_password
JWT_SECRET=your_minimum_32_chars_random_secret_key
```

### 步驟 2：啟動 PostgreSQL（Docker Compose）

```bash
# 啟動資料庫（背景執行）
docker compose up -d

# 確認資料庫已就緒
docker compose ps
```

### 步驟 3：啟動後端

```bash
cd backend

# 啟動後端伺服器（第一次啟動會自動建立資料表）
go run cmd/server/main.go
```

後端啟動後會自動：
- 建立 `users` 和 `articles` 資料表
- 建立預設測試帳號：**admin / admin123**

### 步驟 4：啟動前端

```bash
cd frontend

# 安裝依賴（首次執行）
npm install

# 啟動開發伺服器
npm run dev
```

前端啟動後訪問：**http://localhost:5173**

---

## 🔑 環境變數說明

| 變數名稱 | 說明 | 預設值 | 必填 |
|----------|------|--------|------|
| `POSTGRES_USER` | PostgreSQL 使用者名稱 | `admin` | ❌ |
| `POSTGRES_PASSWORD` | PostgreSQL 密碼 | `secret` | ✅ 建議修改 |
| `POSTGRES_DB` | PostgreSQL 資料庫名稱 | `admindb` | ❌ |
| `POSTGRES_PORT` | PostgreSQL 監聽埠 | `5432` | ❌ |
| `PORT` | 後端 HTTP 監聽埠 | `8080` | ❌ |
| `DB_DSN` | PostgreSQL 完整連線字串 | — | ✅ |
| `JWT_SECRET` | JWT 簽名密鑰（≥ 32 字元）| — | ✅ |
| `JWT_EXPIRE_HOURS` | JWT Token 有效期（小時）| `24` | ❌ |

> **安全提示**：`.env` 檔案已加入 `.gitignore`，請勿將含有真實密碼的 `.env` 提交至版本控制。

---

## 📡 API 端點

### 公開端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/health` | 健康檢查 |
| `POST` | `/api/v1/auth/login` | 使用者登入，回傳 JWT Token |

### 受保護端點（需 `Authorization: Bearer <token>`）

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/api/v1/articles` | 取得文章列表（支援 `page`、`page_size` 分頁） |
| `POST` | `/api/v1/articles` | 新增文章 |
| `GET` | `/api/v1/articles/:id` | 取得單篇文章 |
| `PUT` | `/api/v1/articles/:id` | 更新文章 |
| `DELETE` | `/api/v1/articles/:id` | 刪除文章（軟刪除） |

---

## 🔧 開發指令

### 後端

```bash
cd backend

# 建構
go build ./...

# 執行測試
go test ./...

# 程式碼檢查
go vet ./...
```

### 前端

```bash
cd frontend

# 開發伺服器
npm run dev

# 建構 Production
npm run build

# 型別檢查
npx tsc --noEmit
```

---

## ⚠️ 安全注意事項

1. **JWT Secret**：生產環境請使用 `openssl rand -hex 32` 生成強隨機密鑰
2. **資料庫密碼**：絕對不可使用預設值 `secret`
3. **CORS 設定**：`router.go` 中的 CORS 目前允許所有來源（`*`），生產環境請限制為實際前端域名
4. **localStorage Token**：若需更高安全性，可考慮改用 HttpOnly Cookie 儲存 Token
5. **Docker Compose**：此配置僅供本地開發，不適合直接用於 Production 環境

---

## 📄 授權

MIT License

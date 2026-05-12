# Makefile
# 常用開發指令集中管理
# 使用方式：make <target>

.PHONY: help dev dev-db dev-backend dev-frontend \
        build build-backend build-frontend \
        up down logs swagger tidy

# ── 說明 ──────────────────────────────────────────────────────────────────────

help: ## 顯示可用指令列表
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── 開發環境（熱重載） ────────────────────────────────────────────────────────

dev-db: ## 啟動開發用基礎設施（PostgreSQL + Redis，背景執行）
	docker compose -f docker-compose.dev.yml up -d
	@echo "✅ PostgreSQL（port 5432）與 Redis（port 6379）已啟動"

dev-backend: ## 啟動後端（有 air 則熱重載；否則降級為 go run）
	@if command -v air >/dev/null 2>&1; then \
	  echo "🔥 使用 air 熱重載啟動後端"; \
	  cd backend && air -c .air.toml; \
	else \
	  echo "⚠️  air 未安裝，改用 go run（無熱重載）"; \
	  echo "   若要熱重載請先執行：make install-air"; \
	  cd backend && go run ./cmd/server/main.go; \
	fi

dev-frontend: ## 啟動前端 Vite HMR dev server（port 5173）
	cd frontend && npm run dev

dev: dev-db ## 啟動完整開發環境（DB + Redis + 後端 + 前端，需安裝 tmux）
	@command -v tmux >/dev/null 2>&1 || { echo "❌ 請先安裝 tmux，或分別執行 make dev-backend / make dev-frontend"; exit 1; }
	tmux new-session -d -s dev-session -n db 2>/dev/null || true
	@if command -v air >/dev/null 2>&1; then \
	  tmux new-window -t dev-session -n backend "cd $(CURDIR)/backend && air -c .air.toml"; \
	else \
	  tmux new-window -t dev-session -n backend "cd $(CURDIR)/backend && go run ./cmd/server/main.go"; \
	fi
	tmux new-window -t dev-session -n frontend "cd $(CURDIR)/frontend && npm run dev"
	tmux attach -t dev-session
	@echo ""
	@echo "✅ 開發環境已啟動"
	@echo "   後端：http://localhost:8080"
	@echo "   前端：http://localhost:5173"
	@echo "   DB：  localhost:5432"
	@echo "   Redis：localhost:6379"

dev-stop: ## 停止開發用基礎設施（PostgreSQL + Redis）
	docker compose -f docker-compose.dev.yml down
	@echo "✅ 開發基礎設施已停止（PostgreSQL + Redis）"

# ── 生產環境 ─────────────────────────────────────────────────────────────────

up: ## 啟動生產容器（全端）
	docker compose up -d --build

down: ## 停止並移除所有容器
	docker compose down

logs: ## 查看後端 logs
	docker compose logs -f backend

# ── 建構 ─────────────────────────────────────────────────────────────────────

build-backend: ## 編譯後端二進位
	cd backend && CGO_ENABLED=0 go build -o bin/server ./cmd/server/main.go
	@echo "✅ 後端已編譯至 backend/bin/server"

build-frontend: ## 建構前端靜態檔案
	cd frontend && npm run build
	@echo "✅ 前端已建構至 frontend/dist/"

build: build-backend build-frontend ## 建構前後端

# ── 工具 ─────────────────────────────────────────────────────────────────────

swagger: ## 重新生成 Swagger 文件（需安裝 swag）
	cd backend && swag init -g cmd/server/main.go -o docs
	@echo "✅ Swagger 文件已更新"

tidy: ## 整理 Go modules
	cd backend && go mod tidy
	@echo "✅ go.mod / go.sum 已整理"

install-air: ## 安裝 air 熱重載工具
	go install github.com/air-verse/air@latest
	@echo "✅ air 已安裝"

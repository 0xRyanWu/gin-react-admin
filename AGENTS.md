# AGENTS.md — gin-react-admin

## Overview

Monorepo with two apps in separate directories:
- `backend/` — Go + Gin + GORM + PostgreSQL, Clean Architecture (Controller → Service → Repository)
- `frontend/` — React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui

Root `Makefile` orchestrates both. Root `docker-compose.yml` runs full stack (PostgreSQL, Redis, backend, frontend).

## Quick start

```bash
cp .env.example .env    # edit JWT_SECRET + POSTGRES_PASSWORD
docker compose up postgres redis -d     # start infra
cd backend && go run ./cmd/server/main.go   # backend on :8080
cd frontend && npm run dev                  # frontend on :5173
```

Default test account: `admin` / `admin123` (role: `superadmin`). Seeded automatically on backend start.

## Commands

### Backend (in `backend/`)
| Command | Purpose |
|---------|---------|
| `go run ./cmd/server/main.go` | Start dev server |
| `go test ./...` | Run all tests |
| `go vet ./...` | Lint |
| `make swagger` | Regenerate Swagger docs (`swag init -g cmd/server/main.go -o docs`) |

### Frontend (in `frontend/`)
| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with Vite proxy (`/api` → `localhost:8080`) |
| `npm run build` | Typecheck + build (`tsc -b && vite build`) |
| `npx tsc --noEmit` | Typecheck only |
| `npm run generate:api` | Orval codegen from `http://localhost:8080/swagger/doc.json` (backend must be running) |

## Key files and what they do

### Backend
- `backend/cmd/server/main.go` — Entrypoint; init order: logger → config → DB → AutoMigrate → seed → asynq → router → HTTP server
- `backend/internal/router/router.go` — All routes in one place; uses `gin.New()` (NOT `gin.Default()`), manually mounts middleware in order: Zap → Recovery → Prometheus → CORS
- `backend/pkg/config/config.go` — Loads `.env` from `./.env` or `../.env`; `JWT_SECRET` is required (fatal if missing)
- `backend/pkg/database/database.go` — GORM + PostgreSQL with connection pooling
- `backend/docs/` — swag auto-generated; **must be committed** (blank import `_ "gin-react-admin/docs"` needed at compile time)

### Frontend
- `frontend/vite.config.ts` — proxy `/api` → `localhost:8080`, `@/` path alias → `src/`
- `frontend/services/api.ts` — Axios instance with Bearer Token, 401 auto-logout, `isNetworkError`
- `frontend/orval.config.ts` — Orval codegen: output to `src/generated/` (gitignored), uses `src/services/api.ts` as axios mutator
- `frontend/index.html` — Has FOUC prevention script for dark mode

## Architecture notes

### RBAC
- Two roles: `superadmin` and `user` (stored in `User.Role` VARCHAR)
- JWT claims include `role`; `RequireRole("superadmin")` middleware returns 403
- Route groups: public → `JWTAuth` → `RequireRole("superadmin")`

### Middleware order (router.go)
1. `ZapLogger` / `ZapRecovery`
2. `PrometheusMiddleware`
3. CORS (allows all origins — tighten for production)
4. `JWTAuth` (on protected group)
5. `RequireRole` (on admin group)

### Background tasks
- Redis + asynq for task queue
- Client/Server/Scheduler in `pkg/queue/`
- Registered tasks in `internal/task/`

### Docker / Deploy
- `docker-compose.yml` — full stack (postgres, redis, backend, frontend)
- Frontend Dockerfile builds static files, serves via nginx (config: `frontend/nginx.conf` with SPA fallback + `/api/` reverse proxy to `backend:8080`)
- Helm charts in `helm/gin-react-admin/` for K8s

### Known quirks / gotchas
- Tailwind CSS v4 uses Vite plugin (`@tailwindcss/vite`), **no postcss config needed**
- `frontend/.env` `VITE_API_BASE_URL` = host only, no `/api` suffix
- Makefile target `dev-db` references `docker-compose.dev.yml` which **does not exist**; use `docker compose up postgres redis -d` instead
- `GIN_MODE=release` switches Zap to JSON-format logs
- Prometheus metrics use `ctx.FullPath()` (low cardinality), not `ctx.Request.URL.Path`
- Frontend build = `tsc -b` (project references mode) + `vite build`

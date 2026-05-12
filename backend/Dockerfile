# backend/Dockerfile
# Multi-stage build：最終 image 不含 Go toolchain，體積更小

# ── Stage 1: 建構 ──────────────────────────────────────────────────────────
FROM public.ecr.aws/docker/library/golang:1.26-alpine AS builder

# 安裝 git（部分 go module 需要）與 ca-certificates（HTTPS 請求）
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

# 先複製 go.mod / go.sum，利用 Docker layer cache 加速重複建構
COPY go.mod go.sum ./
RUN go mod download

# 複製全部原始碼
COPY . .

# 建構靜態連結的二進位（CGO_ENABLED=0 確保在 alpine 可執行）
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o /build/server ./cmd/server/main.go

# ── Stage 2: 執行環境 ─────────────────────────────────────────────────────
FROM public.ecr.aws/docker/library/alpine:3.19

# 加入 ca-certificates（JWT / HTTPS 請求需要）與時區資料
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# 從 builder 複製編譯好的二進位
COPY --from=builder /build/server .

# 應用程式預設監聽埠（可透過環境變數 PORT 覆寫）
EXPOSE 8080

# 以非 root 使用者執行，提升安全性
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENTRYPOINT ["./server"]

# frontend/Dockerfile
# Multi-stage build：node 建構 Vite dist，nginx 提供靜態檔案

# ── Stage 1: 建構 ──────────────────────────────────────────────────────────
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

# 先複製 package.json / package-lock.json，利用 layer cache
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# 複製全部原始碼並建構
COPY . .
RUN npm run build

# ── Stage 2: 執行環境 ─────────────────────────────────────────────────────
FROM public.ecr.aws/docker/library/nginx:1.27-alpine

# 複製自訂 nginx 設定（支援 SPA routing + API proxy）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 從 builder 複製編譯好的靜態檔案
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Tailwind CSS v4 使用 Vite plugin（無需 postcss 配置）
    tailwindcss(),
  ],
  resolve: {
    // 設定 @ 路徑別名，對應 src/ 目錄
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // 開發環境 API 代理，避免 CORS 問題
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

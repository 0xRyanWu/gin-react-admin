// orval.config.ts
// Orval 設定檔：從後端 Swagger JSON 自動生成 TypeScript API 客戶端
// 使用方式：npm run generate:api（需後端伺服器正在運行）
// 文件：https://orval.dev/reference/configuration/overview

import { defineConfig } from 'orval'

export default defineConfig({
  // 文章 CRUD API
  articles: {
    input: {
      // 後端運行時的 Swagger JSON 端點
      // 若後端未啟動，可改用本地檔案：'../backend/docs/swagger.json'
      target: 'http://localhost:8080/swagger/doc.json',
    },
    output: {
      // 生成的程式碼輸出目錄
      target: 'src/generated/api.ts',
      // 使用 axios 作為 HTTP 客戶端（與現有 src/services/api.ts 保持一致）
      client: 'axios',
      // 覆蓋 axios 實例（使用已設定好 Bearer Token 的自定義實例）
      override: {
        mutator: {
          path: 'src/services/api.ts',
          name: 'axiosInstance',
        },
      },
      // 將 TypeScript 型別定義分離至獨立檔案
      schemas: 'src/generated/models',
      // 自動清除舊的生成檔案
      clean: true,
      // 使用具名匯出（非 default export）
      mode: 'single',
    },
  },
})

// src/services/api.ts
// Axios 實例設定
// 自動附加 Bearer Token，並在 401 時自動觸發登出流程

import axios from 'axios'

// baseURL 只包含 scheme+host（如 http://localhost:8080），/api 屬於路徑的一部分
// 若未設定環境變數，預設為空字串，讓 Vite proxy 根據路徑 /api/* 規則轉發
const baseURL = import.meta.env.VITE_API_BASE_URL || ''

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor：自動附加 JWT Token
api.interceptors.request.use((config) => {
  // 從 localStorage 讀取 Zustand persist 的資料
  const authData = localStorage.getItem('auth-storage')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      const token = parsed?.state?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // 解析失敗時忽略（不阻塞請求）
    }
  }
  return config
})

// Response Interceptor：處理 401 自動登出 + network error 識別
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除 localStorage 中的認證資料
      localStorage.removeItem('auth-storage')
      // 導向登入頁（避免循環依賴，直接操作 window.location）
      window.location.href = '/login'
    }

    // 標記 network error（請求完全未到達後端）
    // error.request 存在但 error.response 不存在 = 連線失敗（後端未啟動、proxy 未運行等）
    if (error.request && !error.response) {
      error.isNetworkError = true
    }

    return Promise.reject(error)
  }
)

export default api

// axiosInstance：供 Orval 生成程式碼使用的具名匯出
// orval.config.ts 的 mutator 設定指向此匯出，讓生成的 API 函式共用相同的 Token 攔截器
export const axiosInstance = api

// --- API 呼叫函式 ---

import type {
  LoginRequest,
  LoginResponse,
  Article,
  ArticleListResponse,
  CreateArticleRequest,
  UpdateArticleRequest,
} from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/v1/auth/login', data),
}

export const articleApi = {
  list: (page = 1, pageSize = 10) =>
    api.get<ArticleListResponse>(`/api/v1/articles?page=${page}&page_size=${pageSize}`),
  getById: (id: number) =>
    api.get<{ data: Article }>(`/api/v1/articles/${id}`),
  create: (data: CreateArticleRequest) =>
    api.post<{ data: Article }>('/api/v1/articles', data),
  update: (id: number, data: UpdateArticleRequest) =>
    api.put<{ data: Article }>(`/api/v1/articles/${id}`, data),
  delete: (id: number) =>
    api.delete<{ message: string }>(`/api/v1/articles/${id}`),
}

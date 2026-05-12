// src/types/index.ts
// 全域 TypeScript 型別定義

// --- 使用者相關 ---

export interface User {
  id: number
  username: string
  role?: string
  created_at?: string
  updated_at?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expires_in: number
  role?: string
}

// --- 文章相關 ---

export interface Article {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface ArticleListResponse {
  data: Article[]
  total: number
  page: number
  page_size: number
}

export interface CreateArticleRequest {
  title: string
  content?: string
}

export interface UpdateArticleRequest {
  title?: string
  content?: string
}

// --- 通用 API 回應 ---

export interface ApiError {
  error: string
}

// --- 排程相關 ---

export interface JobDefinition {
  id: string           // 任務類型 ID（如 "task:article:stats"）
  name: string         // 顯示名稱
  description: string  // 功能說明
  cron_spec: string    // Cron 表達式
}

// --- 使用者管理相關 ---

export interface UserListResponse {
  data: User[]
  total: number
  page: number
  page_size: number
}

export interface CreateUserRequest {
  username: string
  password: string
  role?: string
}

export interface UpdateUserRequest {
  username?: string
  password?: string
  role?: string
}

// src/types/index.ts
// 全域 TypeScript 型別定義

// --- 使用者相關 ---

export interface User {
  id: number
  username: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expires_in: number
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

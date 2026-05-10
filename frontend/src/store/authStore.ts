// src/store/authStore.ts
// Zustand 認證狀態管理
// 使用 persist middleware 自動將 token 與使用者資訊持久化至 localStorage

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginResponse } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  // 登入後儲存 Token 與使用者資訊
  login: (response: LoginResponse, user: User) => void
  // 登出：清除所有認證資料
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (response, user) =>
        set({
          token: response.token,
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      // localStorage 的 key 名稱
      name: 'auth-storage',
      // 只持久化必要的欄位（排除函式）
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

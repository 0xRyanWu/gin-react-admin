// src/pages/auth/LoginPage.tsx
// 登入頁面
// 使用 shadcn/ui Card + Input + Button 實作表單 UI

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { authApi } from '@/services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { theme, toggleTheme } = useThemeStore()

  // 表單狀態
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 基本驗證
    if (!username.trim() || !password.trim()) {
      setError('請輸入帳號與密碼')
      return
    }

    setIsLoading(true)

    try {
      // 呼叫登入 API
      const response = await authApi.login({ username, password })
      const { token, expires_in } = response.data

      // 更新 Zustand auth store（同時持久化至 localStorage）
      login({ token, expires_in }, { id: 0, username })

      // 導向後台首頁
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const axiosError = err as {
        isNetworkError?: boolean
        response?: { data?: { error?: string } }
      }

      if (axiosError.isNetworkError) {
        // 請求未到達後端：後端未啟動、Vite proxy 未運行（需 npm run dev）、網路問題
        setError('無法連線到伺服器，請確認後端是否啟動（go run cmd/server/main.go）')
      } else {
        setError(axiosError.response?.data?.error || '登入失敗，請稍後再試')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* 暗黑模式切換按鈕（固定於右上角） */}
      <button
        onClick={toggleTheme}
        aria-label="切換暗黑模式"
        className="fixed top-4 right-4 p-2 rounded-md text-foreground hover:bg-secondary transition-colors"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">後台管理系統</CardTitle>
          <CardDescription>請輸入帳號密碼登入</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                帳號
              </label>
              <Input
                id="username"
                type="text"
                placeholder="請輸入帳號"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密碼
              </label>
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* 錯誤訊息顯示區 */}
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登入中...' : '登入'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            測試帳號：admin / admin123
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

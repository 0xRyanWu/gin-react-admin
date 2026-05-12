// src/pages/auth/LoginPage.tsx
// 登入頁面（企業商務風格）
// 左右雙欄：左側品牌介紹，右側登入表單

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Shield, BarChart3, Users, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { authApi } from '@/services/api'

const features = [
  { icon: BarChart3, text: '即時資料監控與統計報表' },
  { icon: Users,     text: '多角色權限管理（RBAC）' },
  { icon: Shield,    text: 'JWT 安全身份驗證機制' },
  { icon: Lock,      text: '完整的 API 存取記錄稽核' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { theme, toggleTheme } = useThemeStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password.trim()) {
      setError('請輸入帳號與密碼')
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.login({ username, password })
      const { token, expires_in, role } = response.data
      login({ token, expires_in, role }, { id: 0, username, role })
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const axiosError = err as {
        isNetworkError?: boolean
        response?: { data?: { error?: string } }
      }
      if (axiosError.isNetworkError) {
        setError('無法連線到伺服器，請確認後端是否啟動')
      } else {
        setError(axiosError.response?.data?.error || '登入失敗，請稍後再試')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* 暗黑模式切換（右上角固定） */}
      <button
        onClick={toggleTheme}
        aria-label="切換暗黑模式"
        className="fixed top-4 right-4 z-10 p-2 rounded-md text-foreground hover:bg-secondary transition-colors"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* 左側：品牌介紹區（桌機端顯示） */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 dark:bg-slate-950 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-lg">A</div>
            <span className="text-xl font-semibold tracking-tight">Admin System</span>
          </div>
          <h1 className="text-3xl font-bold leading-snug mb-4">
            企業級後台<br />管理平台
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            整合身份驗證、權限管理與資料監控於一體，<br />
            協助企業高效率管理業務資料。
          </p>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-blue-400" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-500">© 2025 Admin System. All rights reserved.</p>
      </div>

      {/* 右側：登入表單 */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* 行動版 Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-white">A</div>
            <span className="text-lg font-semibold">Admin System</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">登入帳號</h2>
            <p className="mt-1 text-sm text-muted-foreground">輸入您的帳號與密碼以存取後台</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
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
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
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
                className="h-10"
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-10 font-medium" disabled={isLoading}>
              {isLoading ? '驗證中...' : '登入'}
            </Button>
          </form>

          <div className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground font-medium mb-1">測試帳號</p>
            <p className="text-xs text-foreground font-mono">admin / admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

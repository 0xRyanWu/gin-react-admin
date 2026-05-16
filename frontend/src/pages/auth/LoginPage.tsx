import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Shield, BarChart3, Users, Lock, User, KeyRound, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { authApi } from '@/services/api'

const features = [
  { icon: BarChart3, text: '即時資料監控與統計報表', color: 'from-blue-400 to-cyan-300' },
  { icon: Users,     text: '多角色權限管理（RBAC）', color: 'from-violet-400 to-purple-300' },
  { icon: Shield,    text: 'JWT 安全身份驗證機制', color: 'from-emerald-400 to-teal-300' },
  { icon: Lock,      text: '完整的 API 存取記錄稽核', color: 'from-amber-400 to-orange-300' },
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
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* 背景裝飾粒子 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-200/30 dark:bg-blue-500/5 blur-3xl animate-gradient-shift" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-200/30 dark:bg-indigo-500/5 blur-3xl animate-gradient-shift" style={{ animationDelay: '-10s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-amber-100/20 dark:bg-amber-500/5 blur-3xl animate-gradient-shift" style={{ animationDelay: '-5s' }} />
      </div>

      {/* 左側：品牌介紹區 */}
      <div className="hidden lg:flex lg:w-2/5 relative flex-col justify-between p-12 overflow-hidden">
        {/* 漸層背景層 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent dark:from-blue-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100 via-transparent to-transparent dark:from-violet-500/10" />

        {/* 浮動裝飾圓 */}
        <div className="absolute top-20 -left-10 w-40 h-40 rounded-full border border-gray-200/40 dark:border-white/5 animate-float" />
        <div className="absolute bottom-32 -right-5 w-32 h-32 rounded-full border border-gray-200/40 dark:border-white/5 animate-float-delayed" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20">A</div>
            <span className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Admin System</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white mb-4">
            企業級後台<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">管理平台</span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-12 max-w-xs">
            整合身份驗證、權限管理與資料監控於一體，協助企業高效率管理業務資料。
          </p>
          <div className="grid gap-3">
            {features.map(({ icon: Icon, text, color }, index) => (
              <div
                key={text}
                className="group flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300 bg-gray-50/80 dark:bg-white/[0.03] backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200/50 dark:border-white/[0.06] hover:bg-gray-100/60 dark:hover:bg-white/[0.06] transition-all duration-300"
                style={{ animation: `fade-in-up 0.6s ease-out ${0.3 + index * 0.1}s forwards`, opacity: 0 }}
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} bg-opacity-20 flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-gray-400 dark:text-slate-600">© 2025 Admin System. All rights reserved.</p>
      </div>

      {/* 右側：登入表單 */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative">
        {/* 明暗切換 */}
        <button
          onClick={toggleTheme}
          aria-label="切換暗黑模式"
          className="absolute top-6 right-6 z-10 p-2.5 rounded-xl text-foreground/60 hover:text-foreground bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-border/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="w-full max-w-sm animate-fade-in-up">
          {/* 行動版 Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">A</div>
            <span className="text-lg font-semibold text-foreground">Admin System</span>
          </div>

          {/* 磨砂玻璃表單卡片 */}
          <div className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/70 rounded-2xl border border-gray-200/50 dark:border-slate-700/30 shadow-2xl shadow-black/10 dark:shadow-black/20 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-foreground">歡迎回來</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">請輸入您的帳號與密碼以存取後台</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-sm font-medium text-foreground/80">
                  帳號
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="請輸入帳號"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    autoComplete="username"
                    className="h-11 pl-10 rounded-xl border-border bg-white/90 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-400/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                  密碼
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="請輸入密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="h-11 pl-10 rounded-xl border-border bg-white/90 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-400/50 transition-all duration-300"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200/50 dark:border-red-800/30 bg-red-50/80 dark:bg-red-950/30 px-4 py-3 animate-slide-in-right">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/20 hover:translate-y-[-1px] transition-all duration-300 disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    驗證中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    登入
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1.5">
                測試帳號：<span className="font-mono font-medium text-foreground/80">admin</span> / <span className="font-mono font-medium text-foreground/80">admin123</span>
              </p>
              <p className="text-[11px] text-muted-foreground">角色：superadmin（僅供開發測試使用）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

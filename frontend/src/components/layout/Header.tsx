// src/components/layout/Header.tsx
// 後台頂部導覽列（企業商務風格）
// 包含：漢堡選單、麵包屑路徑、暗黑模式切換、使用者 avatar、登出

import { Menu, Sun, Moon, LogOut, ChevronRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

interface HeaderProps {
  onMenuClick: () => void
}

const breadcrumbMap: Record<string, string> = {
  '/dashboard':          '儀表板',
  '/dashboard/articles': '文章管理',
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const currentLabel = breadcrumbMap[location.pathname] ?? '頁面'
  const initial = (user?.username ?? 'A').charAt(0).toUpperCase()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      {/* 左側：漢堡選單 + 麵包屑 */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8"
          onClick={onMenuClick}
          aria-label="開啟選單"
        >
          <Menu className="h-4 w-4" />
        </Button>
        {/* 麵包屑 */}
        <nav className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground hidden sm:inline">後台管理</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 hidden sm:inline" />
          <span className="font-medium text-foreground">{currentLabel}</span>
        </nav>
      </div>

      {/* 右側：主題切換 + 使用者資訊 + 登出 */}
      <div className="flex items-center gap-1.5">
        {/* 暗黑模式切換 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? '切換至暗黑模式' : '切換至亮色模式'}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* 分隔線 */}
        <div className="w-px h-4 bg-border mx-1" />

        {/* 使用者 Avatar + 名稱 */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold select-none">
            {initial}
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">
            {user?.username ?? '使用者'}
          </span>
        </div>

        {/* 登出按鈕 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-0.5 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
          aria-label="登出"
          title="登出"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

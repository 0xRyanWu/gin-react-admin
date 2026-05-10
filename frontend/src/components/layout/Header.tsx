// src/components/layout/Header.tsx
// 後台頂部導覽列
// 包含：漢堡選單按鈕（手機端）、暗黑模式切換、使用者資訊、登出

import { Menu, Sun, Moon, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

interface HeaderProps {
  onMenuClick: () => void  // 觸發手機端 Sidebar 展開
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      {/* 左側：漢堡選單按鈕（僅手機端顯示） */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="開啟選單"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium hidden sm:block">後台管理系統</span>
      </div>

      {/* 右側：主題切換 + 使用者資訊 + 登出 */}
      <div className="flex items-center gap-2">
        {/* 暗黑模式切換按鈕 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? '切換至暗黑模式' : '切換至亮色模式'}
        >
          {/* 根據當前主題顯示對應圖示 */}
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        {/* 使用者名稱 */}
        <span className="text-sm text-muted-foreground hidden sm:block">
          {user?.username ?? '使用者'}
        </span>

        {/* 登出按鈕 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="登出"
          title="登出"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

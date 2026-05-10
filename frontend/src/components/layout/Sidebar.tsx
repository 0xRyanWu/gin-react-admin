// src/components/layout/Sidebar.tsx
// 後台側邊導航欄
// 桌機端固定顯示；手機端透過 isOpen prop 控制顯示/隱藏

import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// 導航項目設定
const navItems = [
  {
    to: '/dashboard',
    label: '儀表板',
    icon: LayoutDashboard,
    end: true, // exact match
  },
  {
    to: '/dashboard/articles',
    label: '文章管理',
    icon: FileText,
    end: false,
  },
]

interface SidebarProps {
  isOpen: boolean        // 手機端控制是否展開
  onClose: () => void    // 關閉 Sidebar（點擊遮罩或連結時觸發）
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* 手機端遮罩層 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar 主體 */}
      <aside
        className={cn(
          // 基礎樣式：固定寬度、高度撐滿、背景色
          'fixed top-0 left-0 z-30 h-full w-64 bg-card border-r border-border flex flex-col',
          // 手機端：預設隱藏，透過 isOpen 控制滑入動畫
          'transition-transform duration-300 ease-in-out',
          'lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo 區域 */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          <span className="font-semibold text-lg">Admin Panel</span>
          {/* 手機端關閉按鈕 */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="關閉選單"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 導航選單 */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose} // 手機端點擊後自動關閉
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground' // 當前路由高亮
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

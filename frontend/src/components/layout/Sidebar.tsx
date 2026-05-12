// src/components/layout/Sidebar.tsx
// 後台側邊導航欄（企業商務風格）
// 桌機端固定顯示；手機端透過 isOpen prop 控制顯示/隱藏

import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, ShieldCheck, Clock, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  end: boolean
  requiredRole?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: '主要功能',
    items: [
      { to: '/dashboard', label: '儀表板', icon: LayoutDashboard, end: true },
      { to: '/dashboard/articles', label: '文章管理', icon: FileText, end: false },
    ],
  },
  {
    label: '系統管理',
    items: [
      { to: '/dashboard/admin', label: '管理員總覽', icon: ShieldCheck, end: false, requiredRole: 'superadmin' },
      { to: '/dashboard/users', label: '使用者管理', icon: Users, end: false, requiredRole: 'superadmin' },
      { to: '/dashboard/scheduler', label: '排程管理', icon: Clock, end: false, requiredRole: 'superadmin' },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const userRole = useAuthStore((state) => state.user?.role)

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
          'fixed top-0 left-0 z-30 h-full w-60 bg-card border-r border-border flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo 區域 */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center font-bold text-white text-sm">A</div>
            <span className="font-semibold text-sm text-foreground">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-7 w-7"
            onClick={onClose}
            aria-label="關閉選單"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 導航選單 */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.requiredRole || item.requiredRole === userRole
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={group.label} className="mb-4">
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-l-2 border-blue-500 rounded-l-none pl-[10px]'
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
              </div>
            )
          })}
        </nav>

        {/* 底部版本資訊 */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground/60">gin-react-admin v0.1.0</p>
        </div>
      </aside>
    </>
  )
}

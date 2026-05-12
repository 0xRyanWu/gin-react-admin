// src/router/ProtectedRoute.tsx
// 路由守衛：保護需要認證的頁面
// 未登入時重新導向 /login；已登入訪問 /login 時重新導向 /dashboard

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  // redirectTo：未認證時的跳轉目標，預設為 /login
  redirectTo?: string
}

/**
 * ProtectedRoute：確保使用者已登入才能訪問受保護頁面
 */
export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}

/**
 * GuestRoute：已登入使用者不應訪問的頁面（如登入頁）
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

/**
 * RoleProtectedRoute：限制特定角色才能訪問的頁面
 * 未登入 → /login；角色不符 → /dashboard（403）
 */
export function RoleProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: string[]
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

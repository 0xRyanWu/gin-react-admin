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
 * 使用方式：
 *   <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
 *     <Route path="dashboard" element={<DashboardPage />} />
 *   </Route>
 */
export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // 記錄原始路徑，登入後可還原導向
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}

/**
 * GuestRoute：已登入使用者不應訪問的頁面（如登入頁）
 * 已登入時自動導向 /dashboard
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

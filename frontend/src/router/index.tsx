// src/router/index.tsx
// React Router v6 路由樹定義
// 結構：/ → /dashboard（受保護）、/login（公開）

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute, GuestRoute } from './ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'

export const router = createBrowserRouter([
  {
    // 根路由：重新導向至 /dashboard
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    // 公開路由：已登入使用者將被重新導向至 /dashboard
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    // 受保護路由：未登入時重新導向至 /login
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        // /dashboard 預設顯示儀表板頁面
        index: true,
        element: <DashboardPage />,
      },
      // 可在此擴展更多後台頁面，例如：
      // { path: 'articles', element: <ArticlesPage /> },
      // { path: 'users', element: <UsersPage /> },
    ],
  },
])

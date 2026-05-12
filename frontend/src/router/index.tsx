// src/router/index.tsx
// React Router v6 路由樹定義
// 結構：/ → /dashboard（受保護）、/login（公開）

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute, GuestRoute } from './ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ArticlesPage from '@/pages/articles/ArticlesPage'
import SchedulerPage from '@/pages/scheduler/SchedulerPage'
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage'
import UsersPage from '@/pages/users/UsersPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'articles',
        element: <ArticlesPage />,
      },
      {
        path: 'scheduler',
        element: <SchedulerPage />,
      },
      {
        path: 'admin',
        element: <AdminOverviewPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
    ],
  },
])

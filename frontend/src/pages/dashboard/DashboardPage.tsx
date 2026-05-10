// src/pages/dashboard/DashboardPage.tsx
// 後台首頁（佔位頁面）
// 顯示歡迎訊息與基本統計卡片

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { LayoutDashboard, FileText, Users, TrendingUp } from 'lucide-react'

// 統計卡片資料（靜態範例）
const statsCards = [
  { title: '文章總數', value: '128', icon: FileText, desc: '較上月 +12%' },
  { title: '使用者數', value: '2,350', icon: Users, desc: '較上月 +8%' },
  { title: '今日訪問', value: '1,247', icon: TrendingUp, desc: '較昨日 +5%' },
  { title: '系統狀態', value: '正常', icon: LayoutDashboard, desc: '全部服務運行中' },
]

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          歡迎回來，{user?.username ?? '管理員'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          這是您的後台管理儀表板，以下是最新的系統概況。
        </p>
      </div>

      {/* 統計卡片區塊（響應式 Grid） */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快速操作提示 */}
      <Card>
        <CardHeader>
          <CardTitle>快速開始</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>📌 此模板已包含以下功能，可直接基於此進行業務開發：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>JWT 身份驗證（登入/登出）</li>
            <li>文章 CRUD API（<code className="bg-muted px-1 rounded">/api/v1/articles</code>）</li>
            <li>響應式後台佈局（RWD）</li>
            <li>暗黑模式切換</li>
            <li>路由守衛（Protected Route）</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

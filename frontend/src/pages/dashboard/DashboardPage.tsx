// src/pages/dashboard/DashboardPage.tsx
// 後台首頁（企業商務風格）
// 統計卡片 + 近期文章資料表格

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { FileText, Users, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const statsCards = [
  {
    title: '文章總數',
    value: '128',
    change: '+12%',
    trend: 'up',
    desc: '較上月',
    icon: FileText,
    color: 'bg-blue-500',
  },
  {
    title: '使用者數',
    value: '2,350',
    change: '+8%',
    trend: 'up',
    desc: '較上月',
    icon: Users,
    color: 'bg-emerald-500',
  },
  {
    title: '今日訪問',
    value: '1,247',
    change: '+5%',
    trend: 'up',
    desc: '較昨日',
    icon: TrendingUp,
    color: 'bg-violet-500',
  },
  {
    title: '系統負載',
    value: '23%',
    change: '-2%',
    trend: 'down',
    desc: '較昨日',
    icon: Activity,
    color: 'bg-amber-500',
  },
]

const recentArticles = [
  { id: 1, title: 'Gin 框架效能調優實踐',        author: 'admin', status: '已發布', date: '2025-05-10' },
  { id: 2, title: 'React 18 並行模式深入解析',    author: 'admin', status: '已發布', date: '2025-05-09' },
  { id: 3, title: 'PostgreSQL 索引優化指南',      author: 'admin', status: '草稿',   date: '2025-05-08' },
  { id: 4, title: 'Docker Compose 多服務部署',    author: 'admin', status: '已發布', date: '2025-05-07' },
  { id: 5, title: 'JWT 安全最佳實踐',             author: 'admin', status: '草稿',   date: '2025-05-06' },
]

const statusStyles: Record<string, string> = {
  已發布: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  草稿:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          歡迎回來，{user?.username ?? '管理員'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          以下是今日的系統概況與最新動態
        </p>
      </div>

      {/* 統計卡片區塊 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon
          const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight
          const trendColor = card.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
          return (
            <Card key={card.title} className="relative overflow-hidden">
              {/* 頂部色帶 */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${card.color}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-lg ${card.color} bg-opacity-10 flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${card.color.replace('bg-', 'text-')}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
                  <span className={`text-xs font-medium ${trendColor}`}>{card.change}</span>
                  <span className="text-xs text-muted-foreground">{card.desc}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 近期文章表格 */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">近期文章</CardTitle>
            <span className="text-xs text-muted-foreground">最近 5 篇</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">標題</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">作者</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">狀態</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">日期</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map((article, idx) => (
                <tr
                  key={article.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{article.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{article.title}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{article.author}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${statusStyles[article.status]}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs hidden md:table-cell">{article.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 快速開始 */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold">本模板已包含功能</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              'JWT 身份驗證（登入/登出）',
              '文章 CRUD API（/api/v1/articles）',
              '響應式後台佈局（RWD）',
              '暗黑模式切換',
              '路由守衛（Protected Route）',
              'Prometheus 監控指標',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

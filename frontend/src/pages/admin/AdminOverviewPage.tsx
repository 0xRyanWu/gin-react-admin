// src/pages/admin/AdminOverviewPage.tsx
// 超級管理員總覽頁面：顯示系統基本資訊與後端連線狀態

import { useState, useEffect } from 'react'
import { ShieldCheck, Server, RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

interface OverviewData {
  message: string
  user: string
}

interface HealthData {
  status: string
}

export default function AdminOverviewPage() {
  const username = useAuthStore((s) => s.user?.username)
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [health, setHealth] = useState<HealthData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [overviewRes, healthRes] = await Promise.all([
        api.get<OverviewData>('/api/v1/admin/overview'),
        api.get<HealthData>('/health'),
      ])
      setOverview(overviewRes.data)
      setHealth(healthRes.data)
    } catch {
      setError('無法取得管理員資訊，請確認後端是否正常運作')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* 頁頭 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">管理員總覽</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            超級管理員專屬區域，顯示系統連線狀態
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          重新整理
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-20 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">載入中...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={fetchData}>
            重新嘗試
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* 身份卡片 */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">目前登入帳號</p>
                <p className="text-xs text-muted-foreground">超級管理員</p>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">使用者名稱</span>
                <span className="font-medium text-foreground">{username ?? '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">後端回傳訊息</span>
                <span className="font-medium text-foreground">{overview?.message ?? '-'}</span>
              </div>
            </div>
          </div>

          {/* 系統狀態卡片 */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Server className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">系統狀態</p>
                <p className="text-xs text-muted-foreground">後端健康檢查</p>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">後端服務</span>
                {health?.status === 'ok' ? (
                  <span className="flex items-center gap-1 text-emerald-500 font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    正常運作
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-destructive font-medium">
                    <XCircle className="h-3.5 w-3.5" />
                    異常
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">API 版本</span>
                <span className="font-medium text-foreground">v1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RBAC 說明 */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">RBAC 說明</p>
        <p>此頁面需要 <code className="text-xs bg-muted px-1 py-0.5 rounded">superadmin</code> 角色才能存取。</p>
        <p>後端透過 <code className="text-xs bg-muted px-1 py-0.5 rounded">RequireRole("superadmin")</code> middleware 驗證 JWT 中的 role claim，若不符合則回傳 403。</p>
      </div>
    </div>
  )
}

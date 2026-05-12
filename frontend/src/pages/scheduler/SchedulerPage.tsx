// src/pages/scheduler/SchedulerPage.tsx
// 排程管理頁面：顯示已定義的排程任務，支援手動觸發

import { useState, useEffect, useCallback } from 'react'
import { Play, RefreshCw, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { schedulerApi } from '@/services/api'
import type { JobDefinition } from '@/types'

interface TriggerState {
  loading: boolean
  result: 'success' | 'error' | null
  message: string
}

export default function SchedulerPage() {
  const [jobs, setJobs] = useState<JobDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // 每個 job 的觸發狀態
  const [triggerStates, setTriggerStates] = useState<Record<string, TriggerState>>({})

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await schedulerApi.listJobs()
      setJobs(res.data.data ?? [])
    } catch {
      setError('載入排程任務失敗，請確認後端是否連線')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleTrigger = async (jobId: string) => {
    setTriggerStates((prev) => ({
      ...prev,
      [jobId]: { loading: true, result: null, message: '' },
    }))

    try {
      const res = await schedulerApi.triggerJob(jobId)
      setTriggerStates((prev) => ({
        ...prev,
        [jobId]: { loading: false, result: 'success', message: res.data.message },
      }))
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      setTriggerStates((prev) => ({
        ...prev,
        [jobId]: {
          loading: false,
          result: 'error',
          message: axiosError.response?.data?.error ?? '觸發失敗',
        },
      }))
    }

    // 3 秒後清除結果提示
    setTimeout(() => {
      setTriggerStates((prev) => ({
        ...prev,
        [jobId]: { loading: false, result: null, message: '' },
      }))
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* 頁頭 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">排程管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            管理系統背景排程任務（由 asynq + Redis 驅動）
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchJobs} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          重新整理
        </Button>
      </div>

      {/* 說明卡片 */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">架構說明</p>
        <p>排程與手動觸發共用同一個 <code className="text-xs bg-muted px-1 py-0.5 rounded">asynq Worker</code>，任務透過 Redis 佇列傳遞。</p>
        <p>
          <span className="font-medium text-blue-500">手動觸發</span>：點擊「立即執行」→ 任務立即排入佇列 → Worker 立即處理。
        </p>
        <p>
          <span className="font-medium text-blue-500">自動排程</span>：由 <code className="text-xs bg-muted px-1 py-0.5 rounded">asynq.Scheduler</code> 依 Cron 表達式定時推入佇列。
        </p>
      </div>

      {/* 任務列表 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">載入中...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={fetchJobs}>
              重新載入
            </Button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-sm">尚未定義任何排程任務</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">任務名稱</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">說明</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cron 表達式</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const state = triggerStates[job.id]
                return (
                  <tr
                    key={job.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">{job.name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{job.id}</p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground hidden md:table-cell max-w-xs">
                      {job.description}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 font-mono text-xs text-foreground">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {job.cron_spec}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 觸發結果提示 */}
                        {state?.result === 'success' && (
                          <span className="flex items-center gap-1 text-xs text-emerald-500">
                            <CheckCircle className="h-3.5 w-3.5" />
                            已排入佇列
                          </span>
                        )}
                        {state?.result === 'error' && (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <XCircle className="h-3.5 w-3.5" />
                            {state.message}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 h-8"
                          onClick={() => handleTrigger(job.id)}
                          disabled={state?.loading}
                        >
                          {state?.loading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                          立即執行
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

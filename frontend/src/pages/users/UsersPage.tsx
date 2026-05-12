// src/pages/users/UsersPage.tsx
// 使用者管理頁面（superadmin 限定）：CRUD 操作

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, RefreshCw, Loader2, Search,
  ChevronLeft, ChevronRight, ShieldCheck, User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { userApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types'

// ─── 角色標籤 ───────────────────────────────────────────────
function RoleBadge({ role }: { role?: string }) {
  if (role === 'superadmin') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-500">
        <ShieldCheck className="h-3 w-3" />
        超級管理員
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <UserIcon className="h-3 w-3" />
      一般使用者
    </span>
  )
}

// ─── 新增 / 編輯 Modal ──────────────────────────────────────
interface UserModalProps {
  editTarget: User | null        // null = 新增模式
  onClose: () => void
  onSaved: () => void
}

function UserModal({ editTarget, onClose, onSaved }: UserModalProps) {
  const isEdit = editTarget !== null
  const [username, setUsername] = useState(editTarget?.username ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<string>(editTarget?.role ?? 'user')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      if (isEdit) {
        const req: UpdateUserRequest = {}
        if (username !== editTarget.username) req.username = username
        if (password) req.password = password
        if (role !== editTarget.role) req.role = role
        await userApi.update(editTarget.id, req)
      } else {
        const req: CreateUserRequest = { username, password, role }
        await userApi.create(req)
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      setError(axiosError.response?.data?.error ?? '操作失敗')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? '編輯使用者' : '新增使用者'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">使用者名稱</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="請輸入使用者名稱"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              密碼{isEdit && <span className="text-muted-foreground font-normal ml-1">（留空表示不更新）</span>}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? '不更改請留空' : '請輸入密碼（最少 6 字元）'}
              minLength={isEdit ? 0 : 6}
              required={!isEdit}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">角色</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="user">一般使用者</option>
              <option value="superadmin">超級管理員</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEdit ? '儲存' : '新增'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── 主頁面 ─────────────────────────────────────────────────
export default function UsersPage() {
  const currentUsername = useAuthStore((s) => s.user?.username)
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal 狀態
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)

  // 刪除確認狀態
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await userApi.list(page, pageSize)
      setUsers(res.data.data ?? [])
      setTotal(res.data.total)
    } catch {
      setError('載入使用者列表失敗')
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await userApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      fetchUsers()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      setError(axiosError.response?.data?.error ?? '刪除失敗')
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // 客戶端搜尋（依 username 過濾）
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6">
      {/* 頁頭 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">使用者管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            管理系統使用者帳號與角色（共 {total} 筆）
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            重新整理
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => { setEditTarget(null); setShowModal(true) }}
          >
            <Plus className="h-4 w-4" />
            新增使用者
          </Button>
        </div>
      </div>

      {/* 搜尋列 */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜尋使用者名稱..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 表格 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">載入中...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            {search ? '查無符合的使用者' : '尚無使用者資料'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-16">ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">使用者名稱</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">角色</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">建立時間</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{user.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{user.username}</span>
                      {user.username === currentUsername && (
                        <span className="text-xs text-muted-foreground">（你）</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('zh-TW')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => { setEditTarget(user); setShowModal(true) }}
                        title="編輯"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(user)}
                        disabled={user.username === currentUsername}
                        title={user.username === currentUsername ? '不可刪除自身帳號' : '刪除'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分頁 */}
      {!search && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>第 {page} / {totalPages} 頁，共 {total} 筆</span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 新增 / 編輯 Modal */}
      {showModal && (
        <UserModal
          editTarget={editTarget}
          onClose={() => setShowModal(false)}
          onSaved={fetchUsers}
        />
      )}

      {/* 刪除確認 Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">確認刪除</h2>
            <p className="text-sm text-muted-foreground">
              確定要刪除使用者「<span className="font-medium text-foreground">{deleteTarget.username}</span>」嗎？
              此操作無法復原。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                確認刪除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// src/pages/articles/ArticlesPage.tsx
// 文章管理頁面（完整 CRUD）

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { articleApi } from '@/services/api'
import type { Article, CreateArticleRequest } from '@/types'

// ── 新增 / 編輯 Modal ────────────────────────────────────────────────────────

interface ArticleModalProps {
  article?: Article | null
  onSave: (data: CreateArticleRequest) => Promise<void>
  onClose: () => void
  isSaving: boolean
}

function ArticleModal({ article, onSave, onClose, isSaving }: ArticleModalProps) {
  const [title, setTitle] = useState(article?.title ?? '')
  const [content, setContent] = useState(article?.content ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await onSave({ title: title.trim(), content: content.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-card border border-border shadow-2xl p-6 mx-4">
        <h2 className="text-lg font-semibold text-foreground mb-5">
          {article ? '編輯文章' : '新增文章'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">標題 *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="請輸入文章標題"
              autoFocus
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">內容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="請輸入文章內容（選填）"
              rows={5}
              disabled={isSaving}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
              取消
            </Button>
            <Button type="submit" disabled={!title.trim() || isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {article ? '儲存變更' : '新增文章'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── 刪除確認 Modal ──────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  title: string
  onConfirm: () => Promise<void>
  onClose: () => void
  isDeleting: boolean
}

function DeleteConfirmModal({ title, onConfirm, onClose, isDeleting }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-card border border-border shadow-2xl p-6 mx-4">
        <h2 className="text-lg font-semibold text-foreground mb-2">確認刪除</h2>
        <p className="text-sm text-muted-foreground mb-6">
          確定要刪除「<span className="font-medium text-foreground">{title}</span>」？此操作無法復原。
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            刪除
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── 主頁面 ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modal 狀態
  const [editingArticle, setEditingArticle] = useState<Article | null | undefined>(undefined)
  // undefined = closed, null = new, Article = editing
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchArticles = useCallback(async (currentPage: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await articleApi.list(currentPage, PAGE_SIZE)
      setArticles(res.data.data ?? [])
      setTotal(res.data.total ?? 0)
    } catch {
      setError('載入文章失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles(page)
  }, [page, fetchArticles])

  const handleSave = async (data: CreateArticleRequest) => {
    setIsSaving(true)
    try {
      if (editingArticle) {
        await articleApi.update(editingArticle.id, data)
      } else {
        await articleApi.create(data)
        setPage(1)
      }
      setEditingArticle(undefined)
      await fetchArticles(editingArticle ? page : 1)
    } catch {
      // 保持 modal 開著讓使用者重試
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingArticle) return
    setIsDeleting(true)
    try {
      await articleApi.delete(deletingArticle.id)
      setDeletingArticle(null)
      // 若刪除後該頁無資料，往前翻一頁
      const newTotal = total - 1
      const maxPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE))
      const targetPage = Math.min(page, maxPage)
      setPage(targetPage)
      await fetchArticles(targetPage)
    } catch {
      setIsDeleting(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredArticles = search.trim()
    ? articles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    : articles

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <div className="space-y-6">
      {/* 頁頭 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">文章管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">共 {total} 篇文章</p>
        </div>
        <Button onClick={() => setEditingArticle(null)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          新增文章
        </Button>
      </div>

      {/* 搜尋列 */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜尋文章標題..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 表格 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">載入中...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => fetchArticles(page)}>
              重新載入
            </Button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-sm">{search ? '找不到符合的文章' : '尚無文章，立即新增第一篇！'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">標題</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">建立日期</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">更新日期</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article, idx) => (
                <tr
                  key={article.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground truncate max-w-[240px]">{article.title}</p>
                    {article.content && (
                      <p className="text-xs text-muted-foreground truncate max-w-[240px] mt-0.5">
                        {article.content}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell tabular-nums">
                    {formatDate(article.created_at)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell tabular-nums">
                    {formatDate(article.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingArticle(article)}
                        aria-label="編輯"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeletingArticle(article)}
                        aria-label="刪除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            第 {page} / {totalPages} 頁
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingArticle !== undefined && (
        <ArticleModal
          article={editingArticle}
          onSave={handleSave}
          onClose={() => setEditingArticle(undefined)}
          isSaving={isSaving}
        />
      )}
      {deletingArticle && (
        <DeleteConfirmModal
          title={deletingArticle.title}
          onConfirm={handleDelete}
          onClose={() => setDeletingArticle(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}

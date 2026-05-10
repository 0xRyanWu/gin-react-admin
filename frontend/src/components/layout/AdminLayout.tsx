// src/components/layout/AdminLayout.tsx
// 後台主佈局元件
// 組合 Sidebar + Header + 主要內容區域（<Outlet />）
// 使用 useState 管理手機端 Sidebar 開關狀態

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AdminLayout() {
  // 控制手機端 Sidebar 開關
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    // 整體佈局：桌機端左右並排（lg:flex），手機端上下堆疊
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 左側：Sidebar（桌機端固定，手機端 Overlay） */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 右側：Header + 主要內容區域 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 頂部導覽列 */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* 主要內容區域：可捲動 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* React Router 的子路由渲染位置 */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}

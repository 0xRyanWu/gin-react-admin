// src/lib/utils.ts
// shadcn/ui 工具函式：合併 Tailwind CSS class 名稱

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn：合併多個 class 名稱，自動解決 Tailwind CSS 衝突
 * 使用範例：cn('px-4 py-2', isActive && 'bg-blue-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

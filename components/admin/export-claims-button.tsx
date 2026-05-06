'use client'

import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { exportGiftClaimsCSV } from '@/app/admin/gift-claims/actions'

export function ExportClaimsButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    try {
      setLoading(true)
      const csv = await exportGiftClaimsCSV()
      
      // 创建 Blob 并下载
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `礼品申领表_${new Date().toLocaleString('zh-CN')}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('[v0] 导出失败:', error)
      alert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      variant="outline"
      className="w-full gap-2 sm:w-auto"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          导出中...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          下载申领表
        </>
      )}
    </Button>
  )
}

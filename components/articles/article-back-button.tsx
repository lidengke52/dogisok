'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function ArticleBackButton() {
  const router = useRouter()

  const handleBack = () => {
    // 不清除 sessionStorage，让浏览器返回时能够恢复
    router.back()
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to articles
    </button>
  )
}

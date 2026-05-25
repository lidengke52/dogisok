"use client"

import { useEffect } from "react"

export function ArticleScrollRestorer() {
  useEffect(() => {
    // 延迟一帧，确保 DOM 完全渲染后再恢复滚动
    const timer = setTimeout(() => {
      const savedScrollY = sessionStorage.getItem("articles_scroll_y")
      if (savedScrollY) {
        const scrollY = parseInt(savedScrollY, 10)
        window.scrollTo({ top: scrollY, behavior: "auto" })
        console.log("[v0] Restored scroll position to:", scrollY)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  return null
}

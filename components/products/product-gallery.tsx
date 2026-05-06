"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * 商品图片画廊：上方主图 + 下方缩略图栏（仅在有 2 张及以上图片时显示）。
 * 仅做客户端切换，不带预览弹窗，保持详情页轻量。
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  if (images.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
        <Image
          src={images[active] || "/placeholder.svg"}
          alt={alt}
          fill
          sizes="(min-width: 768px) 400px, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`查看第 ${idx + 1} 张图片`}
              aria-pressed={idx === active}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2 transition",
                idx === active ? "border-primary" : "border-transparent hover:border-muted-foreground/40",
              )}
            >
              <Image
                src={src || "/placeholder.svg"}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

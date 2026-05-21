"use client"

import { useRef, useState } from "react"
import { Upload, X, Link as LinkIcon, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Props {
  name: string
  defaultValue?: string
}

export function ImageUploader({ name, defaultValue = "" }: Props) {
  const [tab, setTab] = useState<"upload" | "url">(defaultValue ? "url" : "upload")
  // savedUrl: 最终写入数据库的值（Blob URL 或外部 URL）
  const [savedUrl, setSavedUrl] = useState(defaultValue)
  // previewSrc: 仅用于 <img> 展示，本地上传时使用 objectURL 无需代理
  const [previewSrc, setPreviewSrc] = useState(defaultValue)
  const [urlInput, setUrlInput] = useState(defaultValue)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件（JPG / PNG / WebP）")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过 5MB")
      return
    }
    setError("")
    setUploading(true)

    // 立即用 objectURL 显示预览，不依赖网络
    const localUrl = URL.createObjectURL(file)
    setPreviewSrc(localUrl)

    try {
      const form = new FormData()
      form.append("file", file)
      console.log("[v0] Starting upload for:", file.name)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      console.log("[v0] Upload response status:", res.status)
      
      if (!res.ok) {
        let errorMsg = `Upload failed (${res.status})`
        try {
          const data = await res.json()
          errorMsg = data.error || errorMsg
        } catch (e) {
          const text = await res.text()
          console.log("[v0] Response body:", text)
        }
        throw new Error(errorMsg)
      }
      
      const { url } = await res.json()
      console.log("[v0] Received URL:", url)
      
      if (!url || typeof url !== "string") {
        throw new Error("Server returned invalid URL: " + JSON.stringify(url))
      }
      
      // 验证返回的 URL 是否有效
      try {
        new URL(url)
      } catch {
        throw new Error("Invalid URL format: " + url)
      }
      
      // 上传完成后保存 URL
      setSavedUrl(url)
      setPreviewSrc(url)
      console.log("[v0] Upload successful")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      setError(msg)
      console.log("[v0] Upload error:", msg)
      // 上传失败时恢复预览为已保存的 URL
      setPreviewSrc(savedUrl)
    } finally {
      setUploading(false)
    }
  }

  const confirmUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    setSavedUrl(url)
    setPreviewSrc(url)
    setError("")
  }

  const clear = () => {
    setSavedUrl("")
    setPreviewSrc("")
    setUrlInput("")
    setError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-3">
      {/* Tab 切换 */}
      <div className="flex rounded-lg border border-border overflow-hidden text-sm">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors",
            tab === "upload" ? "bg-foreground text-background font-medium" : "hover:bg-muted"
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          本地上传
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors",
            tab === "url" ? "bg-foreground text-background font-medium" : "hover:bg-muted"
          )}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          URL 链接
        </button>
      </div>

      {/* 本地上传区域 */}
      {tab === "upload" && (
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) upload(f) }}
        >
          <Upload className="h-7 w-7 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{uploading ? "上传中..." : "拖拽图片到此，或点击选择"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">支持 JPG、PNG、WebP，最大 5MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }}
          />
        </div>
      )}

      {/* URL 输入区域 */}
      {tab === "url" && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/dog.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirmUrl() } }}
            className="font-mono text-xs"
          />
          <Button type="button" variant="outline" onClick={confirmUrl} disabled={!urlInput.trim()}>
            确认
          </Button>
        </div>
      )}

      {/* 错误提示 */}
      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* 预览 */}
      {previewSrc ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">预览</Label>
          <div className="relative w-full rounded-lg border border-border bg-muted overflow-hidden" style={{ aspectRatio: "1/1" }}>
            {/* 使用原生 img 标签避免 Next.js Image 域名限制问题 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="广告图预览"
              className="h-full w-full object-cover"
              onError={() => { setError("图片加载失败，请检查 URL"); setPreviewSrc("") }}
            />
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1 hover:bg-background transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30"
          style={{ aspectRatio: "1/1" }}
        >
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-7 w-7 mb-1 opacity-30" />
            <p className="text-xs">暂无图片</p>
          </div>
        </div>
      )}

      {/* 存储最终 URL，供 form action 提交使用 */}
      <input type="hidden" name={name} value={savedUrl} />
    </div>
  )
}

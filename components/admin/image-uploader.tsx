"use client"

import { useRef, useState, useEffect } from "react"
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
  const [tab, setTab] = useState<"upload" | "url">("upload")
  const [savedUrl, setSavedUrl] = useState(defaultValue)
  const [previewSrc, setPreviewSrc] = useState(defaultValue)
  const [urlInput, setUrlInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 当 defaultValue 变化时同步（编辑模式页面初始化 / 切换不同条目）
  useEffect(() => {
    setSavedUrl(defaultValue)
    setPreviewSrc(defaultValue)
    // 有已保存图片时，切到 URL tab 并显示当前值，方便用户看到和修改
    if (defaultValue) {
      setTab("url")
      setUrlInput(defaultValue)
    } else {
      setTab("upload")
      setUrlInput("")
    }
  }, [defaultValue])

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

    // 立即用 objectURL 预览，不等待网络
    const localPreview = URL.createObjectURL(file)
    setPreviewSrc(localPreview)

    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `上传失败 (${res.status})`)
      }
      const { url } = await res.json()
      if (!url) throw new Error("服务器未返回 URL")

      // 将服务器返回的持久化 URL 写入 savedUrl（会同步到 hidden input）
      setSavedUrl(url)
      // 预览保持 objectURL，用户可以立即看到图片
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败")
      // 上传失败时恢复预览
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
            <p className="text-xs text-muted-foreground mt-0.5">支持 JPG、PNG、WebP，最大 5MB，推荐 1:1 比例</p>
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
            placeholder="https://example.com/image.jpg"
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="图片预览"
              className="h-full w-full object-contain"
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

      {/* 提交给 form action 的隐藏字段 */}
      <input type="hidden" name={name} value={savedUrl} />
    </div>
  )
}

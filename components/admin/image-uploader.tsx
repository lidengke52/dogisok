"use client"

import { useState } from "react"
import Image from "next/image"
import { Upload, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  name: string
}

export function ImageUploader({ value, onChange, name }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(value || "")
  const [urlInput, setUrlInput] = useState(value || "")
  const [error, setError] = useState("")
  const [imageLoading, setImageLoading] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过 5MB")
      return
    }

    setError("")
    setUploading(true)
    setImageLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("[v0] Uploading file:", file.name)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "上传失败")
      }

      const data = await response.json()
      const imageUrl = data.url
      console.log("[v0] Upload successful, URL:", imageUrl)

      onChange(imageUrl)
      setPreview(imageUrl)
      setUrlInput(imageUrl)
      toast.success("图片上传成功")
    } catch (err) {
      const message = err instanceof Error ? err.message : "上传失败"
      console.error("[v0] Upload error:", message)
      setError(message)
      toast.error(message)
    } finally {
      setUploading(false)
      setImageLoading(false)
    }
  }

  const handleUrlChange = (url: string) => {
    setUrlInput(url)
    setError("")
  }

  const handleUrlSave = () => {
    if (!urlInput.trim()) {
      setError("请输入有效的URL")
      return
    }

    onChange(urlInput)
    setPreview(urlInput)
    toast.success("图片URL已保存")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleClear = () => {
    onChange("")
    setPreview("")
    setUrlInput("")
    setError("")
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">本地上传</TabsTrigger>
          <TabsTrigger value="url">URL链接</TabsTrigger>
        </TabsList>

        {/* 本地上传 */}
        <TabsContent value="upload" className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary hover:bg-muted/50"
          >
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">拖拽图片到此，或点击选择</p>
            <p className="text-xs text-muted-foreground">支持 JPG、PNG、WebP 等格式，最大 5MB</p>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0]
                if (file) handleFileUpload(file)
              }}
              disabled={uploading}
              className="mt-4"
            />
          </div>
        </TabsContent>

        {/* URL链接 */}
        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">图片 URL</Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              disabled={uploading}
            />
            <Button onClick={handleUrlSave} disabled={uploading || !urlInput.trim()} className="w-full">
              {uploading ? "处理中..." : "确认URL"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 预览 */}
      {preview && (
        <div className="space-y-2">
          <Label>预览</Label>
          <div className="relative inline-block w-full max-w-xs overflow-hidden rounded-lg border border-border bg-muted">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-primary" />
              </div>
            )}
            <Image
              src={preview}
              alt="Preview"
              width={300}
              height={200}
              className="h-48 w-full object-cover"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false)
                setError("图片加载失败，请检查URL")
              }}
            />
            {preview && !imageLoading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 bg-background/80 hover:bg-background"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground break-all">{preview}</p>
        </div>
      )}

      {/* 隐藏的input存储最终值 */}
      <input type="hidden" name={name} value={preview} />
    </div>
  )
}

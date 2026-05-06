"use client"

import { useActionState, useRef, useState } from "react"
import Link from "next/link"
import { upload } from "@vercel/blob/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { ArrowDown, ArrowUp, ImageIcon, Loader2, Plus, Trash2, Upload, UploadCloud } from "lucide-react"
import { createProduct, updateProduct, type ProductFormState } from "@/app/admin/products/actions"

const MAX_IMAGES = 7

type Defaults = {
  name?: string
  description?: string | null
  image_url?: string | null
  order_index?: number
  features?: string[] | null
  images?: string[] | null
}

export function ProductForm({ id, defaults }: { id?: string; defaults?: Defaults }) {
  const action = id
    ? (async (state: ProductFormState, formData: FormData) => updateProduct(id, state, formData))
    : createProduct

  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, {})

  // 卖点：始终至少留一行，方便填写
  const [features, setFeatures] = useState<string[]>(() => {
    const initial = defaults?.features ?? []
    return initial.length > 0 ? initial : [""]
  })

  // 图片：兼容老数据：images 为空但 image_url 有值时自动迁移到 images
  const [images, setImages] = useState<string[]>(() => {
    const initial = defaults?.images ?? []
    if (initial.length > 0) return initial
    if (defaults?.image_url) return [defaults.image_url]
    return []
  })

  // uploadingIdx 用 Set 表示哪些位置正在上传，支持多文件并发
  const [uploadingIdx, setUploadingIdx] = useState<Set<number>>(new Set())
  const [bulkUploading, setBulkUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function updateFeature(i: number, v: string) {
    setFeatures((prev) => prev.map((f, idx) => (idx === i ? v : f)))
  }
  function addFeature() {
    setFeatures((prev) => [...prev, ""])
  }
  function removeFeature(i: number) {
    setFeatures((prev) => (prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i)))
  }
  function moveFeature(i: number, dir: -1 | 1) {
    setFeatures((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function updateImage(i: number, v: string) {
    setImages((prev) => prev.map((u, idx) => (idx === i ? v : u)))
  }
  function addImageSlot() {
    if (images.length >= MAX_IMAGES) return
    setImages((prev) => [...prev, ""])
  }
  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i))
  }
  function moveImage(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  /**
   * 上传单文件到 Vercel Blob（客户端直传，无 4.5MB 限制）。
   *
   * 项目使用 private Blob store，blob.url 不能公开访问，
   * 因此返回的是经过我们代理路由 `/api/files?pathname=...` 的公共可访问 URL。
   */
  async function uploadOne(file: File): Promise<string> {
    const blob = await upload(file.name, file, {
      access: "private",
      handleUploadUrl: "/api/admin/upload",
    })
    return `/api/files?pathname=${encodeURIComponent(blob.pathname)}`
  }

  /** 单槽位"上传/替换"：本槽接收第 1 张，其余追加到末尾，整体不超过 7 张 */
  async function handleSlotUpload(files: FileList, idx: number) {
    setUploadError(null)
    const list = Array.from(files)
    if (list.length === 0) return

    // 标记当前 idx 上传中
    setUploadingIdx((s) => new Set(s).add(idx))
    try {
      // 计算可追加多少张（除当前槽外的剩余空间）
      const remaining = Math.max(0, MAX_IMAGES - images.length)
      const extras = list.slice(1, 1 + remaining) // 替换当前槽 + 追加 N 张
      const firstUrl = await uploadOne(list[0])
      updateImage(idx, firstUrl)

      if (extras.length > 0) {
        // 先占位，避免 race 时 idx 错乱
        setImages((prev) => [...prev, ...extras.map(() => "")])
        const baseLen = images.length // 闭包基线
        const results = await Promise.allSettled(extras.map((f) => uploadOne(f)))
        setImages((prev) => {
          const next = [...prev]
          results.forEach((r, k) => {
            const targetIdx = baseLen + k
            if (r.status === "fulfilled") next[targetIdx] = r.value
          })
          return next
        })
        const failed = results.filter((r) => r.status === "rejected").length
        if (failed > 0) setUploadError(`有 ${failed} 张图片上传失败，请重试`)
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "上传失败")
    } finally {
      setUploadingIdx((s) => {
        const next = new Set(s)
        next.delete(idx)
        return next
      })
    }
  }

  /** 批量上传：把所选文件按顺序追加到末尾，最多到 7 张 */
  async function handleBulkUpload(files: FileList) {
    setUploadError(null)
    const list = Array.from(files)
    if (list.length === 0) return

    const remaining = Math.max(0, MAX_IMAGES - images.length)
    const accepted = list.slice(0, remaining)
    const skipped = list.length - accepted.length
    if (accepted.length === 0) {
      setUploadError(`已达上限 ${MAX_IMAGES} 张`)
      return
    }

    // 先占位
    const baseLen = images.length
    setImages((prev) => [...prev, ...accepted.map(() => "")])
    setBulkUploading(true)
    try {
      const results = await Promise.allSettled(accepted.map((f) => uploadOne(f)))
      setImages((prev) => {
        const next = [...prev]
        results.forEach((r, k) => {
          const targetIdx = baseLen + k
          if (r.status === "fulfilled") next[targetIdx] = r.value
        })
        return next
      })
      const failed = results.filter((r) => r.status === "rejected").length
      const parts: string[] = []
      if (failed > 0) parts.push(`${failed} 张上传失败`)
      if (skipped > 0) parts.push(`${skipped} 张被跳过（超出 ${MAX_IMAGES} 张上限）`)
      if (parts.length > 0) setUploadError(parts.join("；"))
    } finally {
      setBulkUploading(false)
    }
  }

  // 表单提交前，把 features / images 序列化为同名多值 FormData 项
  const cleanedFeatures = features.map((f) => f.trim()).filter(Boolean)
  const cleanedImages = images.map((u) => u.trim()).filter(Boolean)
  const mainImage = cleanedImages[0] ?? ""

  return (
    <form action={formAction}>
      {/* 同名多值 hidden 输入，actions 端用 formData.getAll() 读取 */}
      {cleanedFeatures.map((f, i) => (
        <input key={`f-${i}`} type="hidden" name="features" value={f} />
      ))}
      {cleanedImages.map((u, i) => (
        <input key={`i-${i}`} type="hidden" name="images" value={u} />
      ))}
      {/* 主图 URL 同步给旧字段 image_url，保持向后兼容 */}
      <input type="hidden" name="image_url" value={mainImage} />

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">商品名称</FieldLabel>
          <Input id="name" name="name" required defaultValue={defaults?.name ?? ""} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">描述</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={defaults?.description ?? ""}
            placeholder="例如：成分、规格、适用宠物等"
          />
        </Field>

        {/* 卖点 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">卖点</Label>
              <p className="text-xs text-muted-foreground mt-1">
                每行一个，前台会按顺序展示。可点击右侧按钮调整顺序或删除。
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFeature}
              className="gap-1 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              新增卖点
            </Button>
          </div>

          <ul className="space-y-2">
            {features.map((value, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-6 text-center text-xs text-muted-foreground">{i + 1}.</span>
                <Input
                  value={value}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  placeholder="例如：天然成分，免疫支持"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveFeature(i, -1)}
                    disabled={i === 0}
                    aria-label="上移"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveFeature(i, 1)}
                    disabled={i === features.length - 1}
                    aria-label="下移"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(i)}
                    aria-label="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 图片 */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Label className="text-sm font-medium">商品图片</Label>
              <p className="text-xs text-muted-foreground mt-1">
                建议方形比例（1:1），最多 {MAX_IMAGES} 张；第 1 张为列表与详情页主图。可上传文件，也可粘贴外链 URL。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BulkUploadButton
                disabled={images.length >= MAX_IMAGES || bulkUploading}
                uploading={bulkUploading}
                onFiles={handleBulkUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageSlot}
                disabled={images.length >= MAX_IMAGES}
                className="gap-1 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                空槽（{images.length}/{MAX_IMAGES}）
              </Button>
            </div>
          </div>

          {images.length === 0 ? (
            <BulkDropzone disabled={bulkUploading} uploading={bulkUploading} onFiles={handleBulkUpload} />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {images.map((url, i) => (
                <ImageSlot
                  key={i}
                  index={i}
                  url={url}
                  isMain={i === 0}
                  uploading={uploadingIdx.has(i)}
                  onChange={(v) => updateImage(i, v)}
                  onUpload={(files) => handleSlotUpload(files, i)}
                  onMoveUp={() => moveImage(i, -1)}
                  onMoveDown={() => moveImage(i, 1)}
                  onRemove={() => removeImage(i)}
                  disableUp={i === 0}
                  disableDown={i === images.length - 1}
                />
              ))}
            </div>
          )}

          {uploadError ? (
            <p role="alert" className="text-sm text-destructive">
              {uploadError}
            </p>
          ) : null}
        </div>

        <Field>
          <FieldLabel htmlFor="order_index">显示顺序</FieldLabel>
          <Input
            id="order_index"
            name="order_index"
            type="number"
            step={1}
            defaultValue={defaults?.order_index ?? 0}
          />
          <FieldDescription>数值越小排越前。默认 0。</FieldDescription>
        </Field>

        {state.error && <FieldError>{state.error}</FieldError>}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending && <Spinner className="mr-1 h-4 w-4" />}
            {id ? "保存修改" : "创建商品"}
          </Button>
          <Button asChild type="button" variant="ghost">
            <Link href="/admin/products">取消</Link>
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}

/** 顶部"批量上传图片"按钮：选多张并发上传到末尾 */
function BulkUploadButton({
  disabled,
  uploading,
  onFiles,
}: {
  disabled: boolean
  uploading: boolean
  onFiles: (files: FileList) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onFiles(e.target.files)
          e.currentTarget.value = ""
        }}
      />
      <Button
        type="button"
        size="sm"
        onClick={() => ref.current?.click()}
        disabled={disabled}
        className="gap-1"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        批量上传
      </Button>
    </>
  )
}

/** 空状态时的大块拖放区（同样支持多选） */
function BulkDropzone({
  disabled,
  uploading,
  onFiles,
}: {
  disabled: boolean
  uploading: boolean
  onFiles: (files: FileList) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => ref.current?.click()}
      className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-muted/40 disabled:opacity-60"
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onFiles(e.target.files)
          e.currentTarget.value = ""
        }}
      />
      {uploading ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin" />
          上传中...
        </>
      ) : (
        <>
          <UploadCloud className="h-6 w-6" />
          点击选择图片（可多选，最多 {MAX_IMAGES} 张）
        </>
      )}
    </button>
  )
}

type ImageSlotProps = {
  index: number
  url: string
  isMain: boolean
  uploading: boolean
  onChange: (v: string) => void
  onUpload: (files: FileList) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  disableUp: boolean
  disableDown: boolean
}

function ImageSlot({
  index,
  url,
  isMain,
  uploading,
  onChange,
  onUpload,
  onMoveUp,
  onMoveDown,
  onRemove,
  disableUp,
  disableDown,
}: ImageSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">
          图 {index + 1}
          {isMain ? (
            <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-primary">主图</span>
          ) : null}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={disableUp}
            aria-label="上移"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={disableDown}
            aria-label="下移"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="删除">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded bg-muted">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url || "/placeholder.svg"} alt={`图 ${index + 1}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            上传中...
          </div>
        ) : null}
      </div>

      <Input value={url} onChange={(e) => onChange(e.target.value)} placeholder="图片 URL，可直接粘贴外链" />

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) onUpload(e.target.files)
            e.currentTarget.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-1 bg-transparent"
        >
          <Upload className="h-4 w-4" />
          {url ? "替换/追加" : "上传图片"}
        </Button>
      </div>
    </div>
  )
}

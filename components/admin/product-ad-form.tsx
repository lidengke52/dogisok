"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ImageUploader } from "@/components/admin/image-uploader"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { createProductAd, updateProductAd, type AdFormState } from "@/app/admin/product-ads/actions"
import type { ProductAd } from "@/lib/product-ads"

type Props = {
  ad?: ProductAd
}

export function ProductAdForm({ ad }: Props) {
  const isEdit = Boolean(ad)

  // 与 BreedForm 完全相同的写法：用 .bind() 预绑定 id，useActionState 自动注入 (prev, formData)
  const actionFn = isEdit && ad
    ? updateProductAd.bind(null, ad.id)
    : createProductAd

  const [state, formAction, isPending] = useActionState<AdFormState, FormData>(actionFn, {})

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link href="/admin/product-ads">
            <ArrowLeft className="h-4 w-4" />
            返回广告列表
          </Link>
        </Button>
        <Button type="submit" disabled={isPending} className="gap-1.5">
          <Save className="h-4 w-4" />
          {isPending ? "保存中..." : isEdit ? "保存修改" : "创建广告"}
        </Button>
      </div>

      {state?.error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={200}
              defaultValue={ad?.title ?? ""}
              placeholder="广告标题"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">简短描述</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              maxLength={400}
              defaultValue={ad?.description ?? ""}
              placeholder="1-2 句话，展示在广告卡片标题下方"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link_url">跳转链接 *</Label>
            <Input
              id="link_url"
              name="link_url"
              type="url"
              required
              placeholder="https://amazon.com/..."
              defaultValue={ad?.link_url ?? ""}
            />
            <p className="text-xs text-muted-foreground">用户点击广告时跳转到该地址，必须以 https:// 开头。</p>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active" className="text-sm font-medium">对访客可见</Label>
              <Switch id="is_active" name="is_active" defaultChecked={ad?.is_active ?? true} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">关闭后广告不会在前台展示。</p>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="space-y-1.5">
              <Label htmlFor="placement">投放位置 *</Label>
              <select
                id="placement"
                name="placement"
                required
                defaultValue={ad?.placement ?? "home"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="home">首页</option>
                <option value="articles">文章列表页</option>
                <option value="consultation">Dr. Max 页</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="display_order">显示顺序</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                min={0}
                defaultValue={ad?.display_order ?? 0}
              />
              <p className="text-xs text-muted-foreground">同位置多条广告时数字越小越靠前。</p>
            </div>

            <div className="space-y-1.5">
              <Label>广告图片</Label>
              <ImageUploader name="image_url" defaultValue={ad?.image_url ?? ""} />
              <p className="text-xs text-muted-foreground">建议 1:1 正方形（如 800×800）。留空则使用默认占位图标。</p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}

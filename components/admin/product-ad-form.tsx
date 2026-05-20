"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { ImageUploader } from "@/components/admin/image-uploader"
import { createProductAd, updateProductAd, type AdFormState } from "@/app/admin/product-ads/actions"
import type { ProductAd } from "@/lib/product-ads"

type Props = {
  ad?: ProductAd
}

export function ProductAdForm({ ad }: Props) {
  const isEdit = Boolean(ad)
  const action = isEdit ? updateProductAd.bind(null, ad!.id) : createProductAd
  const [state, formAction, isPending] = useActionState<AdFormState, FormData>(action, {})

  return (
    <form action={formAction} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">标题 *</FieldLabel>
          <Input id="title" name="title" defaultValue={ad?.title ?? ""} required maxLength={200} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">简短描述</FieldLabel>
          <Textarea
            id="description"
            name="description"
            defaultValue={ad?.description ?? ""}
            rows={3}
            maxLength={400}
          />
          <FieldDescription>1-2 句话,展示在广告卡片标题下方。</FieldDescription>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="placement">投放位置 *</FieldLabel>
            <select
              id="placement"
              name="placement"
              defaultValue={ad?.placement ?? "home"}
              required
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="home">首页</option>
              <option value="articles">文章列表页</option>
              <option value="consultation">Dr. Max 页</option>
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="display_order">显示顺序</FieldLabel>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={ad?.display_order ?? 0}
              min={0}
            />
            <FieldDescription>同一投放位置下若有多条启用广告，将随机展示其中一条；只有一条时，按数字升序作为默认顺序。</FieldDescription>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="link_url">跳转链接 *</FieldLabel>
          <Input
            id="link_url"
            name="link_url"
            type="url"
            placeholder="https://amazon.com/..."
            defaultValue={ad?.link_url ?? ""}
            required
          />
          <FieldDescription>用户点击广告时跳转到该地址。必须以 https:// 开头。</FieldDescription>
        </Field>

        <Field>
          <FieldLabel>图片</FieldLabel>
          <ImageUploader name="image_url" defaultValue={ad?.image_url ?? ""} />
          <FieldDescription>选填。建议尺寸 1:1 正方形（如 800×800）。留空则使用默认占位图标。</FieldDescription>
        </Field>

        <Field orientation="horizontal">
          <Switch id="is_active" name="is_active" defaultChecked={ad?.is_active ?? true} />
          <FieldLabel htmlFor="is_active" className="font-medium">
            对访客可见
          </FieldLabel>
        </Field>
      </FieldGroup>

      {state?.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : isEdit ? "保存修改" : "创建广告"}
        </Button>
        <Button asChild variant="ghost" type="button">
          <Link href="/admin/product-ads">取消</Link>
        </Button>
      </div>
    </form>
  )
}

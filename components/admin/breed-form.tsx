"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUploader } from "@/components/admin/image-uploader"
import type { Breed } from "@/lib/breeds"
import { createBreed, updateBreed, type BreedFormState } from "@/app/admin/breeds/actions"

type Props = {
  mode: "create" | "edit"
  breed?: Breed
  /** 编辑模式下需要传入当前 slug，用于在客户端绑定到 updateBreed */
  slug?: string
}

const GROUPS = ["Sporting", "Herding", "Working", "Toy", "Non-Sporting", "Terrier", "Hound"]
const SIZES = ["Small", "Medium", "Large"]

export function BreedForm({ mode, breed, slug }: Props) {
  // 在客户端把 slug 绑定到 Server Action 上，这样父级 Server Component 只需要传基础数据，
  // 不会跨 Server/Client 边界传递包装函数（这是不允许的）。
  const actionFn =
    mode === "edit" && slug
      ? (prev: BreedFormState, formData: FormData) => updateBreed(slug, prev, formData)
      : createBreed

  const [state, formAction, pending] = useActionState<BreedFormState, FormData>(actionFn, {})
  const [imageUrl, setImageUrl] = useState(breed?.image ?? "")

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link href="/admin/breeds">
            <ArrowLeft className="h-4 w-4" /> 返回品种列表
          </Link>
        </Button>
        <Button type="submit" disabled={pending} className="gap-1.5">
          <Save className="h-4 w-4" />
          {pending ? "保存中..." : mode === "create" ? "创建品种" : "保存修改"}
        </Button>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        {/* 主体内容 */}
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">英文名</Label>
              <Input id="name" name="name" required defaultValue={breed?.name ?? ""} placeholder="Golden Retriever" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cn_name">中文名</Label>
              <Input id="cn_name" name="cn_name" defaultValue={breed?.cnName ?? ""} placeholder="金毛" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={breed?.slug ?? ""}
              placeholder="留空将根据英文名自动生成,如 golden-retriever"
            />
            <p className="text-xs text-muted-foreground">
              URL 路径: /breeds/&lt;slug&gt;。修改 slug 会自动迁移已关联的文章。
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary">摘要</Label>
            <Textarea
              id="summary"
              name="summary"
              rows={3}
              defaultValue={breed?.summary ?? ""}
              placeholder="一两句话介绍这个犬种的核心特点"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="origin">起源地</Label>
              <Input id="origin" name="origin" defaultValue={breed?.origin ?? ""} placeholder="Scotland" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lifespan">寿命</Label>
              <Input id="lifespan" name="lifespan" defaultValue={breed?.lifespan ?? ""} placeholder="10-12 years" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight">体重范围</Label>
              <Input id="weight" name="weight" defaultValue={breed?.weight ?? ""} placeholder="25-34 kg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height">肩高范围</Label>
              <Input id="height" name="height" defaultValue={breed?.height ?? ""} placeholder="55-61 cm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="temperament">性格关键词（每行一条）</Label>
            <Textarea
              id="temperament"
              name="temperament"
              rows={4}
              defaultValue={breed?.temperament.join("\n") ?? ""}
              placeholder={"Friendly\nGentle\nConfident"}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="care_notes">饲养注意事项（每行一条）</Label>
            <Textarea
              id="care_notes"
              name="care_notes"
              rows={5}
              defaultValue={breed?.careNotes.join("\n") ?? ""}
              placeholder={"每周梳毛 3-4 次\n每天至少 60 分钟运动\n喜欢游泳和衔回类游戏"}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="common_health">常见健康问题（每行一条）</Label>
            <Textarea
              id="common_health"
              name="common_health"
              rows={5}
              defaultValue={breed?.commonHealth.join("\n") ?? ""}
              placeholder={"髋关节发育不良\n肘关节发育不良\n过敏"}
            />
          </div>
        </div>

        {/* 侧栏 */}
        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_published" className="text-sm font-medium">
                发布状态
              </Label>
              <Switch id="is_published" name="is_published" defaultChecked={breed?.isPublished ?? true} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">仅已发布的品种会展示在前台 /breeds。</p>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="space-y-1.5">
              <Label htmlFor="group_name">分组（AKC group）</Label>
              <Select name="group_name" defaultValue={breed?.group ?? "Non-Sporting"}>
                <SelectTrigger id="group_name">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="size">体型</Label>
              <Select name="size" defaultValue={breed?.size ?? "Medium"}>
                <SelectTrigger id="size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="image">封面图</Label>
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                name="image"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="display_order">展示顺序</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                defaultValue={breed?.displayOrder ?? 0}
              />
              <p className="text-xs text-muted-foreground">数字越小越靠前。</p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium">评分（1-5）</p>
            <div className="grid gap-3">
              {[
                { name: "trainability", label: "训练性", value: breed?.trainability ?? 3 },
                { name: "shedding", label: "掉毛量", value: breed?.shedding ?? 3 },
                { name: "exercise", label: "运动需求", value: breed?.exercise ?? 3 },
              ].map((row) => (
                <div key={row.name} className="space-y-1.5">
                  <Label htmlFor={row.name} className="text-xs text-muted-foreground">
                    {row.label}
                  </Label>
                  <Input
                    id={row.name}
                    name={row.name}
                    type="number"
                    min={1}
                    max={5}
                    defaultValue={row.value}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="good_with_kids" className="text-sm">
                适合与儿童相处
              </Label>
              <Switch id="good_with_kids" name="good_with_kids" defaultChecked={breed?.goodWithKids ?? true} />
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}

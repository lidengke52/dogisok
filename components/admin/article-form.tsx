"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MarkdownEditor } from "@/components/admin/markdown-editor"
import { BreedSelect } from "@/components/admin/breed-select"
import { ImageUploader } from "@/components/admin/image-uploader"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { createArticle, updateArticle, type ArticleFormState } from "@/app/admin/articles/actions"

type Article = {
  id?: string
  slug?: string
  title?: string
  excerpt?: string | null
  content?: string | null
  cover_image?: string | null
  category?: string
  subcategory?: string | null
  tags?: string[] | null
  author?: string
  read_minutes?: number
  published?: boolean
  breed_slug?: string | null
}

type BreedOption = {
  slug: string
  name: string
  cnName?: string
}

type Props = {
  mode: "create" | "edit"
  articleId?: string
  article?: Article
  /** 用于"关联犬种"下拉的可选品种列表（只传已发布的） */
  breeds?: BreedOption[]
}

const CATEGORIES = [
  { value: "food", label: "能吃啥(食物)", subcategories: [
    { value: "safe", label: "可以吃" },
    { value: "caution", label: "慎吃" },
    { value: "toxic", label: "禁吃" },
  ]},
  { value: "behavior", label: "能做啥(行为)", subcategories: [
    { value: "safe", label: "可以做" },
    { value: "caution", label: "慎做" },
    { value: "avoid", label: "禁做" },
  ]},
  { value: "knowledge", label: "知识库", subcategories: [] },
  { value: "breed", label: "犬种指南", subcategories: [] },
  { value: "health", label: "健康", subcategories: [] },
]

export function ArticleForm({ mode, articleId, article, breeds = [] }: Props) {
  // Bind articleId for edit mode, otherwise use createArticle directly.
  const actionFn =
    mode === "edit" && articleId
      ? (prev: ArticleFormState, formData: FormData) => updateArticle(articleId, prev, formData)
      : createArticle

  const [state, formAction, pending] = useActionState<ArticleFormState, FormData>(actionFn, {})
  
  // Get subcategories for selected category
  const selectedCategory = article?.category || "knowledge"
  const categoryObj = CATEGORIES.find(c => c.value === selectedCategory)
  const subcategories = categoryObj?.subcategories || []

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link href="/admin/articles">
            <ArrowLeft className="h-4 w-4" /> 返回文章列表
          </Link>
        </Button>
        <Button type="submit" disabled={pending} className="gap-1.5">
          <Save className="h-4 w-4" />
          {pending ? "保存中..." : mode === "create" ? "创建文章" : "保存修改"}
        </Button>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={article?.title ?? ""}
              placeholder="例如:狗狗可以吃草莓吗?"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={article?.slug ?? ""}
              placeholder="留空将根据标题自动生成"
            />
            <p className="text-xs text-muted-foreground">URL 路径。留空可根据标题自动生成。</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="excerpt">摘要</Label>
            <Input
              id="excerpt"
              name="excerpt"
              defaultValue={article?.excerpt ?? ""}
              placeholder="1-2 句话,展示在列表卡片上"
            />
          </div>

          <div className="space-y-1.5">
            <Label>正文(Markdown)</Label>
            <MarkdownEditor name="content" defaultValue={article?.content ?? ""} />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <Label htmlFor="published" className="text-sm font-medium">
                发布状态
              </Label>
              <Switch id="published" name="published" defaultChecked={article?.published ?? false} />
            </div>
            <p className="text-xs text-muted-foreground">仅已发布的文章会展示在前台站点。</p>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">分类</Label>
              <select
                id="category"
                name="category"
                defaultValue={article?.category ?? "knowledge"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subcategory">子分类</Label>
              {subcategories.length > 0 ? (
                <select
                  id="subcategory"
                  name="subcategory"
                  defaultValue={article?.subcategory ?? ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">不选</option>
                  {subcategories.map((sub) => (
                    <option key={sub.value} value={sub.value}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-muted-foreground">该分类暂无子分类</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="breed_slug">关联犬种（可选）</Label>
              <BreedSelect
                name="breed_slug"
                breeds={breeds}
                defaultValue={article?.breed_slug}
              />
              <p className="text-xs text-muted-foreground">
                关联后，该文章会出现在 /breeds/&lt;slug&gt; 页面的"相关文章"区。
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">标签</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={article?.tags?.join(", ") ?? ""}
                placeholder="多个标签用英文逗号分隔"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="author">作者</Label>
              <Input
                id="author"
                name="author"
                defaultValue={article?.author ?? "Editor"}
                placeholder="Editor"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="read_minutes">阅读时长(分钟)</Label>
              <Input
                id="read_minutes"
                name="read_minutes"
                type="number"
                min={1}
                max={60}
                defaultValue={article?.read_minutes ?? 5}
              />
            </div>

            <div className="space-y-1.5">
              <Label>封面图</Label>
              <ImageUploader name="cover_image" defaultValue={article?.cover_image ?? ""} />
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}

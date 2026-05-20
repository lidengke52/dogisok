"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { Search, ExternalLink, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { FileText } from "lucide-react"
import { deleteArticle, togglePublished } from "@/app/admin/articles/actions"

type Row = {
  id: string
  slug: string
  title: string
  category: string
  subcategory: string | null
  tags: string[] | null
  breed_slug: string | null
  published: boolean
  views: number | null
  read_minutes: number | null
  published_at: string | null
  updated_at: string | null
  created_at: string | null
  author: string | null
}

const FILTERS = [
  { value: "all", label: "全部" },
  { value: "published", label: "已发布" },
  { value: "draft", label: "草稿" },
] as const

type Filter = (typeof FILTERS)[number]["value"]

export function ArticlesTable({ articles, page: initialPage = "1", breeds = [] }: { articles: Row[]; page?: string; breeds?: Array<{ slug: string; name: string }> }) {
  const [statusFilter, setStatusFilter] = useState<Filter>("all")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [subcategoryFilter, setSubcategoryFilter] = useState("")
  const [breedFilter, setBreedFilter] = useState("")
  const [tagFilter, setTagFilter] = useState("")
  const [query, setQuery] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null)
  const [pending, startTransition] = useTransition()
  const [page, setPage] = useState(parseInt(initialPage) || 1)
  const ITEMS_PER_PAGE = 10

  // 获取所有可用的分类、子分类和标签
  const categories = [...new Set(articles.map(a => a.category))]
  const getSubcategories = (cat: string) => [...new Set(articles.filter(a => a.category === cat).map(a => a.subcategory).filter(Boolean))]
  const allTags = [...new Set(articles.flatMap(a => a.tags || []))]

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (statusFilter === "published" && !a.published) return false
      if (statusFilter === "draft" && a.published) return false
      if (categoryFilter && a.category !== categoryFilter) return false
      if (subcategoryFilter && a.subcategory !== subcategoryFilter) return false
      if (breedFilter && a.breed_slug !== breedFilter) return false
      if (tagFilter && !(a.tags || []).includes(tagFilter)) return false
      if (query) {
        const q = query.toLowerCase()
        if (!a.title.toLowerCase().includes(q) && !a.slug.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [articles, statusFilter, categoryFilter, subcategoryFilter, breedFilter, tagFilter, query])

  // 分页逻辑
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const start = (page - 1) * ITEMS_PER_PAGE
  const paged = filtered.slice(start, start + ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      {/* 状态和搜索过滤 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex rounded-md border border-border bg-background p-0.5">
          {FILTERS.map((f) => {
            const count =
              f.value === "all"
                ? articles.length
                : f.value === "published"
                  ? articles.filter((a) => a.published).length
                  : articles.filter((a) => !a.published).length
            return (
              <Button
                key={f.value}
                size="sm"
                variant={statusFilter === f.value ? "default" : "ghost"}
                onClick={() => {
                  setStatusFilter(f.value)
                  setPage(1)
                }}
                className="h-8"
              >
                {f.label} <span className="ml-1.5 text-xs opacity-70">{count}</span>
              </Button>
            )
          })}
        </div>
        <div className="relative md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="搜索标题或 slug..."
            className="pl-9"
          />
        </div>
      </div>

      {/* 高级筛选 */}
      <div className="grid gap-2 rounded-lg border border-border bg-secondary/30 p-3 md:grid-cols-5 lg:grid-cols-5">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setSubcategoryFilter("")
            setPage(1)
          }}
          className="rounded border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="">分类：全部</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              分类：{cat}
            </option>
          ))}
        </select>

        {categoryFilter && getSubcategories(categoryFilter).length > 0 && (
          <select
            value={subcategoryFilter}
            onChange={(e) => {
              setSubcategoryFilter(e.target.value)
              setPage(1)
            }}
            className="rounded border border-input bg-background px-2 py-1.5 text-xs"
          >
            <option value="">子分类：全部</option>
            {getSubcategories(categoryFilter).map((subcat) => (
              <option key={subcat} value={subcat}>
                子分类：{subcat}
              </option>
            ))}
          </select>
        )}

        <select
          value={breedFilter}
          onChange={(e) => {
            setBreedFilter(e.target.value)
            setPage(1)
          }}
          className="rounded border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="">犬种：全部</option>
          {breeds.map((breed) => (
            <option key={breed.slug} value={breed.slug}>
              {breed.name}
            </option>
          ))}
        </select>

        <select
          value={tagFilter}
          onChange={(e) => {
            setTagFilter(e.target.value)
            setPage(1)
          }}
          className="rounded border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="">标签：全部</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        {(categoryFilter || subcategoryFilter || breedFilter || tagFilter) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCategoryFilter("")
              setSubcategoryFilter("")
              setBreedFilter("")
              setTagFilter("")
              setPage(1)
            }}
            className="h-9 text-xs"
          >
            重置筛选
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card">
        {filtered.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>没有符合条件的文章</EmptyTitle>
              <EmptyDescription>
                {articles.length === 0
                  ? "点击 新增文章 创建第一篇内容。"
                  : "请尝试其他筛选条件或搜索关键词。"}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead className="w-32">分类</TableHead>
                    <TableHead className="w-28">状态</TableHead>
                    <TableHead className="w-24">浏览量</TableHead>
                    <TableHead className="w-36">更新时间</TableHead>
                    <TableHead className="w-40 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium min-w-0">
                        <div className="flex flex-col gap-0.5">
                          <span className="line-clamp-2 break-words">{a.title}</span>
                          <span className="font-mono text-xs text-muted-foreground">/{a.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {a.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {a.published ? (
                          <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                            <Eye className="h-3 w-3" /> 已发布
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <EyeOff className="h-3 w-3" /> 草稿
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">{a.views ?? 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.updated_at ? new Date(a.updated_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 flex-nowrap">
                          {a.published && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="查看线上">
                              <Link href={`/articles/${a.slug}`} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs px-2"
                            disabled={pending}
                            onClick={() =>
                              startTransition(async () => {
                                await togglePublished(a.id, !a.published)
                              })
                            }
                          >
                            {a.published ? "取消发布" : "发布"}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="编辑">
                            <Link href={`/admin/articles/${a.id}/edit?page=${page}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="删除"
                            onClick={() => setConfirmDelete(a)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div className="text-sm text-muted-foreground">
                共 {filtered.length} 篇，第 {page} / {totalPages} 页
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                >
                  首页
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  上页
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  下页
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  末页
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该文章?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.title ? `"${confirmDelete.title}" ` : ""}
              将被永久删除,该操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!confirmDelete) return
                const id = confirmDelete.id
                setConfirmDelete(null)
                startTransition(async () => {
                  await deleteArticle(id)
                })
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

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

export function ArticlesTable({ articles }: { articles: Row[] }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (filter === "published" && !a.published) return false
      if (filter === "draft" && a.published) return false
      if (query) {
        const q = query.toLowerCase()
        if (!a.title.toLowerCase().includes(q) && !a.slug.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [articles, filter, query])

  return (
    <div className="space-y-4">
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
                variant={filter === f.value ? "default" : "ghost"}
                onClick={() => setFilter(f.value)}
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题或 slug..."
            className="pl-9"
          />
        </div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead className="w-32">分类</TableHead>
                <TableHead className="w-28">状态</TableHead>
                <TableHead className="w-24">浏览量</TableHead>
                <TableHead className="w-36">更新时间</TableHead>
                <TableHead className="w-56 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-0.5">
                      <span className="line-clamp-1">{a.title}</span>
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
                    <div className="flex items-center justify-end gap-1">
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
                        className="h-8"
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
                        <Link href={`/admin/articles/${a.id}/edit`}>
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

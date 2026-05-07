"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useTransition } from "react"
import { Pencil, Trash2, Eye, EyeOff, Dog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import type { Breed } from "@/lib/breeds"
import { deleteBreed, toggleBreedPublished, deleteBreedsBulk } from "@/app/admin/breeds/actions"

export function BreedsTable({ breeds }: { breeds: Breed[] }) {
  const [pending, startTransition] = useTransition()
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  if (breeds.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Dog className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>暂无品种</EmptyTitle>
          <EmptyDescription>点击右上角"新增品种"开始添加。</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function onDelete(slug: string, name: string) {
    if (!confirm(`确认删除"${name}"？该操作不可撤销，关联文章将解除引用（不会被删除）。`)) return
    setDeletingSlug(slug)
    startTransition(async () => {
      try {
        await deleteBreed(slug)
      } catch (e) {
        alert(e instanceof Error ? e.message : "删除失败")
      } finally {
        setDeletingSlug(null)
      }
    })
  }

  function onTogglePublished(slug: string, current: boolean) {
    startTransition(async () => {
      try {
        await toggleBreedPublished(slug, current)
      } catch (e) {
        alert(e instanceof Error ? e.message : "切换失败")
      }
    })
  }

  function toggleSelected(slug: string) {
    const newSet = new Set(selected)
    if (newSet.has(slug)) {
      newSet.delete(slug)
    } else {
      newSet.add(slug)
    }
    setSelected(newSet)
  }

  function toggleSelectAll() {
    if (selected.size === breeds.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(breeds.map(b => b.slug)))
    }
  }

  function onDeleteBulk() {
    const slugs = Array.from(selected)
    const count = slugs.length
    if (!confirm(`确认删除选中的 ${count} 个品种？该操作不可撤销。`)) return
    
    startTransition(async () => {
      try {
        await deleteBreedsBulk(slugs)
        setSelected(new Set())
      } catch (e) {
        alert(e instanceof Error ? e.message : "删除失败")
      }
    })
  }

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-destructive/10 px-4 py-3">
          <span className="text-sm font-medium text-destructive">已选中 {selected.size} 项</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteBulk}
            disabled={pending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            批量删除
          </Button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-12 px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={selected.size === breeds.length && breeds.length > 0}
                  onChange={toggleSelectAll}
                  disabled={breeds.length === 0}
                  className="rounded border"
                />
              </th>
              <th className="px-4 py-3 font-medium">品种</th>
              <th className="px-4 py-3 font-medium">分组</th>
              <th className="px-4 py-3 font-medium">体型</th>
              <th className="px-4 py-3 font-medium">顺序</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {breeds.map((b) => (
              <tr key={b.slug} className={cn(!b.isPublished && "opacity-60")}>
                <td className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(b.slug)}
                    onChange={() => toggleSelected(b.slug)}
                    className="rounded border"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-secondary">
                      {b.image ? (
                        <Image src={b.image} alt={b.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Dog className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{b.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {b.cnName ? `${b.cnName} · ` : ""}/{b.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{b.group}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.size}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.displayOrder}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onTogglePublished(b.slug, b.isPublished)}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium transition hover:bg-secondary"
                    aria-label={b.isPublished ? "隐藏" : "发布"}
                  >
                    {b.isPublished ? (
                      <>
                        <Eye className="h-3 w-3" /> 已发布
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" /> 未发布
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/breeds/${b.slug}/edit`} aria-label={`编辑 ${b.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(b.slug, b.name)}
                      disabled={pending && deletingSlug === b.slug}
                      aria-label={`删除 ${b.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

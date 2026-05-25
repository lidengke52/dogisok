"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { ClipboardList } from "lucide-react"
import {
  toggleFeaturedCaseActive,
  deleteFeaturedCase,
  updateDisplayOrder,
} from "@/app/admin/featured-cases/actions"

type FeaturedCase = {
  id: string
  dog_breed: string
  dog_age: string
  symptom: string
  ai_answer: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export function FeaturedCasesTable({ cases }: { cases: FeaturedCase[] }) {
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  if (cases.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ClipboardList className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>暂无精选案例</EmptyTitle>
          <EmptyDescription>
            可以手动添加第一条案例,也可以通过批量导入一次上传多条。
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function handleToggle(id: string, current: boolean) {
    setBusyId(id)
    startTransition(async () => {
      try {
        await toggleFeaturedCaseActive(id, !current)
      } finally {
        setBusyId(null)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("确认删除该案例?该操作不可撤销。")) return
    setBusyId(id)
    startTransition(async () => {
      try {
        await deleteFeaturedCase(id)
      } finally {
        setBusyId(null)
      }
    })
  }

  function handleMove(id: string, direction: "up" | "down") {
    const current = cases.find((c) => c.id === id)
    if (!current) return
    const delta = direction === "up" ? -1 : 1
    setBusyId(id)
    startTransition(async () => {
      try {
        await updateDisplayOrder(id, current.display_order + delta)
      } finally {
        setBusyId(null)
      }
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">排序</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">犬种 / 阶段</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">症状</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">状态</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/30">
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-6 text-center font-mono text-sm">{c.display_order}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMove(c.id, "up")}
                      disabled={isPending && busyId === c.id}
                      aria-label="上移"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMove(c.id, "down")}
                      disabled={isPending && busyId === c.id}
                      aria-label="下移"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{c.dog_breed}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.dog_age}</p>
                </td>
                <td className="max-w-md px-4 py-3">
                  <p className="line-clamp-2 text-sm">{c.symptom}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      c.is_active
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground"
                    }`}
                  >
                    {c.is_active ? "显示中" : "已隐藏"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggle(c.id, c.is_active)}
                      disabled={isPending && busyId === c.id}
                      aria-label={c.is_active ? "隐藏" : "显示"}
                    >
                      {c.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/admin/featured-cases/${c.id}/edit`} aria-label="编辑">
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(c.id)}
                      disabled={isPending && busyId === c.id}
                      aria-label="删除"
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
  )
}

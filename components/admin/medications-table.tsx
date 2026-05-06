"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Pencil, Trash2, Eye, EyeOff, ShieldCheck, ShieldAlert, Ban, Checkbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Pill } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteMedication, toggleMedicationActive, deleteMedicationsBulk } from "@/app/admin/medications/actions"
import type { Medication } from "@/lib/medications"

const CATEGORY_META = {
  normal: { label: "常规", icon: ShieldCheck, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  caution: { label: "慎用", icon: ShieldAlert, color: "text-amber-700 bg-amber-50 border-amber-200" },
  forbidden: { label: "禁用", icon: Ban, color: "text-red-700 bg-red-50 border-red-200" },
} as const

export function MedicationsTable({ medications }: { medications: Medication[] }) {
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  if (medications.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Pill className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>暂无药品</EmptyTitle>
          <EmptyDescription>可以单条添加,也可以通过 CSV / Excel 一次批量导入。</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function onDelete(id: string, name: string) {
    if (!confirm(`确认删除"${name}"?该操作不可撤销。`)) return
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deleteMedication(id)
      } catch (e) {
        alert(e instanceof Error ? e.message : "删除失败")
      } finally {
        setDeletingId(null)
      }
    })
  }

  function onToggle(id: string, current: boolean) {
    startTransition(async () => {
      try {
        await toggleMedicationActive(id, current)
      } catch (e) {
        alert(e instanceof Error ? e.message : "切换失败")
      }
    })
  }

  function toggleSelected(id: string) {
    const newSet = new Set(selected)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelected(newSet)
  }

  function toggleSelectAll() {
    if (selected.size === medications.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(medications.map(m => m.id)))
    }
  }

  function onDeleteBulk() {
    const ids = Array.from(selected)
    const count = ids.length
    if (!confirm(`确认删除选中的 ${count} 个药品？该操作不可撤销。`)) return
    
    startTransition(async () => {
      try {
        await deleteMedicationsBulk(ids)
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
                  checked={selected.size === medications.length && medications.length > 0}
                  onChange={toggleSelectAll}
                  disabled={medications.length === 0}
                  className="rounded border"
                />
              </th>
              <th className="px-4 py-3 font-medium">药品名称</th>
              <th className="px-4 py-3 font-medium">分类</th>
              <th className="px-4 py-3 font-medium">适用宠物</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {medications.map((med) => {
              const meta = CATEGORY_META[med.category]
              const Icon = meta.icon
              return (
                <tr key={med.id} className={cn(!med.is_active && "opacity-60")}>
                  <td className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(med.id)}
                      onChange={() => toggleSelected(med.id)}
                      className="rounded border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{med.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{med.indications}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
                        meta.color,
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-1">{med.applicable_pets}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onToggle(med.id, med.is_active)}
                      disabled={pending}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium transition hover:bg-secondary"
                      aria-label={med.is_active ? "隐藏" : "显示"}
                    >
                      {med.is_active ? (
                        <>
                          <Eye className="h-3 w-3" /> 显示中
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> 已隐藏
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/medications/${med.id}/edit`} aria-label={`编辑 ${med.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(med.id, med.name)}
                        disabled={pending && deletingId === med.id}
                        aria-label={`删除 ${med.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

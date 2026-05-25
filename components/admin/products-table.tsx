"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Pencil, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteProduct, deleteProductsBulk } from "@/app/admin/products/actions"

export type ProductRow = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  order_index: number
  created_at: string
  updated_at: string
  claims_count: number
}

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function handleDelete(row: ProductRow) {
    if (!confirm(`确定要删除 "${row.name}" 吗？此操作无法撤销。`)) return
    setDeletingId(row.id)
    startTransition(async () => {
      try {
        await deleteProduct(row.id)
        router.refresh()
      } catch (err) {
        alert(`删除失败：${err instanceof Error ? err.message : "未知错误"}`)
      } finally {
        setDeletingId(null)
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
    if (selected.size === rows.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(rows.map(r => r.id)))
    }
  }

  function onDeleteBulk() {
    const ids = Array.from(selected)
    const count = ids.length
    if (!confirm(`确认删除选中的 ${count} 个商品？此操作无法撤销。`)) return
    
    startTransition(async () => {
      try {
        await deleteProductsBulk(ids)
        setSelected(new Set())
        router.refresh()
      } catch (err) {
        alert(`删除失败：${err instanceof Error ? err.message : "未知错误"}`)
      }
    })
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">暂无商品。点击右上角「新增商品」开始添加。</p>
      </div>
    )
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
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="w-12 px-4 py-2.5 font-medium">
                <input
                  type="checkbox"
                  checked={selected.size === rows.length && rows.length > 0}
                  onChange={toggleSelectAll}
                  disabled={rows.length === 0}
                  className="rounded border"
                />
              </th>
              <th className="px-4 py-2.5 font-medium">商品</th>
              <th className="px-4 py-2.5 font-medium">描述</th>
              <th className="px-4 py-2.5 font-medium">顺序</th>
              <th className="px-4 py-2.5 font-medium">申领次数</th>
              <th className="px-4 py-2.5 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleSelected(r.id)}
                    className="rounded border"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {r.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image_url || "/placeholder.svg"} alt={r.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="max-w-md px-4 py-3 text-xs text-muted-foreground">
                  <p className="line-clamp-2">{r.description || "—"}</p>
                </td>
                <td className="px-4 py-3 tabular-nums">{r.order_index}</td>
                <td className="px-4 py-3 tabular-nums">{r.claims_count}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/products/${r.id}/edit`}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        编辑
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(r)}
                      disabled={pending && deletingId === r.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      {pending && deletingId === r.id ? "删除中…" : "删除"}
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

"use client"

import Link from "next/link"
import { useTransition, useState } from "react"
import { ExternalLink, Pencil, Trash2, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteProductAd, toggleProductAd } from "@/app/admin/product-ads/actions"
import type { ProductAd } from "@/lib/product-ads"

const PLACEMENT_LABEL: Record<ProductAd["placement"], string> = {
  home: "首页",
  articles: "文章列表",
  consultation: "Dr. Max",
}

export function ProductAdsTable({ ads }: { ads: ProductAd[] }) {
  const [isPending, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  const filtered = ads.filter((ad) => {
    if (statusFilter === "active") return ad.is_active
    if (statusFilter === "inactive") return !ad.is_active
    return true
  })

  if (ads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        暂无广告。点击 <span className="font-medium text-foreground">新增广告</span> 创建第一条。
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
          className="gap-1.5"
        >
          <Filter className="h-4 w-4" />
          全部 ({ads.length})
        </Button>
        <Button
          size="sm"
          variant={statusFilter === "active" ? "default" : "outline"}
          onClick={() => setStatusFilter("active")}
        >
          显示中 ({ads.filter((a) => a.is_active).length})
        </Button>
        <Button
          size="sm"
          variant={statusFilter === "inactive" ? "default" : "outline"}
          onClick={() => setStatusFilter("inactive")}
        >
          已隐藏 ({ads.filter((a) => !a.is_active).length})
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">标题</th>
                <th className="px-4 py-3 font-semibold">投放位置</th>
                <th className="px-4 py-3 font-semibold">排序</th>
                <th className="px-4 py-3 font-semibold">状态</th>
                <th className="px-4 py-3 font-semibold">链接</th>
                <th className="px-4 py-3 text-right font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ad) => (
                <tr key={ad.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{ad.title}</p>
                  {ad.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{ad.description}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                    {PLACEMENT_LABEL[ad.placement]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{ad.display_order}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        await toggleProductAd(ad.id, !ad.is_active)
                      })
                    }
                    disabled={isPending}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ad.is_active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {ad.is_active ? "显示中" : "已隐藏"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={ad.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-[220px] items-center gap-1 truncate text-xs text-accent hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{ad.link_url}</span>
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/product-ads/${ad.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => {
                        if (!confirm(`确认删除广告"${ad.title}"?`)) return
                        startTransition(async () => {
                          await deleteProductAd(ad.id)
                        })
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {filtered.length === 0 && ads.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          没有符合筛选条件的广告。
        </div>
      )}
    </div>
  )
}

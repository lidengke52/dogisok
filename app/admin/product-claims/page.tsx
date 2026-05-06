import { redirect } from "next/navigation"
import { Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export const metadata = { title: "产品申领 · 管理后台" }

type Row = {
  id: string
  user_id: string
  product_id: string
  claimed_at: string
  user_email: string | null
  user_display_name: string | null
  user_invite_code: string | null
  product_name: string | null
  product_image: string | null
}

export default async function AdminProductClaimsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const { data: claims } = await supabase
    .from("product_claims")
    .select("id, user_id, product_id, claimed_at")
    .order("claimed_at", { ascending: false })

  const list = claims ?? []

  // 关联 profiles + products
  const userIds = Array.from(new Set(list.map((c) => c.user_id)))
  const productIds = Array.from(new Set(list.map((c) => c.product_id)))

  const [{ data: users }, { data: products }] = await Promise.all([
    userIds.length
      ? supabase.from("profiles").select("id, email, display_name, invite_code").in("id", userIds)
      : Promise.resolve({ data: [] as any[] }),
    productIds.length
      ? supabase.from("products").select("id, name, image_url").in("id", productIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const userMap = new Map((users ?? []).map((u: any) => [u.id, u]))
  const productMap = new Map((products ?? []).map((p: any) => [p.id, p]))

  const rows: Row[] = list.map((c) => {
    const u = userMap.get(c.user_id)
    const p = productMap.get(c.product_id)
    return {
      id: c.id,
      user_id: c.user_id,
      product_id: c.product_id,
      claimed_at: c.claimed_at,
      user_email: u?.email ?? null,
      user_display_name: u?.display_name ?? null,
      user_invite_code: u?.invite_code ?? null,
      product_name: p?.name ?? null,
      product_image: p?.image_url ?? null,
    }
  })

  // 按产品分组统计
  const productStats = new Map<string, { name: string; count: number }>()
  for (const r of rows) {
    const key = r.product_id
    const existing = productStats.get(key)
    if (existing) {
      existing.count += 1
    } else {
      productStats.set(key, { name: r.product_name || "未知商品", count: 1 })
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Package className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">产品申领</h1>
          <p className="text-sm text-muted-foreground">
            用户在邀请页领取的免费产品记录（每位用户限领一次）。
          </p>
        </div>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="累计申领数" value={rows.length} />
        <Stat label="参与用户数" value={userIds.length} />
        <Stat label="涉及产品数" value={productIds.length} accent="text-primary" />
        <Stat label="本月申领" value={rows.filter((r) => isThisMonth(r.claimed_at)).length} accent="text-accent" />
      </div>

      {productStats.size > 0 && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">按商品分布</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(productStats.entries()).map(([id, s]) => (
              <span
                key={id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs"
              >
                <span className="font-medium text-foreground">{s.name}</span>
                <span className="tabular-nums text-muted-foreground">{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">用户</th>
                <th className="px-4 py-2.5 font-medium">邀请码</th>
                <th className="px-4 py-2.5 font-medium">领取产品</th>
                <th className="px-4 py-2.5 font-medium">领取时间</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.user_display_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.user_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {r.user_invite_code ? (
                      <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{r.user_invite_code}</code>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {r.product_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.product_image || "/placeholder.svg"}
                          alt={r.product_name ?? ""}
                          className="h-9 w-9 flex-shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </span>
                      )}
                      <span className="font-medium text-foreground">{r.product_name || "（已删除）"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(r.claimed_at).toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    暂无产品申领记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function isThisMonth(d: string) {
  const now = new Date()
  const t = new Date(d)
  return t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth()
}

function Stat({ label, value, accent = "text-foreground" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${accent}`}>{value}</p>
    </div>
  )
}

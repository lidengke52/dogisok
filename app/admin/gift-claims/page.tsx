import { redirect } from "next/navigation"
import { Gift, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { GiftClaimsTable } from "@/components/admin/gift-claims-table"
import { ExportClaimsButton } from "@/components/admin/export-claims-button"

export const dynamic = "force-dynamic"

export const metadata = { title: "礼品申领 · 管理后台" }

export default async function AdminGiftClaimsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const ok = await isAdmin(user.id)
  if (!ok) redirect("/")

  const { data: claims } = await supabase
    .from("gift_claims")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name, invite_code")
    .in(
      "id",
      (claims ?? []).map((c) => c.user_id),
    )

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const enriched = (claims ?? []).map((c) => ({
    ...c,
    user_email: profileMap.get(c.user_id)?.email ?? null,
    user_display_name: profileMap.get(c.user_id)?.display_name ?? null,
    user_invite_code: profileMap.get(c.user_id)?.invite_code ?? null,
  }))

  const statusCounts = {
    all: enriched.length,
    pending: enriched.filter((c) => c.status === "pending").length,
    approved: enriched.filter((c) => c.status === "approved").length,
    shipped: enriched.filter((c) => c.status === "shipped").length,
    rejected: enriched.filter((c) => c.status === "rejected").length,
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Gift className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">礼品申领</h1>
          <p className="text-sm text-muted-foreground">
            成功邀请 20 位好友并申请营养包奖励的用户列表。
          </p>
        </div>
      </header>

      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 w-full">
          <Stat label="全部" value={statusCounts.all} />
          <Stat label="待处理" value={statusCounts.pending} accent="text-foreground" />
          <Stat label="已审核" value={statusCounts.approved} accent="text-primary" />
          <Stat label="已发货" value={statusCounts.shipped} accent="text-accent" />
          <Stat label="已拒绝" value={statusCounts.rejected} accent="text-destructive" />
        </div>
        <div className="shrink-0">
          <ExportClaimsButton />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <GiftClaimsTable claims={enriched} />
      </div>
    </div>
  )
}

function Stat({ label, value, accent = "text-foreground" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  )
}

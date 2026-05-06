import { redirect } from "next/navigation"
import { Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/admin"
import { UsersTable, type AdminUserRow } from "@/components/admin/users-table"

export const dynamic = "force-dynamic"

export const metadata = { title: "用户管理 · 管理后台" }

export default async function AdminUsersPage() {
  // 用 cookies 会话客户端校验当前管理员身份
  const sessionClient = await createClient()
  const {
    data: { user },
  } = await sessionClient.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  // profiles 表的 RLS 仅允许 auth.uid() = id（每个会话只能读到自己），
  // 因此管理员视图必须用 service-role 客户端绕过 RLS 才能读到全部用户。
  const supabase = createAdminClient()

  // 拉取所有 profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, email, display_name, invite_code, invited_by, gift_claimed, recipient_name, phone, postal_code, street_address, city, state, country, created_at",
    )
    .order("created_at", { ascending: false })

  const list = profiles ?? []

  // 邀请人邮箱映射
  const inviterIds = Array.from(
    new Set(list.map((p) => p.invited_by).filter((id): id is string => Boolean(id))),
  )
  const inviterMap = new Map<string, { email: string | null; display_name: string | null }>()
  if (inviterIds.length > 0) {
    const { data: inviters } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .in("id", inviterIds)
    for (const inv of inviters ?? []) {
      inviterMap.set(inv.id, { email: inv.email, display_name: inv.display_name })
    }
  }

  // 每个用户的邀请数（被多少人选作 invited_by）
  const inviteCountMap = new Map<string, number>()
  for (const p of list) {
    if (p.invited_by) {
      inviteCountMap.set(p.invited_by, (inviteCountMap.get(p.invited_by) ?? 0) + 1)
    }
  }

  const rows: AdminUserRow[] = list.map((p) => ({
    id: p.id,
    email: p.email,
    display_name: p.display_name,
    invite_code: p.invite_code,
    invited_by_email: p.invited_by ? inviterMap.get(p.invited_by)?.email ?? null : null,
    invited_by_name: p.invited_by ? inviterMap.get(p.invited_by)?.display_name ?? null : null,
    invites_count: inviteCountMap.get(p.id) ?? 0,
    gift_claimed: p.gift_claimed,
    recipient_name: p.recipient_name,
    phone: p.phone,
    postal_code: p.postal_code,
    street_address: p.street_address,
    city: p.city,
    state: p.state,
    country: p.country,
    has_address: Boolean(p.recipient_name && p.phone && p.street_address && p.city && p.country),
    created_at: p.created_at,
  }))

  // 顶部统计
  const total = rows.length
  const claimedCount = rows.filter((r) => r.gift_claimed).length
  const withAddress = rows.filter((r) => r.has_address).length
  const now = new Date()
  const thisMonth = rows.filter((r) => {
    const d = new Date(r.created_at)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">用户管理</h1>
          <p className="text-sm text-muted-foreground">
            查看注册用户、邀请关系、礼品状态与收件地址。
          </p>
        </div>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="注册用户总数" value={total} />
        <Stat label="本月新增" value={thisMonth} accent="text-primary" />
        <Stat label="已申领礼品" value={claimedCount} accent="text-accent" />
        <Stat label="已填写地址" value={withAddress} />
      </div>

      <UsersTable rows={rows} />
    </div>
  )
}

function Stat({ label, value, accent = "text-foreground" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${accent}`}>{value}</p>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { Search, MapPin, Gift, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type AdminUserRow = {
  id: string
  email: string | null
  display_name: string | null
  invite_code: string | null
  invited_by_email: string | null
  invited_by_name: string | null
  invites_count: number
  gift_claimed: boolean
  recipient_name: string | null
  phone: string | null
  postal_code: string | null
  street_address: string | null
  city: string | null
  state: string | null
  country: string | null
  has_address: boolean
  created_at: string
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" })
  } catch {
    return s
  }
}

export function UsersTable({ rows }: { rows: AdminUserRow[] }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "claimed" | "with_address" | "no_address">("all")
  const [selected, setSelected] = useState<AdminUserRow | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter === "claimed" && !r.gift_claimed) return false
      if (filter === "with_address" && !r.has_address) return false
      if (filter === "no_address" && r.has_address) return false
      if (!q) return true
      return [r.email, r.display_name, r.invite_code, r.recipient_name, r.phone, r.invited_by_email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [rows, query, filter])

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索邮箱、昵称、邀请码、收件人…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
              全部 {rows.length}
            </FilterPill>
            <FilterPill active={filter === "claimed"} onClick={() => setFilter("claimed")}>
              已申领礼品
            </FilterPill>
            <FilterPill active={filter === "with_address"} onClick={() => setFilter("with_address")}>
              有完整地址
            </FilterPill>
            <FilterPill active={filter === "no_address"} onClick={() => setFilter("no_address")}>
              缺少地址
            </FilterPill>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">用户</th>
                <th className="px-4 py-2.5 font-medium">邀请码</th>
                <th className="px-4 py-2.5 font-medium">邀请人</th>
                <th className="px-4 py-2.5 font-medium">邀请数</th>
                <th className="px-4 py-2.5 font-medium">礼品</th>
                <th className="px-4 py-2.5 font-medium">地址</th>
                <th className="px-4 py-2.5 font-medium">注册时间</th>
                <th className="px-4 py-2.5 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.display_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {r.invite_code ? (
                      <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{r.invite_code}</code>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {r.invited_by_email ? (
                      <span title={r.invited_by_email}>{r.invited_by_name || r.invited_by_email}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.invites_count}</td>
                  <td className="px-4 py-3">
                    {r.gift_claimed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Gift className="h-3 w-3" />
                        已申领
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.has_address ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        <MapPin className="h-3 w-3" />
                        完整
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">未填写</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>
                      详情
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    没有符合条件的用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && <UserDetailDrawer row={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function UserDetailDrawer({ row, onClose }: { row: AdminUserRow; onClose: () => void }) {
  const fullAddress =
    [row.street_address, row.city, row.state, row.postal_code, row.country].filter(Boolean).join(", ") || "—"

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="用户详情">
      <div className="fixed inset-0 bg-foreground/40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-background shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">用户详情</p>
            <h2 className="mt-1 text-lg font-semibold">{row.display_name || row.email || "未命名用户"}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭">
            <span className="text-2xl leading-none">&times;</span>
          </Button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 text-sm">
          <Section title="账户">
            <Field label="邮箱" value={row.email} />
            <Field label="显示名" value={row.display_name} />
            <Field
              label="邀请码"
              value={row.invite_code ? <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.invite_code}</code> : null}
            />
            <Field
              label="邀请人"
              value={row.invited_by_email ? (
                <span>
                  {row.invited_by_name || "—"}
                  <span className="ml-1 text-xs text-muted-foreground">({row.invited_by_email})</span>
                </span>
              ) : null}
            />
            <Field label="他邀请的人数" value={String(row.invites_count)} />
            <Field label="注册时间" value={formatDate(row.created_at)} />
          </Section>

          <Section title="礼品 / 收货">
            <Field
              label="礼品状态"
              value={row.gift_claimed ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Gift className="h-3 w-3" /> 已申领
                </span>
              ) : "未申领"}
            />
            <Field label="收件人" value={row.recipient_name} />
            <Field label="电话" value={row.phone} />
            <Field label="街道地址" value={row.street_address} />
            <Field label="城市" value={row.city} />
            <Field label="州 / 省" value={row.state} />
            <Field label="邮编" value={row.postal_code} />
            <Field label="国家" value={row.country} />
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">完整地址：</span>
              {fullAddress}
            </div>
          </Section>

          <a
            href={`/admin/gift-claims`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            查看此用户的礼品申领
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right text-sm">
        {value || <span className="text-muted-foreground">—</span>}
      </span>
    </div>
  )
}

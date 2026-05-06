"use client"

import { useMemo, useState, useTransition } from "react"
import { MapPin, Mail, Phone, Copy, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

type Claim = {
  id: string
  user_id: string
  user_email: string | null
  user_display_name: string | null
  user_invite_code: string | null
  recipient_name: string
  phone: string
  country: string
  state_region: string
  city: string
  address_line1: string
  address_line2: string | null
  postal_code: string
  status: string
  tracking_number: string | null
  admin_note: string | null
  created_at: string
}

const STATUS_OPTIONS = [
  { value: "pending", label: "待处理" },
  { value: "approved", label: "已审核" },
  { value: "shipped", label: "已发货" },
  { value: "rejected", label: "已拒绝" },
]

const STATUS_LABEL: Record<string, string> = {
  pending: "待处理",
  approved: "已审核",
  shipped: "已发货",
  rejected: "已拒绝",
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-secondary text-foreground border-border",
  approved: "bg-primary/10 text-primary border-primary/30",
  shipped: "bg-accent/10 text-accent border-accent/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
}

export function GiftClaimsTable({ claims }: { claims: Claim[] }) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editing, setEditing] = useState<Claim | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return claims.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (!q) return true
      return [
        c.recipient_name,
        c.user_email,
        c.user_invite_code,
        c.phone,
        c.city,
        c.state_region,
        c.postal_code,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [claims, query, statusFilter])

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="按姓名、邮箱、邀请码、城市搜索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">状态</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">申请时间</th>
              <th className="px-4 py-3 text-left font-medium">用户</th>
              <th className="px-4 py-3 text-left font-medium">收件人</th>
              <th className="px-4 py-3 text-left font-medium">收货地址</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col">
                    <span className="font-medium">{c.user_display_name ?? "—"}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {c.user_email ?? "—"}
                    </span>
                    {c.user_invite_code && (
                      <span className="mt-1 font-mono text-xs text-muted-foreground">#{c.user_invite_code}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col">
                    <span className="font-medium">{c.recipient_name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex max-w-xs items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                    <span>
                      {c.address_line1}
                      {c.address_line2 ? `, ${c.address_line2}` : ""}
                      <br />
                      {c.city}, {c.state_region} {c.postal_code}
                      <br />
                      {c.country}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status] ?? ""}`}
                  >
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                  {c.tracking_number && (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{c.tracking_number}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right align-top">
                  <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                    管理
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  没有符合当前筛选条件的领取记录。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditClaimDialog claim={editing} onClose={() => setEditing(null)} />
    </>
  )
}

function EditClaimDialog({ claim, onClose }: { claim: Claim | null; onClose: () => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(claim?.status ?? "pending")
  const [tracking, setTracking] = useState(claim?.tracking_number ?? "")
  const [note, setNote] = useState(claim?.admin_note ?? "")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Re-seed when dialog opens a new claim
  useMemo(() => {
    if (claim) {
      setStatus(claim.status)
      setTracking(claim.tracking_number ?? "")
      setNote(claim.admin_note ?? "")
      setError(null)
    }
  }, [claim])

  if (!claim) return null

  const fullAddress = [
    claim.recipient_name,
    claim.phone,
    claim.address_line1,
    claim.address_line2,
    `${claim.city}, ${claim.state_region} ${claim.postal_code}`,
    claim.country,
  ]
    .filter(Boolean)
    .join("\n")

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(fullAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.log("[v0] copy failed", e)
    }
  }

  function save() {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from("gift_claims")
        .update({
          status,
          tracking_number: tracking.trim() || null,
          admin_note: note.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", claim!.id)

      if (updateError) {
        setError(updateError.message)
        return
      }
      router.refresh()
      onClose()
    })
  }

  return (
    <Dialog open={!!claim} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>管理领取记录</DialogTitle>
          <DialogDescription>
            {claim.user_email} · 提交时间 {new Date(claim.created_at).toLocaleString("zh-CN")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                收货地址
              </span>
              <Button size="sm" variant="ghost" onClick={copyAddress}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ml-1.5 text-xs">{copied ? "已复制" : "复制"}</span>
              </Button>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{fullAddress}</pre>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">状态</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tracking">物流单号</Label>
            <Input
              id="tracking"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="例如:1ZA123456789"
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">内部备注</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="内部备注(对用户不可见)"
            />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            取消
          </Button>
          <Button onClick={save} disabled={isPending}>
            {isPending ? "保存中..." : "保存修改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

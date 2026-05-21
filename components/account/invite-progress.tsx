"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Copy, Check, Share2, Gift, Facebook, Twitter, MessageCircle, Mail, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InviteProgress({
  inviteCode,
  totalInvited,
  totalAttempted,
  giftUnlocked,
  hasClaim,
}: {
  inviteCode: string
  totalInvited: number
  totalAttempted: number
  giftUnlocked: boolean
  hasClaim: boolean
}) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const target = 20
  const percent = Math.min(100, Math.round((totalInvited / target) * 100))

  const inviteLink = useMemo(() => {
    if (typeof window === "undefined") return `/login?ref=${inviteCode}`
    return `${window.location.origin}/login?ref=${inviteCode}`
  }, [inviteCode])

  const shareText = `Join me on Dog is OK — trusted dog care, 100% free. Sign up with my invite code ${inviteCode} and we both get perks!`

  const socials = useMemo(
    () => [
      {
        name: "Twitter",
        icon: Twitter,
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(inviteLink)}`,
        color: "hover:text-[#1DA1F2]",
      },
      {
        name: "Facebook",
        icon: Facebook,
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}&quote=${encodeURIComponent(shareText)}`,
        color: "hover:text-[#1877F2]",
      },
      {
        name: "Instagram",
        icon: Instagram,
        href: `https://www.instagram.com/`,
        color: "hover:text-[#E4405F]",
        external: true,
        title: "Share via Instagram (open app and share)",
      },
      {
        name: "WhatsApp",
        icon: MessageCircle,
        href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${inviteLink}`)}`,
        color: "hover:text-[#25D366]",
      },
      {
        name: "Email",
        icon: Mail,
        href: `mailto:?subject=${encodeURIComponent("Join me on Dog is OK")}&body=${encodeURIComponent(`${shareText}\n\n${inviteLink}`)}`,
        color: "hover:text-foreground",
      },
    ],
    [inviteLink, shareText],
  )

  async function copy(text: string, which: "code" | "link") {
    try {
      await navigator.clipboard.writeText(text)
      if (which === "code") {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
    } catch (e) {
      console.log("[v0] copy failed", e)
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Dog is OK",
          text: shareText,
          url: inviteLink,
        })
      } catch (e) {
        console.log("[v0] share cancelled", e)
      }
    } else {
      copy(inviteLink, "link")
    }
  }

  const giftStatusLabel = hasClaim ? "Claim submitted" : giftUnlocked ? "Unlocked!" : "In progress"

  return (
    <section className="rounded-2xl border border-border bg-background p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Invite &amp; earn</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Invite 20 friends, get a free pet supplement pack
          </h2>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Share your code. When 20 friends sign up with verified emails, we ship a free vet-curated supplement pack to
          your US/Canada address.
        </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <Gift className="h-3.5 w-3.5" aria-hidden="true" />
          {giftStatusLabel}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-semibold tracking-tight">{totalInvited}</span>
            <span className="text-lg text-muted-foreground"> / {target} friends</span>
          </div>
          <span className="text-sm font-medium text-muted-foreground">{percent}%</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Each friend must sign up with a unique email and verify it to count. {totalAttempted > totalInvited && `(${totalAttempted - totalInvited} pending verification)`}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your invite code</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="font-mono text-xl font-semibold tracking-wider">{inviteCode || "—"}</span>
            <Button size="sm" variant="ghost" onClick={() => copy(inviteCode, "code")} disabled={!inviteCode}>
              {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1.5 text-xs">{copiedCode ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Invite link</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="truncate text-sm text-muted-foreground">{inviteLink}</span>
            <Button size="sm" variant="ghost" onClick={() => copy(inviteLink, "link")}>
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Share to</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button onClick={nativeShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <div className="flex items-center gap-1">
            {socials.map((s) => {
              const Icon = s.icon
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share via ${s.name}`}
                  title={s.title}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors ${s.color}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              )
            })}
          </div>
          {giftUnlocked && !hasClaim && (
            <Button asChild variant="default" className="ml-auto gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/account/claim-product">
                <Gift className="h-4 w-4" />
                Claim free gift
              </Link>
            </Button>
          )}
          {hasClaim && (
            <Button asChild variant="outline" className="ml-auto gap-2">
              <Link href="/account/claim-product">
                <Gift className="h-4 w-4" />
                View claim
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

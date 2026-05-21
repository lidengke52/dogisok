import { redirect } from "next/navigation"
import Link from "next/link"
import { PawPrint, Gift, Users, MessageSquare, Bookmark } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { InviteProgress } from "@/components/account/invite-progress"
import { ProductShowcaseMini } from "@/components/account/product-showcase-mini"
import { ShippingAddressForm } from "@/components/account/shipping-address-form"
import { signOut } from "./actions"

export const dynamic = "force-dynamic"

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: stats, error: statsError } = await supabase.rpc("get_invite_stats", { user_id: user.id })
  if (statsError) {
    console.error("[v0] get_invite_stats error:", statsError)
  }
  const inviteStats =
    Array.isArray(stats) && stats.length > 0
      ? stats[0]
      : {
          invite_code: profile?.invite_code ?? "",
          total_invited: 0,
          verified_invited: 0,
        }

  const displayName = profile?.display_name || user.email?.split("@")[0] || "Friend"

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SiteHeader />

      <main className="flex-1 bg-secondary/30">
        <section className="border-b border-border bg-background">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6 md:py-10 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PawPrint className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Welcome back</p>
                <h1 className="truncate text-2xl font-semibold tracking-tight">{displayName}</h1>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <form action={signOut}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2 space-y-6">
            <InviteProgress
              inviteCode={inviteStats.invite_code}
              totalInvited={Number(inviteStats.verified_invited ?? 0)}
              totalAttempted={Number(inviteStats.total_invited ?? 0)}
              giftUnlocked={Boolean(profile?.gift_unlocked)}
              hasClaim={Boolean(profile?.has_claim)}
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                href="/consultation"
                className="group flex flex-col rounded-2xl border border-border bg-background p-5 transition-shadow hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-base font-semibold">AI Consultation</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start a new question or view past consultations.
                </p>
                <span className="mt-3 text-sm font-medium text-primary group-hover:underline">Start now →</span>
              </Link>

              <Link
                href="/account/saved"
                className="group flex flex-col rounded-2xl border border-border bg-background p-5 transition-shadow hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Bookmark className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-base font-semibold">Saved Articles</h3>
                <p className="mt-1 text-sm text-muted-foreground">Your personal library of vet-reviewed content.</p>
                <span className="mt-3 text-sm font-medium text-primary group-hover:underline">View library →</span>
              </Link>
            </div>

            {/* Products Section */}
            <div className="mt-8 rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold">Claim a free premium product</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Invite 20+ friends and choose from our range of pet care products
              </p>
              <div className="mt-6">
                <ProductShowcaseMini />
              </div>
              {inviteStats.gift_unlocked && !inviteStats.has_claim && (
                <Button size="lg" asChild className="mt-6 w-full">
                  <Link href="/account/claim-product">Claim my free product</Link>
                </Button>
              )}
              {inviteStats.has_claim && (
                <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                  <p className="font-medium text-primary">✓ Product claimed</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your product claim has been recorded and will be processed soon.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <ShippingAddressForm
                defaults={{
                  recipient_name: profile?.recipient_name ?? null,
                  phone: profile?.phone ?? null,
                  postal_code: profile?.postal_code ?? null,
                  street_address: profile?.street_address ?? null,
                  city: profile?.city ?? null,
                  state: profile?.state ?? null,
                  country: profile?.country ?? null,
                }}
              />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4" aria-hidden="true" />
                Account stats
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Friends invited</dt>
                  <dd className="font-semibold">{Number(inviteStats.verified_invited ?? 0)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Gift status</dt>
                  <dd className="font-semibold">
                    {profile?.has_claim
                      ? "Submitted"
                      : profile?.gift_unlocked
                        ? "Ready to claim"
                        : "In progress"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Member since</dt>
                  <dd className="font-semibold">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
              <Gift className="h-8 w-8 text-accent" aria-hidden="true" />
              <h3 className="mt-3 text-base font-semibold">How the reward works</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>1. Share your invite code with friends</li>
                <li>2. They sign up using your code</li>
                <li>3. When 20 friends register, claim a free pet supplement pack</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

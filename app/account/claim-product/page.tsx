import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductClaimForm } from "@/components/account/product-claim-form"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ClaimProductPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user has already claimed
  const { data: existing } = await supabase
    .from("product_claims")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (existing) {
    redirect("/account?claimed=true")
  }

  // Check invite count
  const { data: stats } = await supabase.rpc("get_invite_stats", { p_user_id: user.id })
  const inviteStats = Array.isArray(stats) && stats.length > 0 ? stats[0] : null
  const totalInvited = Number(inviteStats?.total_invited ?? 0)

  if (totalInvited < 20) {
    redirect("/account?error=not_eligible")
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
          {/* Back link */}
          <Link href="/account" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to account
          </Link>

          {/* Page */}
          <div className="mt-8 space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Claim your free product</h1>
              <p className="text-muted-foreground">
                Congratulations! You&apos;ve invited 20+ friends. Choose one of our premium products to claim for free.
              </p>
            </div>

            <ProductClaimForm userId={user.id} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

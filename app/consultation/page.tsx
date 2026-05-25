import { redirect } from "next/navigation"
import { headers, cookies } from "next/headers"
import { Sparkles, ShieldCheck, Clock3, MessagesSquare } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import { PetInfoForm } from "@/components/consultation/pet-info-form"
import { FeaturedCasesGrid } from "@/components/consultation/featured-cases-grid"
import { getFeaturedCases } from "@/lib/featured-cases"
import { ProductAdSlot } from "@/components/ads/product-ad-card"
import { getProductAdsByPlacement } from "@/lib/product-ads"

export const dynamic = "force-dynamic"

const TRUSTED_PARTNERS = ["pawsareok.com"]

function isFromTrustedPartner(referer: string | null): boolean {
  if (!referer) return false
  try {
    const host = new URL(referer).hostname.replace(/^www\./, "")
    return TRUSTED_PARTNERS.some((p) => host === p || host.endsWith(`.${p}`))
  } catch {
    return false
  }
}

const trustPoints = [
  { icon: Clock3, title: "Seconds, not hours", description: "Dr. Max replies in real time." },
  { icon: ShieldCheck, title: "Scoped to pet care", description: "Only answers dog & cat questions." },
  { icon: MessagesSquare, title: "Chat & attach", description: "Share photos or documents for context." },
]

export default async function ConsultationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 检查来自 pawsareok.com 的 referer，允许免登录访问
  const headersList = await headers()
  const cookieStore = await cookies()
  const referer = headersList.get("referer")
  const partnerCookie = cookieStore.get("partner_access")?.value

  const isPartnerAccess =
    isFromTrustedPartner(referer) || partnerCookie === "pawsareok"

  if (!user && !isPartnerAccess) {
    redirect("/login?redirect=/consultation")
  }

  // 如果是来自合作伙伴的 referer，设置 cookie 保持免登录状态（1小时）
  if (isFromTrustedPartner(referer) && partnerCookie !== "pawsareok") {
    const cookieStore2 = await cookies()
    cookieStore2.set("partner_access", "pawsareok", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    })
  }

  const [featuredCases, consultationAds] = await Promise.all([
    getFeaturedCases(),
    getProductAdsByPlacement("consultation", 1),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {isPartnerAccess && !user && (
        <div className="border-b border-primary/20 bg-primary/5 px-4 py-2.5 text-center text-sm text-primary">
          You are accessing Dr. Max via{" "}
          <span className="font-semibold">pawsareok.com</span> — no account required.
        </div>
      )}

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Dr. Max
              </span>
              <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Meet Dr. Max — your trusted pet doctor
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Tell us about your dog once, then chat freely. Dr. Max will ask follow-up questions, review photos or
                reports you share, and guide you on whether to stay home or go to the clinic.
              </p>

              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {trustPoints.map((point) => {
                  const Icon = point.icon
                  return (
                    <li key={point.title} className="rounded-xl border border-border bg-card p-4 text-sm">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <p className="mt-3 font-semibold">{point.title}</p>
                      <p className="mt-1 text-muted-foreground">{point.description}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-16 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Tell us about your dog</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This helps Dr. Max understand context before the conversation begins.
            </p>

            <PetInfoForm />
          </div>
        </section>

        <ProductAdSlot ads={consultationAds} />

        <FeaturedCasesGrid cases={featuredCases} />
      </main>

      <SiteFooter />
    </div>
  )
}

import { redirect } from "next/navigation"
import { Stethoscope, ShieldAlert, Clock3 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { DiseaseCheckPanel } from "@/components/disease-check/disease-check-panel"
import { FeaturedDiseaseCasesGrid } from "@/components/disease-check/featured-disease-cases-grid"
import { getFeaturedDiseaseCases } from "@/lib/featured-disease-cases"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Disease Self-Check · Dog is OK",
  description:
    "Describe your dog's symptoms and get a preliminary AI assessment in seconds — no registration required.",
}

const highlights = [
  { icon: Clock3, title: "Under 20 seconds", description: "Fast initial triage from a few simple inputs." },
  { icon: ShieldAlert, title: "Urgency flagging", description: "Know whether to wait, call, or head to the ER." },
  { icon: Stethoscope, title: "Deep follow-up", description: "Sign in to continue with Dr. Max for a real chat." },
]

export default async function DiseaseCheckPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/disease-check")
  }

  const featuredCases = await getFeaturedDiseaseCases()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 via-background to-background" />
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
                Member preliminary check
              </span>
              <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Disease Self-Check
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Tell Dr. Max about your dog&apos;s breed, age, and symptoms — including the affected body areas — and
                you&apos;ll get an initial triage with possible causes, urgency level, home care steps, and red flags to
                watch for.
              </p>

              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {highlights.map((h) => {
                  const Icon = h.icon
                  return (
                    <li key={h.title} className="rounded-xl border border-border bg-card p-4 text-sm">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <p className="mt-3 font-semibold">{h.title}</p>
                      <p className="mt-1 text-muted-foreground">{h.description}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-16 lg:px-8">
          <DiseaseCheckPanel />
        </section>

        <FeaturedDiseaseCasesGrid cases={featuredCases} />
      </main>

      <SiteFooter />
    </div>
  )
}

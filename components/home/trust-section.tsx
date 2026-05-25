import { ShieldCheck, HeartHandshake, Globe2, BadgeCheck } from "lucide-react"

const pillars = [
  {
    icon: ShieldCheck,
    title: "Vet-reviewed content",
    description: "Every article is fact-checked by licensed veterinarians before publishing.",
  },
  {
    icon: HeartHandshake,
    title: "Warm, never clinical",
    description: "Clear explanations that feel like advice from a trusted friend who happens to be an expert.",
  },
  {
    icon: Globe2,
    title: "Four languages, one standard",
    description: "Available in English, French, Spanish, and German — localized, not just translated.",
  },
  {
    icon: BadgeCheck,
    title: "GDPR-compliant, ad-light",
    description: "Your data stays private. We keep advertising tasteful and never at the cost of trust.",
  },
]

export function TrustSection() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Why pet parents trust us</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Professional, warm, and built for the whole world
          </h2>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <li
                key={pillar.title}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

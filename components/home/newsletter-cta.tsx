import { Gift, Users, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

const perks = [
  {
    icon: Mail,
    title: "Weekly vet-reviewed tips",
    description: "A curated digest of the most useful articles, straight to your inbox.",
  },
  {
    icon: Users,
    title: "Invite friends, earn rewards",
    description: "Every referral counts. Invite 20 and unlock a free health supplement.",
  },
  {
    icon: Gift,
    title: "New member welcome pack",
    description: "Personalized onboarding based on your dog's breed, age, and lifestyle.",
  },
]

export function NewsletterCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-20 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
        <div className="absolute inset-0 -z-0 opacity-20">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent/60 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-primary-foreground/40 blur-3xl" />
        </div>

        <div className="relative grid gap-10 p-8 md:p-12 lg:grid-cols-5 lg:p-16">
          <div className="lg:col-span-2">
            <h2 className="text-balance text-3xl font-semibold leading-tight md:text-4xl">
              Join 120,000+ dog parents who start their week with Dog is OK.
            </h2>
            <p className="mt-4 text-pretty text-primary-foreground/80">
              Free to join. Unsubscribe anytime. No spam, ever.
            </p>

            <form className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="your@email.com"
                className="h-12 flex-1 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 text-sm text-primary-foreground outline-none backdrop-blur placeholder:text-primary-foreground/60 focus:bg-primary-foreground/15 focus:ring-2 focus:ring-primary-foreground/40"
              />
              <Button type="submit" variant="secondary" size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90">
                Join free
              </Button>
            </form>
            <p className="mt-3 text-xs text-primary-foreground/70">
              By joining, you agree to our Privacy Policy and GDPR terms.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-3 lg:col-span-3 lg:grid-cols-1 lg:gap-6">
            {perks.map((perk) => {
              const Icon = perk.icon
              return (
                <li
                  key={perk.title}
                  className="flex items-start gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 backdrop-blur"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{perk.title}</p>
                    <p className="mt-1 text-sm text-primary-foreground/80">{perk.description}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

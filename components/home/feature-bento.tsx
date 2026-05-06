import Link from "next/link"
import { Apple, Activity, BookOpen, Pill, Stethoscope, ArrowUpRight } from "lucide-react"

const features = [
  {
    slug: "can-eat",
    title: "Can They Eat It?",
    subtitle: "Food safety guide",
    description:
      "Search 500+ foods with veterinarian-approved verdicts: safe, caution, or do not feed. Covers portion guidance and warning signs.",
    href: "/articles?category=can-eat",
    icon: Apple,
    tone: "primary",
    size: "lg",
    stat: "500+ foods",
  },
  {
    slug: "can-do",
    title: "Can They Do It?",
    subtitle: "Activity & safety",
    description: "Travel, grooming, home life, and clothing — practical answers before you try something new.",
    href: "/articles?category=can-do",
    icon: Activity,
    tone: "accent",
    size: "md",
    stat: "186 guides",
  },
  {
    slug: "knowledge",
    title: "Knowledge Library",
    subtitle: "12 expert topics",
    description:
      "From new-home basics to senior care, nutrition, behavior, and breed-specific insights — all in one place.",
    href: "/articles?category=knowledge",
    icon: BookOpen,
    tone: "neutral",
    size: "md",
    stat: "412 articles",
  },
  {
    slug: "medication-check",
    title: "Medication Check",
    subtitle: "Search by drug or condition",
    description: "Find dosage guidelines, known interactions, and when to call the vet.",
    href: "/medication-check",
    icon: Pill,
    tone: "primary",
    size: "md",
    stat: "94 medications",
  },
  {
    slug: "symptom-check",
    title: "Symptom Self-Check",
    subtitle: "Multi-factor assessment",
    description: "Narrow down possible conditions by body area, age, and observed symptoms in minutes.",
    href: "/disease-check",
    icon: Stethoscope,
    tone: "accent",
    size: "md",
    stat: "Smart triage",
  },
]

const toneClasses: Record<string, { bg: string; iconBg: string; iconFg: string; badge: string }> = {
  primary: {
    bg: "bg-primary text-primary-foreground",
    iconBg: "bg-primary-foreground/15",
    iconFg: "text-primary-foreground",
    badge: "bg-primary-foreground/15 text-primary-foreground",
  },
  accent: {
    bg: "bg-accent text-accent-foreground",
    iconBg: "bg-accent-foreground/15",
    iconFg: "text-accent-foreground",
    badge: "bg-accent-foreground/15 text-accent-foreground",
  },
  neutral: {
    bg: "bg-card text-card-foreground border border-border",
    iconBg: "bg-secondary",
    iconFg: "text-primary",
    badge: "bg-secondary text-foreground",
  },
}

export function FeatureBento() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Everything in one place</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Five ways to care for your dog, confidently
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Quick-answer tools and deep-dive articles — designed so you never have to second-guess a decision about your
          dog again.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {features.map((feature, i) => {
          const tone = toneClasses[feature.tone]
          const Icon = feature.icon
          const spanClasses =
            i === 0
              ? "lg:col-span-2 lg:row-span-2"
              : i === 1
                ? "lg:col-span-2"
                : i === 2
                  ? "lg:col-span-1"
                  : i === 3
                    ? "lg:col-span-1"
                    : "lg:col-span-2"

          return (
            <Link
              key={feature.slug}
              href={feature.href}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg md:p-7 ${tone.bg} ${spanClasses}`}
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone.iconBg}`}>
                  <Icon className={`h-5 w-5 ${tone.iconFg}`} aria-hidden="true" />
                </span>
                <ArrowUpRight
                  className="h-5 w-5 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-10 lg:mt-16">
                <p className="text-xs font-medium opacity-70">{feature.subtitle}</p>
                <h3 className="mt-2 text-balance text-xl font-semibold leading-tight md:text-2xl">{feature.title}</h3>
                <p className="mt-3 text-pretty text-sm leading-relaxed opacity-80">{feature.description}</p>
                <span
                  className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone.badge}`}
                >
                  {feature.stat}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

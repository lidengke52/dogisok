import Image from "next/image"
import Link from "next/link"
import { Search, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFormattedStatistics } from "@/lib/format-numbers"

export function HeroSection() {
  const stats = getFormattedStatistics()

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/10 via-accent/5 to-transparent blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-6 md:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Trusted by 120,000+ pet owners worldwide
            </span>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Professional Dog Care Knowledge for Global Pet Owners
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Health, Behavior, Nutrition and more. Everything you need to know, written by licensed veterinarians and
              available in four languages.
            </p>

            <form className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row" role="search">
              <label htmlFor="hero-search" className="sr-only">
                Search articles
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="hero-search"
                  type="search"
                  placeholder="Search: can dogs eat chocolate, puppy vaccines..."
                  className="h-12 w-full rounded-lg border border-border bg-background pl-11 pr-4 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                Search
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/login">
                  Get Started Free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/consultation">Ask Dr. Max</Link>
              </Button>
            </div>

            <dl className="mt-10 grid w-full max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Symptom consultations</dt>
                <dd className="mt-auto text-2xl font-semibold tracking-tight tabular-nums">{stats.symptomConsultations}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Drug types</dt>
                <dd className="mt-auto text-2xl font-semibold tracking-tight tabular-nums">{stats.drugTypes}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Breeds covered</dt>
                <dd className="mt-auto text-2xl font-semibold tracking-tight tabular-nums">{stats.breedsCovered}</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <Image
                src="/images/hero-dog.jpg"
                alt="A happy golden retriever being gently petted by its owner"
                width={720}
                height={840}
                priority
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -bottom-4 -left-4 hidden max-w-[260px] rounded-xl border border-border bg-card p-4 shadow-lg md:block">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Dr. Max</p>
                  <p className="text-xs text-muted-foreground">Answers in under 30 seconds</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 hidden rounded-xl border border-border bg-card p-4 shadow-lg md:block">
              <p className="text-xs text-muted-foreground">Verified by</p>
              <p className="text-sm font-semibold">Licensed DVMs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

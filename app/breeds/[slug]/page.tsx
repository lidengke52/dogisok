import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Heart, Scale, Ruler, Clock, MapPin, Users, BookOpen, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { getBreed, listArticlesByBreed } from "@/lib/breeds"
import { toCardArticle } from "@/lib/articles"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const breed = await getBreed(slug)
  if (!breed) return { title: "Breed not found · Dog is OK" }
  return {
    title: `${breed.name}${breed.cnName ? ` (${breed.cnName})` : ""} · Dog is OK`,
    description: breed.summary,
  }
}

function Rating({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`h-1.5 w-5 rounded-full ${n <= value ? "bg-primary" : "bg-secondary"}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}

export default async function BreedDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // 并行查询品种和该品种的文章
  const [breed, breedArticleRows] = await Promise.all([
    getBreed(slug),
    listArticlesByBreed(slug),
  ])

  if (!breed || !breed.isPublished) notFound()

  const breedArticles = breedArticleRows.map(toCardArticle)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/breeds">
              <ArrowLeft className="h-4 w-4" />
              All breeds
            </Link>
          </Button>
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-12 pt-6 md:px-6 md:pb-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-secondary">
              <Image
                src={breed.image || "/placeholder.svg"}
                alt={breed.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  {breed.group}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                  {breed.size}
                </span>
              </div>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                {breed.name}
              </h1>
              {breed.cnName ? <p className="mt-1 text-lg text-muted-foreground">{breed.cnName}</p> : null}
              <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">{breed.summary}</p>

              <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Origin
                  </dt>
                  <dd className="mt-1 font-semibold">{breed.origin}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Lifespan
                  </dt>
                  <dd className="mt-1 font-semibold">{breed.lifespan}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Scale className="h-3.5 w-3.5" />
                    Weight
                  </dt>
                  <dd className="mt-1 font-semibold">{breed.weight}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ruler className="h-3.5 w-3.5" />
                    Height
                  </dt>
                  <dd className="mt-1 font-semibold">{breed.height}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Kids
                  </dt>
                  <dd className="mt-1 font-semibold">{breed.goodWithKids ? "Good with kids" : "Careful"}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Heart className="h-3.5 w-3.5" />
                    Temperament
                  </dt>
                  <dd className="mt-1 font-semibold">{breed.temperament[0] ?? "—"}</dd>
                </div>
              </dl>

              <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-5">
                <Rating value={breed.trainability} label="Trainability" />
                <Rating value={breed.shedding} label="Shedding" />
                <Rating value={breed.exercise} label="Exercise needs" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <h2 className="text-xl font-semibold tracking-tight">Care notes</h2>
              {breed.careNotes.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {breed.careNotes.map((note) => (
                    <li key={note} className="flex gap-3 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <span className="text-foreground/90">{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <h2 className="text-xl font-semibold tracking-tight">Common health concerns</h2>
              {breed.commonHealth.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No items yet.</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {breed.commonHealth.map((item) => (
                    <li key={item} className="flex gap-3 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-5 text-xs text-muted-foreground">
                Noticed any of these symptoms? Try our{" "}
                <Link href="/disease-check" className="font-medium text-accent hover:underline">
                  free Disease Self-Check
                </Link>
                , or start a real conversation with{" "}
                <Link href="/consultation" className="font-medium text-primary hover:underline">
                  Dr. Max
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* 该品种相关文章 */}
        {breedArticles.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  Articles
                </span>
                <h2 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
                  Articles about {breed.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  In-depth guides written by our editors and reviewed by licensed vets.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {breedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    <Image
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-xs font-medium uppercase tracking-wider text-primary">
                      {article.category}
                    </span>
                    <h3 className="mt-2 line-clamp-2 text-base font-semibold tracking-tight text-foreground">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {article.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{article.readTime} min read</span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        Read
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

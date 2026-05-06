import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Dog } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { listPublishedBreeds } from "@/lib/breeds"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Dog Breeds · Dog is OK",
  description:
    "Compare the most popular dog breeds — their temperament, care needs, trainability and common health concerns.",
}

const sizeLabel = {
  Small: "Small",
  Medium: "Medium",
  Large: "Large",
} as const

export default async function BreedsPage() {
  const breeds = await listPublishedBreeds()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Dog className="h-3.5 w-3.5" aria-hidden="true" />
                Breed library
              </span>
              <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Dog Breeds
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Find the right fit for your family, or understand what your dog truly needs. Each profile covers
                temperament, exercise needs, grooming, and common health concerns.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
          {breeds.length === 0 ? (
            <p className="text-sm text-muted-foreground">No breeds published yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {breeds.map((breed) => (
                <Link
                  key={breed.slug}
                  href={`/breeds/${breed.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    <Image
                      src={breed.image || "/placeholder.svg"}
                      alt={breed.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
                        {sizeLabel[breed.size]}
                      </span>
                      <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
                        {breed.group}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight">{breed.name}</h2>
                      {breed.cnName ? (
                        <span className="text-sm text-muted-foreground">· {breed.cnName}</span>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{breed.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {breed.temperament.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{breed.lifespan}</span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        Read more
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

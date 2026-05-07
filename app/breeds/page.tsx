import { Dog } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BreedsGrid } from "@/components/breeds-grid"
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
          <BreedsGrid breeds={breeds} />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArticleCard } from "@/components/article-card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { FileText } from "lucide-react"
import { listPublishedArticles, toCardArticle } from "@/lib/articles"
import { ProductAdSlot } from "@/components/ads/product-ad-card"
import { getProductAdsByPlacement } from "@/lib/product-ads"

export const dynamic = "force-dynamic"

const FILTERS = [
  { slug: "all", label: "All" },
  { slug: "food", label: "Can Eat" },
  { slug: "behavior", label: "Can Do" },
  { slug: "knowledge", label: "Knowledge" },
  { slug: "breed", label: "Breeds" },
  { slug: "health", label: "Health" },
]

type PageProps = {
  searchParams: Promise<{ category?: string }>
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { category = "all" } = await searchParams
  const [rows, articleAds] = await Promise.all([
    listPublishedArticles({ category }),
    getProductAdsByPlacement("articles", 1),
  ])
  const items = rows.map(toCardArticle)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14 lg:px-8">
            <p className="text-sm font-medium text-primary">Knowledge Center</p>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Browse vet-reviewed articles
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
              Filter by category. All content is reviewed by licensed veterinarians and updated regularly.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = f.slug === category
              return (
                <Link
                  key={f.slug}
                  href={f.slug === "all" ? "/articles" : `/articles?category=${f.slug}`}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {f.label}
                </Link>
              )
            })}
          </div>
        </section>

        <ProductAdSlot ads={articleAds} />

        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-20 lg:px-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{items.length}</span>{" "}
              {items.length === 1 ? "article" : "articles"}
            </p>
          </div>

          {items.length === 0 ? (
            <Empty className="mt-10 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No articles yet</EmptyTitle>
                <EmptyDescription>
                  {category === "all"
                    ? "Check back soon for new content from our veterinary team."
                    : "Try a different category or clear the filter."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

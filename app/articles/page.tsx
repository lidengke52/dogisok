import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArticleCard } from "@/components/article-card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { FileText } from "lucide-react"
import { listPublishedArticles, toCardArticle } from "@/lib/articles"
import { ProductAdSlot } from "@/components/ads/product-ad-card"
import { getProductAdsByPlacement } from "@/lib/product-ads"
import { ArticlesGrid } from "@/components/articles-grid"

export const dynamic = "force-dynamic"

const FILTERS = [
  { slug: "all", label: "All" },
  { slug: "food", label: "Can Eat" },
  { slug: "behavior", label: "Can Do" },
  { slug: "knowledge", label: "Knowledge" },
  { slug: "health", label: "Health" },
]

type PageProps = {
  searchParams: Promise<{ category?: string; search?: string }>
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { category = "all", search = "" } = await searchParams
  const [rows, articleAds] = await Promise.all([
    listPublishedArticles({ category, limit: 100 }),
    getProductAdsByPlacement("articles", 1),
  ])
  
  // 搜索过滤
  const filtered = search
    ? rows.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          (r.excerpt && r.excerpt.toLowerCase().includes(search.toLowerCase())),
      )
    : rows

  const items = filtered.map(toCardArticle)

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
          <div className="space-y-4">
            {/* 分类过滤 */}
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

            {/* 搜索框 */}
            <form method="GET" className="flex gap-2">
              <input
                type="hidden"
                name="category"
                value={category}
              />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="搜索文章..."
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                搜索
              </button>
            </form>
          </div>
        </section>

        <ProductAdSlot ads={articleAds} />

        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-20 lg:px-8">
          {items.length === 0 ? (
            <Empty className="mt-10 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No articles found</EmptyTitle>
                <EmptyDescription>
                  {search
                    ? "Try different keywords or clear the search."
                    : category === "all"
                      ? "Check back soon for new content from our veterinary team."
                      : "Try a different category or clear the filter."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ArticlesGrid articles={items} />
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

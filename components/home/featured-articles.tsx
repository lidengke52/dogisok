import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArticleCard } from "@/components/article-card"
import { listPublishedArticles, toCardArticle } from "@/lib/articles"

export async function FeaturedArticles() {
  const rows = await listPublishedArticles({ limit: 5 })
  const items = rows.map(toCardArticle)

  if (items.length === 0) return null

  const [featured, ...rest] = items

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Featured Reading</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Fresh from our veterinary team
          </h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/articles">
            Browse all articles
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1fr]">
        {featured && (
          <div className="self-start">
            <ArticleCard article={featured} variant="featured" />
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {rest.slice(0, 4).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}

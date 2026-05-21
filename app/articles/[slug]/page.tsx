import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Clock, CalendarDays, Facebook, Twitter, Share2, ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArticleCard } from "@/components/article-card"
import { ProductAdSlot } from "@/components/ads/product-ad-card"
import { Button } from "@/components/ui/button"
import { getArticleBySlug, listRelated, toCardArticle, listRandomArticles } from "@/lib/articles"
import { getProductAdsByPlacement } from "@/lib/product-ads"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  // 并行获取相关文章、随机文章、广告位，避免串行等待
  const [relatedRows, randomRows, ads] = await Promise.all([
    listRelated(article),
    listRandomArticles(article, 3),
    getProductAdsByPlacement("articles", 1),
  ])
  const related = relatedRows.map(toCardArticle)
  const randomArticles = randomRows.map(toCardArticle)
  const publishedDate = article.published_at ?? article.created_at

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <article>
          <div className="mx-auto max-w-3xl px-4 pt-8 md:px-6 md:pt-12 lg:px-8">
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to articles
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
                {article.category}
              </span>
              {article.subcategory && (
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  {article.subcategory}
                </span>
              )}
              {article.tags?.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>

            <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-sm font-semibold">
                    {(article.author ?? "E")
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                </span>
                <div>
                  <p className="text-sm font-medium">{article.author}</p>
                  <p className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(publishedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {article.read_minutes ?? 5} min read
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="mr-2 text-xs text-muted-foreground">Share</span>
                <Button variant="outline" size="icon" aria-label="Share on Facebook">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Share on Twitter">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Copy link">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {article.cover_image && (
            <div className="mx-auto mt-10 max-w-5xl px-4 md:px-6 lg:px-8">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
                <Image
                  src={article.cover_image || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 1024px, 100vw"
                />
              </div>
            </div>
          )}

          <div className="mx-auto mt-10 max-w-3xl px-4 pb-16 md:px-6 md:pb-20 lg:px-8">
            <div className="prose-custom max-w-none text-base leading-relaxed text-foreground/90">
              {article.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">This article has no content yet.</p>
              )}
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-border bg-secondary/30">
            <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
              <div className="flex items-end justify-between">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Related reading</h2>
                <Button variant="ghost" asChild>
                  <Link href="/articles">More articles</Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {related.map((r) => (
                  <ArticleCard key={r.slug} article={r} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 广告位 + 随机关联文章 */}
        <ProductAdSlot ads={ads} />

        {randomArticles.length > 0 && (
          <section className="border-t border-border bg-secondary/30">
            <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Explore more</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {randomArticles.map((r) => (
                  <ArticleCard key={r.slug} article={r} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

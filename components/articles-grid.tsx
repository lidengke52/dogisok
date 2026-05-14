"use client"

import { useState } from "react"
import { ArticleCard } from "@/components/article-card"
import { Button } from "@/components/ui/button"
import type { Article } from "@/lib/mock-data"

const INITIAL_LOAD = 15
const LOAD_MORE_BATCH = 15

export function ArticlesGrid({ articles }: { articles: Article[] }) {
  const [displayed, setDisplayed] = useState(INITIAL_LOAD)

  const visibleArticles = articles.slice(0, displayed)
  const hasMore = displayed < articles.length

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setDisplayed((prev) => prev + LOAD_MORE_BATCH)}
            variant="outline"
            size="lg"
          >
            Show More
          </Button>
        </div>
      )}
    </div>
  )
}

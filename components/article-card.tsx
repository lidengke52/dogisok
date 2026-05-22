"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import type { Article } from "@/lib/mock-data"

type ArticleCardProps = {
  article: Article
  variant?: "default" | "compact" | "featured"
}

const handleArticleClick = () => {
  // 保存当前滚动位置和点击的文章 slug
  if (typeof window !== "undefined") {
    sessionStorage.setItem("articles_scroll_y", window.scrollY.toString())
  }
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  if (variant === "featured") {
    return (
      <Link
        href={`/articles/${article.slug}`}
        onClick={handleArticleClick}
        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {article.image ? (
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-6">
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{article.category}</p>
                <p className="mt-3 text-balance text-base font-semibold text-foreground line-clamp-4">{article.title}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {article.category}
            </span>
          </div>
          <h3 className="mt-3 text-balance text-lg font-semibold leading-snug text-foreground md:text-xl">
            {article.title}
          </h3>
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <span>{article.author}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {article.readTime} min
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/articles/${article.slug}`}
      onClick={handleArticleClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">{article.category}</p>
            <p className="text-balance text-center text-sm font-semibold text-foreground line-clamp-3">{article.title}</p>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {article.category}
          </span>
          {article.ageTag && (
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              {article.ageTag}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-balance text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>{article.author}</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime} min
          </span>
        </div>
      </div>
    </Link>
  )
}

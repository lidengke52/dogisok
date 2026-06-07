import type { MetadataRoute } from "next"
import { listPublishedArticles } from "@/lib/articles"
import { SITE_URL } from "@/lib/site-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // 获取所有已发布的文章
    const articles = await listPublishedArticles({ limit: 1000 })

    // 动态页面 - 文章详情页
    const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: article.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    // 静态页面
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
      {
        url: `${SITE_URL}/articles`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/breeds`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/terms`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.3,
      },
    ]

    // 合并所有页面
    return [...staticPages, ...articleEntries]
  } catch (error) {
    console.error("[v0] Sitemap generation error:", error)
    // 如果出错，至少返回静态页面
    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
    ]
  }
}

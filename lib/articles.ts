import { createClient } from "@/lib/supabase/server"
import type { Article } from "@/lib/mock-data"

export type DbArticle = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string
  subcategory: string | null
  tags: string[] | null
  author: string | null
  read_minutes: number | null
  views: number | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

const CATEGORY_LABEL: Record<string, string> = {
  food: "Can Eat",
  behavior: "Can Do",
  knowledge: "Knowledge",
  breed: "Breed Guide",
  health: "Health",
}

export function toCardArticle(row: DbArticle): Article {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    category: CATEGORY_LABEL[row.category] ?? row.category,
    categorySlug: row.category,
    readTime: row.read_minutes ?? 5,
    date: row.published_at ?? row.created_at,
    image: row.cover_image ?? "/placeholder.svg",
    author: row.author ?? "Editor",
    ageTag: row.subcategory ?? undefined,
    skillTag: row.tags?.[0],
  }
}

export async function listPublishedArticles(options?: { category?: string; limit?: number }) {
  const supabase = await createClient()
  let q = supabase.from("articles").select("*").eq("published", true).order("published_at", { ascending: false })
  if (options?.category && options.category !== "all") q = q.eq("category", options.category)
  if (options?.limit) q = q.limit(options.limit)
  const { data } = await q
  return (data ?? []) as DbArticle[]
}

export async function getArticleBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("articles").select("*").eq("slug", slug).eq("published", true).single()
  return data as DbArticle | null
}

export async function listRandomArticles(current: DbArticle, limit = 3) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .neq("id", current.id)
    .order("published_at", { ascending: false })
    .limit(limit * 2) // 取 2 倍数据，再客户端随机打乱取前 N 个

  if (!data || data.length === 0) return []

  // 简单的随机打乱（Fisher-Yates）
  const shuffled = [...data]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, limit) as DbArticle[]
}

export async function listRelated(current: DbArticle, limit = 3) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .eq("category", current.category)
    .neq("id", current.id)
    .order("published_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as DbArticle[]
}

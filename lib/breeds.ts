import { createClient } from "@/lib/supabase/server"
import type { DbArticle } from "@/lib/articles"

export type BreedGroup = "Sporting" | "Herding" | "Working" | "Toy" | "Non-Sporting" | "Terrier" | "Hound"
export type BreedSize = "Small" | "Medium" | "Large"

/**
 * 品种数据的统一类型（camelCase，便于在页面 JSX 中使用）。
 * 数据库的字段命名见 toBreed() 中的映射。
 */
export type Breed = {
  slug: string
  name: string
  cnName: string
  group: BreedGroup
  origin: string
  size: BreedSize
  lifespan: string
  weight: string
  height: string
  temperament: string[]
  goodWithKids: boolean
  trainability: 1 | 2 | 3 | 4 | 5
  shedding: 1 | 2 | 3 | 4 | 5
  exercise: 1 | 2 | 3 | 4 | 5
  image: string
  summary: string
  careNotes: string[]
  commonHealth: string[]
  isPublished: boolean
  displayOrder: number
}

/** Supabase 行 -> 前台用的 camelCase Breed */
type BreedRow = {
  slug: string
  name: string
  cn_name: string | null
  group_name: string | null
  origin: string | null
  size: string | null
  lifespan: string | null
  weight: string | null
  height: string | null
  temperament: string[] | null
  good_with_kids: boolean | null
  trainability: number | null
  shedding: number | null
  exercise: number | null
  image: string | null
  summary: string | null
  care_notes: string[] | null
  common_health: string[] | null
  is_published: boolean
  display_order: number
}

function toBreed(row: BreedRow): Breed {
  const clamp5 = (n: number | null) => Math.max(1, Math.min(5, n ?? 3)) as 1 | 2 | 3 | 4 | 5
  return {
    slug: row.slug,
    name: row.name,
    cnName: row.cn_name ?? "",
    group: ((row.group_name as BreedGroup | null) ?? "Non-Sporting") as BreedGroup,
    origin: row.origin ?? "",
    size: ((row.size as BreedSize | null) ?? "Medium") as BreedSize,
    lifespan: row.lifespan ?? "",
    weight: row.weight ?? "",
    height: row.height ?? "",
    temperament: row.temperament ?? [],
    goodWithKids: row.good_with_kids ?? true,
    trainability: clamp5(row.trainability),
    shedding: clamp5(row.shedding),
    exercise: clamp5(row.exercise),
    image: row.image ?? "/placeholder.svg",
    summary: row.summary ?? "",
    careNotes: row.care_notes ?? [],
    commonHealth: row.common_health ?? [],
    isPublished: row.is_published,
    displayOrder: row.display_order,
  }
}

/** 列出所有"已发布"品种（前台展示用） */
export async function listPublishedBreeds(): Promise<Breed[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("breeds")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("[v0] listPublishedBreeds error:", error)
    return []
  }
  return (data as BreedRow[]).map(toBreed)
}

/** 后台列出全部品种（含未发布） */
export async function listAllBreeds(): Promise<Breed[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("breeds")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("[v0] listAllBreeds error:", error)
    return []
  }
  return (data as BreedRow[]).map(toBreed)
}

/** 后台分页查询品种（支持搜索） */
export async function listAllBreedsWithPagination(
  page: number = 1,
  pageSize: number = 20,
  search?: string
) {
  const supabase = await createClient()
  
  // 构建查询
  let countQuery = supabase.from("breeds").select("*", { count: "exact", head: true })
  let dataQuery = supabase.from("breeds").select("*")

  // 如果有搜索词，过滤名称或中文名
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`
    countQuery = countQuery.or(`name.ilike.${searchTerm},cn_name.ilike.${searchTerm}`)
    dataQuery = dataQuery.or(`name.ilike.${searchTerm},cn_name.ilike.${searchTerm}`)
  }

  // 获取总数
  const { count, error: countError } = await countQuery
  if (countError) {
    console.error("[v0] listAllBreedsWithPagination count error:", countError)
    return { breeds: [], total: 0, page, pageSize }
  }

  // 获取数据
  const offset = (page - 1) * pageSize
  const { data, error } = await dataQuery
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })
    .range(offset, offset + pageSize - 1)

  if (error) {
    console.error("[v0] listAllBreedsWithPagination error:", error)
    return { breeds: [], total: count ?? 0, page, pageSize }
  }

  return {
    breeds: (data as BreedRow[]).map(toBreed),
    total: count ?? 0,
    page,
    pageSize,
  }
}

/** 单个品种 */
export async function getBreed(slug: string): Promise<Breed | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("breeds").select("*").eq("slug", slug).maybeSingle()
  if (error) {
    console.error("[v0] getBreed error:", error)
    return null
  }
  return data ? toBreed(data as BreedRow) : null
}

/** 列出关联到某品种的文章（按发布时间倒序） */
export async function listArticlesByBreed(breedSlug: string, limit?: number): Promise<DbArticle[]> {
  const supabase = await createClient()
  let q = supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .eq("breed_slug", breedSlug)
    .order("published_at", { ascending: false })
  if (limit) q = q.limit(limit)
  const { data, error } = await q
  if (error) {
    console.error("[v0] listArticlesByBreed error:", error)
    return []
  }
  return (data ?? []) as DbArticle[]
}

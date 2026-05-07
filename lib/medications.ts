import { createClient } from "@/lib/supabase/server"

export type MedicationCategory = "normal" | "caution" | "forbidden"

export type Medication = {
  id: string
  name: string
  indications: string
  applicable_pets: string
  usage_method: string
  dosage: string
  precautions: string
  category: MedicationCategory
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export async function searchMedications(query: string, limit = 30): Promise<Medication[]> {
  const supabase = await createClient()
  const trimmed = query.trim()
  if (!trimmed) return []

  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("is_active", true)
    .or(`name.ilike.%${trimmed}%,indications.ilike.%${trimmed}%,applicable_pets.ilike.%${trimmed}%`)
    .order("name", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("[v0] searchMedications error:", error)
    return []
  }
  return (data ?? []) as Medication[]
}

export async function getMedicationsByCategory(category: MedicationCategory, limit?: number): Promise<Medication[]> {
  const supabase = await createClient()
  let query = supabase
    .from("medications")
    .select("*")
    .eq("is_active", true)
    .eq("category", category)
    .order("name", { ascending: true })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] getMedicationsByCategory error:", error)
    return []
  }
  return (data ?? []) as Medication[]
}

export async function countMedicationsByCategory(category: MedicationCategory): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("medications")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("category", category)

  if (error) {
    console.error("[v0] countMedicationsByCategory error:", error)
    return 0
  }
  return count ?? 0
}
export async function getMedicationById(id: string): Promise<Medication | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("medications").select("*").eq("id", id).maybeSingle()
  if (error) {
    console.error("[v0] getMedicationById error:", error)
    return null
  }
  return data as Medication | null
}

/** 后台分页查询药品（支持搜索） */
export async function listAllMedicationsWithPagination(
  page: number = 1,
  pageSize: number = 20,
  search?: string
) {
  const supabase = await createClient()

  // 构建查询
  let countQuery = supabase.from("medications").select("*", { count: "exact", head: true })
  let dataQuery = supabase.from("medications").select("*")

  // 如果有搜索词，过滤名称、适用宠物、用途等
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`
    countQuery = countQuery.or(
      `name.ilike.${searchTerm},indications.ilike.${searchTerm},applicable_pets.ilike.${searchTerm},usage_method.ilike.${searchTerm}`
    )
    dataQuery = dataQuery.or(
      `name.ilike.${searchTerm},indications.ilike.${searchTerm},applicable_pets.ilike.${searchTerm},usage_method.ilike.${searchTerm}`
    )
  }

  // 获取总数
  const { count, error: countError } = await countQuery

  if (countError) {
    console.error("[v0] listAllMedicationsWithPagination count error:", countError)
    return { medications: [], total: 0, page, pageSize }
  }

  // 获取数据
  const offset = (page - 1) * pageSize
  const { data, error } = await dataQuery
    .order("name", { ascending: true })
    .range(offset, offset + pageSize - 1)

  if (error) {
    console.error("[v0] listAllMedicationsWithPagination error:", error)
    return { medications: [], total: count ?? 0, page, pageSize }
  }

  return {
    medications: (data ?? []) as Medication[],
    total: count ?? 0,
    page,
    pageSize,
  }
}

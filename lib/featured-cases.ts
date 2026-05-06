import { createClient } from "@/lib/supabase/server"

export type FeaturedCase = {
  id: string
  dog_breed: string
  dog_age: string
  symptom: string
  ai_answer: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getFeaturedCases(options: { activeOnly?: boolean } = {}): Promise<FeaturedCase[]> {
  const { activeOnly = true } = options
  const supabase = await createClient()
  let query = supabase
    .from("featured_cases")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query
  if (error) {
    console.error("[v0] getFeaturedCases error:", error.message)
    return []
  }
  return (data ?? []) as FeaturedCase[]
}

export async function getFeaturedCaseById(id: string): Promise<FeaturedCase | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("featured_cases").select("*").eq("id", id).single()
  if (error) {
    console.error("[v0] getFeaturedCaseById error:", error.message)
    return null
  }
  return data as FeaturedCase
}

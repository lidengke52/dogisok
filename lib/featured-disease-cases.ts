import { createClient } from "@/lib/supabase/server"

export type FeaturedDiseaseCase = {
  id: string
  dog_breed: string
  dog_age: string
  symptom: string
  self_check_content: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getFeaturedDiseaseCases(): Promise<FeaturedDiseaseCase[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("featured_disease_cases")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] getFeaturedDiseaseCases error:", error)
    return []
  }
  return (data ?? []) as FeaturedDiseaseCase[]
}

export async function getAllFeaturedDiseaseCases(): Promise<FeaturedDiseaseCase[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("featured_disease_cases")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] getAllFeaturedDiseaseCases error:", error)
    return []
  }
  return (data ?? []) as FeaturedDiseaseCase[]
}

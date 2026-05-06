import { createClient } from "@/lib/supabase/server"

export type ProductAdPlacement = "home" | "articles" | "consultation"

export type ProductAd = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link_url: string
  placement: ProductAdPlacement
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * 按位置获取产品广告。当该位置下启用的广告数量 > limit 时，会从中随机抽取，
 * 让访客每次访问看到不同的产品；当数量 <= limit 时按 display_order 升序展示全部。
 *
 * 注意：调用方页面已声明 `dynamic = "force-dynamic"`，每次请求都会重新随机。
 */
export async function getProductAdsByPlacement(placement: ProductAdPlacement, limit = 1): Promise<ProductAd[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("product_ads")
    .select("*")
    .eq("placement", placement)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] getProductAdsByPlacement error:", error)
    return []
  }

  const ads = (data ?? []) as ProductAd[]
  if (ads.length <= limit) return ads

  // Fisher-Yates 打乱后取前 limit 个
  const shuffled = [...ads]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, limit)
}

export async function getAllProductAds(): Promise<ProductAd[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("product_ads")
    .select("*")
    .order("placement", { ascending: true })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] getAllProductAds error:", error)
    return []
  }
  return (data ?? []) as ProductAd[]
}

export async function getProductAdById(id: string): Promise<ProductAd | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("product_ads").select("*").eq("id", id).single()
  if (error) {
    console.error("[v0] getProductAdById error:", error)
    return null
  }
  return data as ProductAd
}

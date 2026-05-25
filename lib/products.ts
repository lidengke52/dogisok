import { createClient } from "@/lib/supabase/server"

export type Product = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  /** 商品卖点列表（管理后台维护，前台依次展示，可为空数组） */
  features: string[]
  /** 商品图片 URL 列表（最多 7 张，第一张为主图）。image_url 与 images[0] 保持一致以兼容旧组件 */
  images: string[]
  order_index: number
  created_at: string
  updated_at: string
}

export type ProductClaim = {
  id: string
  user_id: string
  product_id: string
  claimed_at: string
  product?: Product
}

export async function getProducts(limit?: number): Promise<Product[]> {
  const supabase = await createClient()

  let query = supabase
    .from("products")
    .select("*")
    .order("order_index", { ascending: true })

  // 限制查询数量，默认最多 6 个产品（防止页面过长）
  if (limit !== undefined) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return (data as Product[]) || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return (data as Product) || null
}

export async function getUserProductClaim(userId: string): Promise<ProductClaim | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("product_claims")
    .select("*, products(*)")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // No record found, which is expected
      return null
    }
    console.error("Error fetching product claim:", error)
    return null
  }

  return (data as ProductClaim) || null
}

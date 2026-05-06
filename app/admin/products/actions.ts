"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/admin"

async function ensureAdmin() {
  const userClient = await createClient()
  const {
    data: { user },
  } = await userClient.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")
  return createAdminClient()
}

export type ProductFormState = { error?: string; success?: boolean }

function parsePayload(formData: FormData) {
  const name = String(formData.get("name") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const order_index = Number(formData.get("order_index") || 0)

  // 卖点列表：表单里多个同名 features 字段，按填写顺序去空
  const features = formData
    .getAll("features")
    .map((v) => String(v).trim())
    .filter(Boolean)

  // 图片列表：最多 7 张，第一张作为主图同步到 image_url 兼容字段
  const images = formData
    .getAll("images")
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, 7)

  if (!name) return { error: "商品名称必填" } as const
  if (Number.isNaN(order_index)) return { error: "显示顺序需为数字" } as const

  return {
    name,
    description: description || null,
    image_url: images[0] ?? null,
    images,
    features,
    order_index: Math.trunc(order_index),
  } as const
}

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const supabase = await ensureAdmin()
  const parsed = parsePayload(formData)
  if ("error" in parsed) return { error: parsed.error }

  const { error } = await supabase.from("products").insert(parsed)
  if (error) return { error: error.message }

  revalidatePath("/admin/products")
  redirect("/admin/products")
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const supabase = await ensureAdmin()
  const parsed = parsePayload(formData)
  if ("error" in parsed) return { error: parsed.error }

  const { error } = await supabase
    .from("products")
    .update({ ...parsed, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin/products")
  redirect("/admin/products")
}

export async function deleteProduct(id: string) {
  const supabase = await ensureAdmin()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
}

export async function deleteProductsBulk(ids: string[]) {
  if (!ids.length) throw new Error("No items selected")
  const supabase = await ensureAdmin()
  const { error } = await supabase.from("products").delete().in("id", ids)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
}

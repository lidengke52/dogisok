"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const PLACEMENTS = ["home", "articles", "consultation"] as const
type Placement = (typeof PLACEMENTS)[number]

async function assertAdmin() {
  const userClient = await createClient()
  const {
    data: { user },
  } = await userClient.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  const isAdmin = user.user_metadata?.is_admin === true || user.email === process.env.ADMIN_EMAIL
  if (!isAdmin) throw new Error("Not authorized")
  return createAdminClient()
}

function isValidPlacement(value: unknown): value is Placement {
  return typeof value === "string" && (PLACEMENTS as readonly string[]).includes(value)
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

function revalidateAll() {
  revalidatePath("/admin/product-ads")
  revalidatePath("/")
  revalidatePath("/articles")
  revalidatePath("/consultation")
}

export type AdFormState = { error?: string; success?: boolean }

function parsePayload(formData: FormData) {
  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const image_url = String(formData.get("image_url") || "").trim()
  const link_url = String(formData.get("link_url") || "").trim()
  const placement = String(formData.get("placement") || "")
  const display_order = Number.parseInt(String(formData.get("display_order") || "0"), 10) || 0
  const is_active = formData.get("is_active") === "on"

  if (!title) throw new Error("Title is required")
  if (!link_url || !isValidUrl(link_url)) throw new Error("A valid http(s) link URL is required")
  if (!isValidPlacement(placement)) throw new Error("Placement must be home, articles, or consultation")
  if (image_url && !isValidUrl(image_url)) throw new Error("Image URL must be a valid http(s) URL")

  return {
    title,
    description: description || null,
    image_url: image_url || null,
    link_url,
    placement,
    display_order,
    is_active,
  }
}

export async function createProductAd(_prev: AdFormState, formData: FormData): Promise<AdFormState> {
  try {
    const supabase = await assertAdmin()
    const payload = parsePayload(formData)
    const { error } = await supabase.from("product_ads").insert(payload)
    if (error) return { error: error.message }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }
  revalidateAll()
  redirect("/admin/product-ads")
}

export async function updateProductAd(
  id: string,
  _prev: AdFormState,
  formData: FormData,
): Promise<AdFormState> {
  try {
    const supabase = await assertAdmin()
    const payload = parsePayload(formData)
    const { error } = await supabase
      .from("product_ads")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
    if (error) return { error: error.message }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }
  revalidateAll()
  redirect("/admin/product-ads")
}

export async function deleteProductAd(id: string) {
  const supabase = await assertAdmin()
  await supabase.from("product_ads").delete().eq("id", id)
  revalidateAll()
}

export async function toggleProductAd(id: string, nextState: boolean) {
  const supabase = await assertAdmin()
  await supabase
    .from("product_ads")
    .update({ is_active: nextState, updated_at: new Date().toISOString() })
    .eq("id", id)
  revalidateAll()
}

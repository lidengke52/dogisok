"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  const isAdmin = user.user_metadata?.is_admin === true || user.email === process.env.ADMIN_EMAIL
  if (!isAdmin) throw new Error("Not authorized")
  return supabase
}

export type ArticleFormState = {
  error?: string
  success?: boolean
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120)
}

function parsePayload(formData: FormData) {
  const title = String(formData.get("title") || "").trim()
  const slugRaw = String(formData.get("slug") || "").trim()
  const excerpt = String(formData.get("excerpt") || "").trim() || null
  const content = String(formData.get("content") || "")
  const coverImage = String(formData.get("cover_image") || "").trim() || null
  const category = String(formData.get("category") || "").trim()
  const subcategory = String(formData.get("subcategory") || "").trim() || null
  const tagsRaw = String(formData.get("tags") || "").trim()
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []
  const author = String(formData.get("author") || "").trim() || "Editor"
  const readMinutes = Math.max(1, Number.parseInt(String(formData.get("read_minutes") || "5"), 10) || 5)
  const published = formData.get("published") === "on"
  // 关联到 /breeds/<slug>。"" / "none" 都视为"不关联"。
  const breedSlugRaw = String(formData.get("breed_slug") || "").trim()
  const breed_slug = breedSlugRaw && breedSlugRaw !== "none" ? breedSlugRaw : null

  if (!title) throw new Error("Title is required")
  if (!category) throw new Error("Category is required")

  const slug = slugRaw ? slugify(slugRaw) : slugify(title)

  return {
    title,
    slug,
    excerpt,
    content,
    cover_image: coverImage,
    category,
    subcategory,
    tags,
    author,
    read_minutes: readMinutes,
    published,
    breed_slug,
  }
}

export async function createArticle(_prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  try {
    const supabase = await assertAdmin()
    const payload = parsePayload(formData)

    const { error } = await supabase.from("articles").insert({
      ...payload,
      published_at: payload.published ? new Date().toISOString() : null,
    })
    if (error) return { error: error.message }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }

  revalidatePath("/admin/articles")
  revalidatePath("/articles")
  redirect("/admin/articles")
}

export async function updateArticle(id: string, _prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  try {
    const supabase = await assertAdmin()
    const payload = parsePayload(formData)

    // Determine if we need to bump published_at (first time publishing)
    const { data: existing } = await supabase
      .from("articles")
      .select("published, published_at")
      .eq("id", id)
      .single()

    const becamePublished = payload.published && !existing?.published
    const publishedAt = becamePublished
      ? new Date().toISOString()
      : existing?.published_at ?? (payload.published ? new Date().toISOString() : null)

    const { error } = await supabase
      .from("articles")
      .update({
        ...payload,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) return { error: error.message }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }

  revalidatePath("/admin/articles")
  revalidatePath("/articles")
  redirect("/admin/articles")
}

export async function togglePublished(id: string, nextState: boolean) {
  const supabase = await assertAdmin()
  await supabase
    .from("articles")
    .update({
      published: nextState,
      published_at: nextState ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
  revalidatePath("/admin/articles")
  revalidatePath("/articles")
}

export async function deleteArticle(id: string) {
  const supabase = await assertAdmin()
  await supabase.from("articles").delete().eq("id", id)
  revalidatePath("/admin/articles")
  revalidatePath("/articles")
}

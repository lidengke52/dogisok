"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/admin"

/**
 * 验证调用者是 admin（用 cookie client 读 session），
 * 然后返回 service-role admin client，所有写操作走它以绕过 RLS。
 */
async function assertAdmin() {
  const userClient = await createClient()
  const {
    data: { user },
  } = await userClient.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")
  return createAdminClient()
}

export type BreedFormState = {
  error?: string
  success?: boolean
}

const ALLOWED_GROUPS = ["Sporting", "Herding", "Working", "Toy", "Non-Sporting", "Terrier", "Hound"] as const
const ALLOWED_SIZES = ["Small", "Medium", "Large"] as const

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
}

/** 把 textarea 中"每行一条"切成数组，过滤空行 */
function linesToArray(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 1-5 间的整数 */
function clamp5(raw: FormDataEntryValue | null, fallback: number) {
  const n = Number.parseInt(String(raw ?? ""), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(1, Math.min(5, n))
}

function parsePayload(formData: FormData) {
  const name = String(formData.get("name") || "").trim()
  if (!name) throw new Error("品种名称不能为空")

  const slugRaw = String(formData.get("slug") || "").trim()
  const slug = slugRaw ? slugify(slugRaw) : slugify(name)
  if (!slug) throw new Error("Slug 不合法，请使用英文/数字")

  const groupRaw = String(formData.get("group_name") || "Non-Sporting")
  const group_name = (ALLOWED_GROUPS as readonly string[]).includes(groupRaw) ? groupRaw : "Non-Sporting"

  const sizeRaw = String(formData.get("size") || "Medium")
  const size = (ALLOWED_SIZES as readonly string[]).includes(sizeRaw) ? sizeRaw : "Medium"

  const display_order = Number.parseInt(String(formData.get("display_order") || "0"), 10) || 0

  return {
    slug,
    name,
    cn_name: String(formData.get("cn_name") || "").trim() || null,
    group_name,
    origin: String(formData.get("origin") || "").trim() || null,
    size,
    lifespan: String(formData.get("lifespan") || "").trim() || null,
    weight: String(formData.get("weight") || "").trim() || null,
    height: String(formData.get("height") || "").trim() || null,
    temperament: linesToArray(String(formData.get("temperament") || "")),
    good_with_kids: formData.get("good_with_kids") === "on",
    trainability: clamp5(formData.get("trainability"), 3),
    shedding: clamp5(formData.get("shedding"), 3),
    exercise: clamp5(formData.get("exercise"), 3),
    image: String(formData.get("image") || "").trim() || null,
    summary: String(formData.get("summary") || "").trim() || null,
    care_notes: linesToArray(String(formData.get("care_notes") || "")),
    common_health: linesToArray(String(formData.get("common_health") || "")),
    is_published: formData.get("is_published") === "on",
    display_order,
  }
}

export async function createBreed(_prev: BreedFormState, formData: FormData): Promise<BreedFormState> {
  try {
    const supabase = await assertAdmin()
    const payload = parsePayload(formData)

    const { error } = await supabase.from("breeds").insert(payload)
    if (error) return { error: error.message }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "未知错误" }
  }

  revalidatePath("/admin/breeds")
  revalidatePath("/breeds")
  redirect("/admin/breeds")
}

export async function updateBreed(
  slug: string,
  _prev: BreedFormState,
  formData: FormData,
): Promise<BreedFormState> {
  try {
    const supabase = await assertAdmin()
    const payload = parsePayload(formData)

    // 如果用户改了 slug，需要做联动：articles.breed_slug 也得更新（FK on delete set null 不会级联 update）
    const newSlug = payload.slug
    if (newSlug !== slug) {
      // 1) 先插入新 slug 记录（先复制再删旧的会触发外键）—— 简化做法：直接更新 slug
      // Supabase 没法在同一句更新主键并联动 FK；这里改为：先把 articles 里指向旧 slug 的临时置为 null，
      // 再 update breeds.slug，最后再把 articles 的指向恢复为新 slug。
      const { data: linkedArticles } = await supabase
        .from("articles")
        .select("id")
        .eq("breed_slug", slug)

      if (linkedArticles && linkedArticles.length > 0) {
        const ids = linkedArticles.map((a) => a.id)
        const { error: clearErr } = await supabase.from("articles").update({ breed_slug: null }).in("id", ids)
        if (clearErr) return { error: clearErr.message }

        const { error: updErr } = await supabase.from("breeds").update(payload).eq("slug", slug)
        if (updErr) return { error: updErr.message }

        const { error: relinkErr } = await supabase.from("articles").update({ breed_slug: newSlug }).in("id", ids)
        if (relinkErr) return { error: relinkErr.message }
      } else {
        const { error } = await supabase.from("breeds").update(payload).eq("slug", slug)
        if (error) return { error: error.message }
      }
    } else {
      const { error } = await supabase
        .from("breeds")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("slug", slug)
      if (error) return { error: error.message }
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "未知错误" }
  }

  revalidatePath("/admin/breeds")
  revalidatePath("/breeds")
  revalidatePath(`/breeds/${slug}`)
  redirect("/admin/breeds")
}

export async function deleteBreed(slug: string) {
  const supabase = await assertAdmin()
  const { error } = await supabase.from("breeds").delete().eq("slug", slug)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/breeds")
  revalidatePath("/breeds")
}

export async function deleteBreedsBulk(slugs: string[]) {
  if (!slugs.length) throw new Error("No items selected")
  const supabase = await assertAdmin()
  const { error } = await supabase.from("breeds").delete().in("slug", slugs)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/breeds")
  revalidatePath("/breeds")
}

export async function toggleBreedPublished(slug: string, current: boolean) {
  const supabase = await assertAdmin()
  const { error } = await supabase
    .from("breeds")
    .update({ is_published: !current, updated_at: new Date().toISOString() })
    .eq("slug", slug)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/breeds")
  revalidatePath("/breeds")
}

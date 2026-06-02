import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/site-url"

export type SiteSettings = {
  site_title: string
  site_description: string
  site_keywords: string
  og_image: string
  ga_measurement_id: string
  robots_index: string
  canonical_url: string
}

const DEFAULTS: SiteSettings = {
  site_title: "Dog is OK — Professional Dog Care Knowledge for Global Pet Owners",
  site_description:
    "Health, Behavior, Nutrition & more — everything you need to know. Plus Dr. Max for instant guidance, trusted by dog parents worldwide.",
  site_keywords: "dog care, dog health, dog nutrition, dog behavior, veterinarian advice, pet care",
  og_image: "",
  ga_measurement_id: "",
  robots_index: "true",
  canonical_url: SITE_URL,
}

/** 公开读取（用于 layout 动态注入，使用 anon 客户端） */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("site_settings").select("key, value")
    if (error || !data) return DEFAULTS

    const map = Object.fromEntries(data.map((row: { key: string; value: string }) => [row.key, row.value]))
    return {
      site_title: map.site_title || DEFAULTS.site_title,
      site_description: map.site_description || DEFAULTS.site_description,
      site_keywords: map.site_keywords || DEFAULTS.site_keywords,
      og_image: map.og_image ?? DEFAULTS.og_image,
      ga_measurement_id: map.ga_measurement_id ?? DEFAULTS.ga_measurement_id,
      robots_index: map.robots_index ?? DEFAULTS.robots_index,
      canonical_url: map.canonical_url || DEFAULTS.canonical_url,
    }
  } catch {
    return DEFAULTS
  }
}

/** 管理员写入（绕过 RLS，使用 service_role 客户端） */
export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<{ error?: string }> {
  try {
    const adminClient = createAdminClient()
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value ?? "",
      updated_at: new Date().toISOString(),
    }))

    const { error } = await adminClient
      .from("site_settings")
      .upsert(rows, { onConflict: "key" })

    if (error) return { error: error.message }
    return {}
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Unknown error" }
  }
}

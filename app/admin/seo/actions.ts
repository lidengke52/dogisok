"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { saveSiteSettings, type SiteSettings } from "@/lib/site-settings"

export async function saveSeoSettings(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")
  if (!(await isAdmin(user.id))) return { error: "无权限" }

  const settings: Partial<SiteSettings> = {
    site_title: (formData.get("site_title") as string) ?? "",
    site_description: (formData.get("site_description") as string) ?? "",
    site_keywords: (formData.get("site_keywords") as string) ?? "",
    og_image: (formData.get("og_image") as string) ?? "",
    ga_measurement_id: (formData.get("ga_measurement_id") as string) ?? "",
    robots_index: formData.get("robots_index") === "true" ? "true" : "false",
    canonical_url: (formData.get("canonical_url") as string) ?? "",
  }

  const result = await saveSiteSettings(settings)
  if (result.error) return { error: result.error }

  revalidatePath("/", "layout")
  revalidatePath("/admin/seo")
  return { success: true }
}

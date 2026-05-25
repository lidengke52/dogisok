"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { createApiKey, revokeApiKey, deleteApiKey } from "@/lib/api-keys"

async function guardAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) throw new Error("Unauthorized")
}

export async function actionCreateApiKey(formData: FormData) {
  await guardAdmin()
  const name = (formData.get("name") as string)?.trim()
  const originsRaw = (formData.get("allowed_origins") as string)?.trim()
  if (!name) throw new Error("Name is required")
  const origins = originsRaw
    ? originsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []
  const rawKey = await createApiKey(name, origins)
  revalidatePath("/admin/seo")
  return { rawKey }
}

export async function actionRevokeApiKey(id: string) {
  await guardAdmin()
  await revokeApiKey(id)
  revalidatePath("/admin/seo")
}

export async function actionDeleteApiKey(id: string) {
  await guardAdmin()
  await deleteApiKey(id)
  revalidatePath("/admin/seo")
}

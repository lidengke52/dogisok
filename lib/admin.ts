import { createClient } from "@/lib/supabase/server"

/**
 * Returns true if the given user id belongs to an admin.
 * Source of truth (in priority order):
 *   1. user.email === "admin@dogisok.net" (超级管理员)
 *   2. user.user_metadata.is_admin === true
 *   3. profiles.is_admin === true (普通管理员)
 *   4. user.email === process.env.ADMIN_EMAIL (环境变量配置)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only authorize when the resolved session matches the requested user id.
  if (!user || user.id !== userId) return false

  // 超级管理员（硬编码）
  if (user.email === "admin@dogisok.net") return true

  // Supabase Auth metadata
  if (user.user_metadata?.is_admin === true) return true

  // 从 profiles 表查询 is_admin 字段
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("email", user.email)
    .single()

  if (profile?.is_admin === true) return true

  // 环境变量配置
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email && user.email.toLowerCase() === adminEmail.toLowerCase()) {
    return true
  }

  return false
}

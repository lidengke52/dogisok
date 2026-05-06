import { createClient } from "@/lib/supabase/server"

/**
 * Returns true if the given user id belongs to an admin.
 * Source of truth (in priority order):
 *   1. user.user_metadata.is_admin === true
 *   2. user.email === process.env.ADMIN_EMAIL
 *
 * Mirrors the inline check used in /app/admin/articles/actions.ts so the
 * whole admin area shares one consistent authorization rule.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only authorize when the resolved session matches the requested user id.
  if (!user || user.id !== userId) return false

  if (user.user_metadata?.is_admin === true) return true
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email && user.email.toLowerCase() === adminEmail.toLowerCase()) {
    return true
  }
  return false
}

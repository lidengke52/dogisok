import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { AdminShell } from "@/components/admin/admin-shell"

export const dynamic = "force-dynamic"

/**
 * Layout shared by all /admin pages.
 *
 * Auth flow:
 * - If the user is not signed in or not an admin, we render children unwrapped
 *   so /admin/login can show its own form. Protected pages handle their own
 *   redirect via existing helpers (ensureAdmin / isAdmin).
 * - If the user is an authenticated admin, wrap children in the AdminShell so
 *   every page gets the sidebar + topbar.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const adminOk = user ? await isAdmin(user.id) : false

  if (!adminOk || !user) {
    return <>{children}</>
  }

  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>
}

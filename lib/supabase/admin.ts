import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client. Bypasses RLS.
 *
 * NEVER expose this client to the browser, and NEVER export it from a module
 * imported by client components. Only call from server actions / route
 * handlers / server components after verifying the caller is an admin.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error("Missing SUPABASE_URL")
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

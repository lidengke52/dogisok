import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = "dik_" + crypto.randomBytes(32).toString("hex")
  const hash = crypto.createHash("sha256").update(raw).digest("hex")
  const prefix = raw.slice(0, 12)
  return { raw, hash, prefix }
}

export function hashApiKey(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex")
}

export async function verifyApiKey(raw: string): Promise<boolean> {
  const hash = hashApiKey(raw)
  const supabase = createAdminClient()

  const { data } = await supabase
    .from("api_keys")
    .select("id, is_active")
    .eq("key_hash", hash)
    .single()

  if (!data || !data.is_active) return false

  // 异步更新最后使用时间，不阻塞响应
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
    .then(() => {})

  return true
}

export async function listApiKeys() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, allowed_origins, is_active, last_used_at, created_at")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createApiKey(name: string, allowedOrigins: string[]) {
  const supabase = createAdminClient()
  const { raw, hash, prefix } = generateApiKey()
  const { error } = await supabase.from("api_keys").insert({
    name,
    key_hash: hash,
    key_prefix: prefix,
    allowed_origins: allowedOrigins,
  })
  if (error) throw error
  return raw // 只返回一次明文，之后不可再查
}

export async function revokeApiKey(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("api_keys")
    .update({ is_active: false })
    .eq("id", id)
  if (error) throw error
}

export async function deleteApiKey(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("api_keys").delete().eq("id", id)
  if (error) throw error
}

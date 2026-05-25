"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export type ShippingAddressState = {
  error?: string
  success?: boolean
}

export async function saveShippingAddress(
  _prev: ShippingAddressState,
  formData: FormData,
): Promise<ShippingAddressState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const recipient_name = String(formData.get("recipient_name") || "").trim()
  const phone = String(formData.get("phone") || "").trim()
  const postal_code = String(formData.get("postal_code") || "").trim()
  const street_address = String(formData.get("street_address") || "").trim()
  const city = String(formData.get("city") || "").trim()
  const state = String(formData.get("state") || "").trim()
  const country = String(formData.get("country") || "").trim()

  if (!recipient_name) return { error: "Recipient name is required" }
  if (!phone) return { error: "Phone number is required" }
  if (!street_address) return { error: "Street address is required" }
  if (!city) return { error: "City is required" }
  if (!country) return { error: "Country is required" }

  const { error } = await supabase
    .from("profiles")
    .update({
      recipient_name,
      phone,
      postal_code: postal_code || null,
      street_address,
      city,
      state: state || null,
      country,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/account")
  return { success: true }
}

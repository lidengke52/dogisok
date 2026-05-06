"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  const isAdmin = user.user_metadata?.is_admin === true || user.email === process.env.ADMIN_EMAIL
  if (!isAdmin) throw new Error("Not authorized")
  return supabase
}

export type FeaturedCaseFormState = {
  error?: string
  success?: boolean
  importedCount?: number
}

function parsePayload(formData: FormData) {
  const dogBreed = String(formData.get("dog_breed") || "").trim()
  const dogAge = String(formData.get("dog_age") || "").trim()
  const symptom = String(formData.get("symptom") || "").trim()
  const aiAnswer = String(formData.get("ai_answer") || "").trim()
  const displayOrder = Number.parseInt(String(formData.get("display_order") || "0"), 10) || 0
  const isActive = formData.get("is_active") === "on"

  if (!dogBreed) throw new Error("Dog breed is required")
  if (!dogAge) throw new Error("Dog age is required")
  if (!symptom) throw new Error("Symptom is required")
  if (!aiAnswer) throw new Error("AI answer is required")

  return {
    dog_breed: dogBreed,
    dog_age: dogAge,
    symptom,
    ai_answer: aiAnswer,
    display_order: displayOrder,
    is_active: isActive,
  }
}

export async function createFeaturedCase(
  _prev: FeaturedCaseFormState,
  formData: FormData,
): Promise<FeaturedCaseFormState> {
  try {
    const supabase = await assertAdmin()
    const payload = parsePayload(formData)
    const { error } = await supabase.from("featured_cases").insert(payload)
    if (error) return { error: error.message }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }

  revalidatePath("/admin/featured-cases")
  revalidatePath("/consultation")
  redirect("/admin/featured-cases")
}

export async function updateFeaturedCase(
  id: string,
  _prev: FeaturedCaseFormState,
  formData: FormData,
): Promise<FeaturedCaseFormState> {
  try {
    const supabase = await assertAdmin()
    const payload = parsePayload(formData)
    const { error } = await supabase
      .from("featured_cases")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
    if (error) return { error: error.message }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }

  revalidatePath("/admin/featured-cases")
  revalidatePath("/consultation")
  redirect("/admin/featured-cases")
}

export async function toggleFeaturedCaseActive(id: string, nextState: boolean) {
  const supabase = await assertAdmin()
  await supabase
    .from("featured_cases")
    .update({ is_active: nextState, updated_at: new Date().toISOString() })
    .eq("id", id)
  revalidatePath("/admin/featured-cases")
  revalidatePath("/consultation")
}

export async function deleteFeaturedCase(id: string) {
  const supabase = await assertAdmin()
  await supabase.from("featured_cases").delete().eq("id", id)
  revalidatePath("/admin/featured-cases")
  revalidatePath("/consultation")
}

export async function updateDisplayOrder(id: string, newOrder: number) {
  const supabase = await assertAdmin()
  await supabase
    .from("featured_cases")
    .update({ display_order: newOrder, updated_at: new Date().toISOString() })
    .eq("id", id)
  revalidatePath("/admin/featured-cases")
  revalidatePath("/consultation")
}

// Parse a CSV row, handling quoted fields properly
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i += 2
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false
        i++
      } else {
        current += char
        i++
      }
    } else {
      if (char === '"') {
        inQuotes = true
        i++
      } else if (char === ",") {
        result.push(current)
        current = ""
        i++
      } else {
        current += char
        i++
      }
    }
  }
  result.push(current)
  return result
}

export async function bulkImportCases(
  _prev: FeaturedCaseFormState,
  formData: FormData,
): Promise<FeaturedCaseFormState> {
  try {
    const supabase = await assertAdmin()
    const csvText = String(formData.get("csv_text") || "").trim()
    if (!csvText) {
      return { error: "Please paste CSV content first" }
    }

    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0)
    if (lines.length < 2) {
      return { error: "CSV must contain a header row and at least one data row" }
    }

    // Parse header
    const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
    const requiredHeaders = ["dog_breed", "dog_age", "symptom", "ai_answer"]
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
    if (missingHeaders.length > 0) {
      return { error: `Missing required columns: ${missingHeaders.join(", ")}` }
    }

    const breedIdx = headers.indexOf("dog_breed")
    const ageIdx = headers.indexOf("dog_age")
    const symptomIdx = headers.indexOf("symptom")
    const answerIdx = headers.indexOf("ai_answer")
    const orderIdx = headers.indexOf("display_order")

    const rows: Array<{
      dog_breed: string
      dog_age: string
      symptom: string
      ai_answer: string
      display_order: number
      is_active: boolean
    }> = []

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i])
      const breed = (cols[breedIdx] || "").trim()
      const age = (cols[ageIdx] || "").trim()
      const symptom = (cols[symptomIdx] || "").trim()
      const answer = (cols[answerIdx] || "").trim()
      if (!breed || !age || !symptom || !answer) continue

      rows.push({
        dog_breed: breed,
        dog_age: age,
        symptom,
        ai_answer: answer,
        display_order: orderIdx >= 0 ? Number.parseInt(cols[orderIdx] || "0", 10) || 0 : 0,
        is_active: true,
      })
    }

    if (rows.length === 0) {
      return { error: "No valid rows found in CSV" }
    }

    const { error } = await supabase.from("featured_cases").insert(rows)
    if (error) return { error: error.message }

    revalidatePath("/admin/featured-cases")
    revalidatePath("/consultation")

    return { success: true, importedCount: rows.length }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }
}

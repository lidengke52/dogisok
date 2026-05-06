"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/admin"

async function ensureAdmin() {
  const userClient = await createClient()
  const {
    data: { user },
  } = await userClient.auth.getUser()
  if (!user) redirect("/admin/login")
  const ok = await isAdmin(user.id)
  if (!ok) redirect("/")
  return createAdminClient()
}

export type DiseaseCaseFormState = {
  ok: boolean
  message?: string
} | null

export async function createDiseaseCase(_prev: DiseaseCaseFormState, formData: FormData): Promise<DiseaseCaseFormState> {
  const supabase = await ensureAdmin()

  const dog_breed = String(formData.get("dog_breed") ?? "").trim()
  const dog_age = String(formData.get("dog_age") ?? "").trim()
  const symptom = String(formData.get("symptom") ?? "").trim()
  const self_check_content = String(formData.get("self_check_content") ?? "").trim()
  const display_order = Number(formData.get("display_order") ?? 0)
  const is_active = formData.get("is_active") === "on" || formData.get("is_active") === "true"

  if (!dog_breed || !dog_age || !symptom || !self_check_content) {
    return { ok: false, message: "All fields are required." }
  }

  const { error } = await supabase.from("featured_disease_cases").insert({
    dog_breed,
    dog_age,
    symptom,
    self_check_content,
    display_order: Number.isFinite(display_order) ? display_order : 0,
    is_active,
  })

  if (error) {
    console.error("[v0] createDiseaseCase error:", error)
    return { ok: false, message: error.message }
  }

  revalidatePath("/admin/featured-disease-cases")
  revalidatePath("/disease-check")
  redirect("/admin/featured-disease-cases")
}

export async function updateDiseaseCase(
  id: string,
  _prev: DiseaseCaseFormState,
  formData: FormData,
): Promise<DiseaseCaseFormState> {
  const supabase = await ensureAdmin()

  const dog_breed = String(formData.get("dog_breed") ?? "").trim()
  const dog_age = String(formData.get("dog_age") ?? "").trim()
  const symptom = String(formData.get("symptom") ?? "").trim()
  const self_check_content = String(formData.get("self_check_content") ?? "").trim()
  const display_order = Number(formData.get("display_order") ?? 0)
  const is_active = formData.get("is_active") === "on" || formData.get("is_active") === "true"

  if (!dog_breed || !dog_age || !symptom || !self_check_content) {
    return { ok: false, message: "All fields are required." }
  }

  const { error } = await supabase
    .from("featured_disease_cases")
    .update({
      dog_breed,
      dog_age,
      symptom,
      self_check_content,
      display_order: Number.isFinite(display_order) ? display_order : 0,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("[v0] updateDiseaseCase error:", error)
    return { ok: false, message: error.message }
  }

  revalidatePath("/admin/featured-disease-cases")
  revalidatePath("/disease-check")
  redirect("/admin/featured-disease-cases")
}

export async function deleteDiseaseCase(id: string) {
  const supabase = await ensureAdmin()
  const { error } = await supabase.from("featured_disease_cases").delete().eq("id", id)
  if (error) {
    console.error("[v0] deleteDiseaseCase error:", error)
    return { ok: false, message: error.message }
  }
  revalidatePath("/admin/featured-disease-cases")
  revalidatePath("/disease-check")
  return { ok: true }
}

export async function toggleDiseaseCaseActive(id: string, next: boolean) {
  const supabase = await ensureAdmin()
  const { error } = await supabase
    .from("featured_disease_cases")
    .update({ is_active: next, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) {
    console.error("[v0] toggleDiseaseCaseActive error:", error)
    return { ok: false, message: error.message }
  }
  revalidatePath("/admin/featured-disease-cases")
  revalidatePath("/disease-check")
  return { ok: true }
}

export async function moveDiseaseCase(id: string, direction: "up" | "down") {
  const supabase = await ensureAdmin()

  const { data: all, error: listErr } = await supabase
    .from("featured_disease_cases")
    .select("id, display_order")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (listErr || !all) {
    return { ok: false, message: listErr?.message ?? "Failed to load list." }
  }

  const idx = all.findIndex((r) => r.id === id)
  if (idx === -1) return { ok: false, message: "Case not found." }

  const targetIdx = direction === "up" ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= all.length) {
    return { ok: true }
  }

  const a = all[idx]
  const b = all[targetIdx]

  const { error: e1 } = await supabase
    .from("featured_disease_cases")
    .update({ display_order: b.display_order })
    .eq("id", a.id)
  const { error: e2 } = await supabase
    .from("featured_disease_cases")
    .update({ display_order: a.display_order })
    .eq("id", b.id)

  if (e1 || e2) {
    return { ok: false, message: e1?.message ?? e2?.message }
  }

  revalidatePath("/admin/featured-disease-cases")
  revalidatePath("/disease-check")
  return { ok: true }
}

type ParsedRow = {
  dog_breed: string
  dog_age: string
  symptom: string
  self_check_content: string
  display_order: number
  is_active: boolean
}

function parseCSV(text: string): { rows: ParsedRow[]; errors: string[] } {
  const errors: string[] = []
  const rows: ParsedRow[] = []

  const lines: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
        current += ch
      }
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++
      if (current.length > 0) lines.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  if (current.length > 0) lines.push(current)

  if (lines.length === 0) {
    return { rows, errors: ["CSV is empty."] }
  }

  function parseLine(line: string): string[] {
    const cells: string[] = []
    let cell = ""
    let q = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          q = !q
        }
      } else if (ch === "," && !q) {
        cells.push(cell)
        cell = ""
      } else {
        cell += ch
      }
    }
    cells.push(cell)
    return cells.map((c) => c.trim())
  }

  const header = parseLine(lines[0]).map((h) => h.toLowerCase())
  const required = ["dog_breed", "dog_age", "symptom", "self_check_content"]
  for (const r of required) {
    if (!header.includes(r)) {
      errors.push(`Missing required column: ${r}`)
    }
  }
  if (errors.length > 0) return { rows, errors }

  const idx = {
    dog_breed: header.indexOf("dog_breed"),
    dog_age: header.indexOf("dog_age"),
    symptom: header.indexOf("symptom"),
    self_check_content: header.indexOf("self_check_content"),
    display_order: header.indexOf("display_order"),
    is_active: header.indexOf("is_active"),
  }

  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i])
    const dog_breed = cells[idx.dog_breed] ?? ""
    const dog_age = cells[idx.dog_age] ?? ""
    const symptom = cells[idx.symptom] ?? ""
    const self_check_content = cells[idx.self_check_content] ?? ""
    if (!dog_breed || !dog_age || !symptom || !self_check_content) {
      errors.push(`Row ${i + 1}: missing required value`)
      continue
    }
    const display_order =
      idx.display_order >= 0 && cells[idx.display_order] ? Number(cells[idx.display_order]) || 0 : 0
    const is_active_raw = idx.is_active >= 0 ? (cells[idx.is_active] ?? "").toLowerCase() : "true"
    const is_active = is_active_raw === "" || is_active_raw === "true" || is_active_raw === "1" || is_active_raw === "yes"
    rows.push({ dog_breed, dog_age, symptom, self_check_content, display_order, is_active })
  }
  return { rows, errors }
}

export async function bulkImportDiseaseCases(
  _prev: { ok: boolean; message?: string; inserted?: number; errors?: string[] } | null,
  formData: FormData,
) {
  const supabase = await ensureAdmin()

  const file = formData.get("file") as File | null
  const pastedText = String(formData.get("pasted") ?? "").trim()

  let csvText = ""
  if (file && file.size > 0) {
    csvText = await file.text()
  } else if (pastedText) {
    csvText = pastedText
  } else {
    return { ok: false, message: "Please upload a CSV file or paste CSV content." }
  }

  const { rows, errors } = parseCSV(csvText)
  if (rows.length === 0) {
    return { ok: false, message: "No valid rows to import.", errors }
  }

  const { error } = await supabase.from("featured_disease_cases").insert(rows)
  if (error) {
    console.error("[v0] bulkImportDiseaseCases error:", error)
    return { ok: false, message: error.message, errors }
  }

  revalidatePath("/admin/featured-disease-cases")
  revalidatePath("/disease-check")
  return { ok: true, inserted: rows.length, errors }
}

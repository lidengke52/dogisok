"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/admin"

/**
 * Verifies the caller is an admin via their auth session, then returns a
 * service-role client so writes bypass RLS. Reading the session uses the
 * user-cookies client, but mutations use the admin client.
 */
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

export type MedicationFormState = {
  ok: boolean
  message?: string
} | null

const ALLOWED_CATEGORIES = ["normal", "caution", "forbidden"] as const

function parseFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const indications = String(formData.get("indications") ?? "").trim()
  const applicable_pets = String(formData.get("applicable_pets") ?? "").trim()
  const usage_method = String(formData.get("usage_method") ?? "").trim()
  const dosage = String(formData.get("dosage") ?? "").trim()
  const precautions = String(formData.get("precautions") ?? "").trim()
  const categoryRaw = String(formData.get("category") ?? "normal").trim()
  const category = (ALLOWED_CATEGORIES as readonly string[]).includes(categoryRaw) ? categoryRaw : "normal"
  const is_active = formData.get("is_active") !== null

  return { name, indications, applicable_pets, usage_method, dosage, precautions, category, is_active }
}

function validate(fields: ReturnType<typeof parseFields>): string | null {
  if (!fields.name) return "Medication name is required."
  if (!fields.indications) return "Indications are required."
  if (!fields.applicable_pets) return "Applicable pets are required."
  if (!fields.usage_method) return "Usage is required."
  if (!fields.dosage) return "Dosage is required."
  if (!fields.precautions) return "Precautions are required."
  return null
}

export async function createMedication(_prev: MedicationFormState, formData: FormData): Promise<MedicationFormState> {
  const supabase = await ensureAdmin()
  const fields = parseFields(formData)
  const err = validate(fields)
  if (err) return { ok: false, message: err }

  const { error } = await supabase.from("medications").insert(fields)
  if (error) return { ok: false, message: error.message }

  revalidatePath("/admin/medications")
  revalidatePath("/medication-check")
  redirect("/admin/medications")
}

export async function updateMedication(
  id: string,
  _prev: MedicationFormState,
  formData: FormData,
): Promise<MedicationFormState> {
  const supabase = await ensureAdmin()
  const fields = parseFields(formData)
  const err = validate(fields)
  if (err) return { ok: false, message: err }

  const { error } = await supabase
    .from("medications")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { ok: false, message: error.message }

  revalidatePath("/admin/medications")
  revalidatePath("/medication-check")
  redirect("/admin/medications")
}

export async function deleteMedication(id: string) {
  const supabase = await ensureAdmin()
  const { error } = await supabase.from("medications").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/medications")
  revalidatePath("/medication-check")
}

export async function deleteMedicationsBulk(ids: string[]) {
  if (!ids.length) throw new Error("No items selected")
  const supabase = await ensureAdmin()
  const { error } = await supabase.from("medications").delete().in("id", ids)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/medications")
  revalidatePath("/medication-check")
}

export async function toggleMedicationActive(id: string, currentValue: boolean) {
  const supabase = await ensureAdmin()
  const { error } = await supabase
    .from("medications")
    .update({ is_active: !currentValue, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/medications")
  revalidatePath("/medication-check")
}

// Bulk Import (CSV + XLSX) --------------------------------------------------

export type BulkImportState = {
  ok: boolean
  message?: string
  imported?: number
  errors?: string[]
} | null

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let current: string[] = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else {
      if (c === '"') {
        inQuotes = true
      } else if (c === ",") {
        current.push(field)
        field = ""
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++
        current.push(field)
        rows.push(current)
        current = []
        field = ""
      } else {
        field += c
      }
    }
  }
  if (field.length > 0 || current.length > 0) {
    current.push(field)
    rows.push(current)
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0))
}

async function parseXlsx(file: File): Promise<string[][]> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: "array" })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) return []
  const sheet = wb.Sheets[sheetName]
  const json = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false, blankrows: false })
  return json.map((row) => row.map((cell) => String(cell ?? "").trim()))
}

// Header alias map: normalized header (lower-case, trimmed, full-width punctuation removed) → canonical key
const HEADER_ALIASES: Record<string, string> = {
  // English
  name: "name",
  indications: "indications",
  applicable_pets: "applicable_pets",
  "applicable pets": "applicable_pets",
  usage_method: "usage_method",
  usage: "usage_method",
  dosage: "dosage",
  precautions: "precautions",
  category: "category",
  is_active: "is_active",
  active: "is_active",
  // Chinese
  药品名称: "name",
  药物名称: "name",
  名称: "name",
  主治功能: "indications",
  功能主治: "indications",
  适应症: "indications",
  适用宠物: "applicable_pets",
  适用动物: "applicable_pets",
  用法: "usage_method",
  使用方法: "usage_method",
  用量: "dosage",
  "用量(按体重建议)": "dosage",
  剂量: "dosage",
  使用注意事项: "precautions",
  注意事项: "precautions",
  属性: "category",
  分类: "category",
  类别: "category",
  启用: "is_active",
  是否启用: "is_active",
}

// Headers we explicitly ignore (e.g. row index columns)
const HEADER_IGNORE = new Set(["序号", "no", "no.", "#", "id"])

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/[（）]/g, (c) => (c === "（" ? "(" : ")"))
    .replace(/\s+/g, " ")
}

function mapCategory(raw: string): (typeof ALLOWED_CATEGORIES)[number] {
  const v = raw.trim().toLowerCase()
  if (!v) return "normal"
  if ((ALLOWED_CATEGORIES as readonly string[]).includes(v)) return v as (typeof ALLOWED_CATEGORIES)[number]
  // Chinese mappings
  if (/(禁用|forbidden|prohibited|禁忌)/.test(raw)) return "forbidden"
  if (/(慎用|caution|警告|警示)/.test(raw)) return "caution"
  if (/(常规|普通|可用|normal|allowed)/.test(raw)) return "normal"
  return "normal"
}

function mapIsActive(raw: string): boolean {
  const v = raw.trim().toLowerCase()
  if (v === "") return true
  if (["false", "0", "no", "否", "停用", "禁用"].includes(v)) return false
  return true
}

export async function bulkImportMedications(_prev: BulkImportState, formData: FormData): Promise<BulkImportState> {
  const supabase = await ensureAdmin()

  const file = formData.get("file") as File | null
  const pasted = String(formData.get("pasted") ?? "").trim()

  let rows: string[][] = []

  if (file && typeof file !== "string" && file.size > 0) {
    const lower = file.name.toLowerCase()
    const isXlsx =
      lower.endsWith(".xlsx") ||
      lower.endsWith(".xls") ||
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"

    if (isXlsx) {
      rows = await parseXlsx(file)
    } else {
      const text = await file.text()
      rows = parseCsv(text.trim())
    }
  } else if (pasted) {
    rows = parseCsv(pasted)
  } else {
    return { ok: false, message: "Please upload a file (CSV or Excel) or paste CSV content." }
  }

  if (rows.length < 2) return { ok: false, message: "File must include a header row and at least one data row." }

  const rawHeader = rows[0]
  const headerKeys: (string | null)[] = rawHeader.map((h) => {
    const norm = normalizeHeader(h)
    if (HEADER_IGNORE.has(norm)) return null
    return HEADER_ALIASES[norm] ?? null
  })

  const required = ["name", "indications", "applicable_pets", "usage_method", "dosage", "precautions"]
  const present = new Set(headerKeys.filter((k): k is string => k !== null))
  const missing = required.filter((r) => !present.has(r))
  if (missing.length) {
    return {
      ok: false,
      message: `Missing required columns: ${missing.join(", ")}. Recognized headers (English or Chinese): ${Object.keys(
        HEADER_ALIASES,
      ).join(", ")}.`,
    }
  }

  const idxOf = (key: string) => headerKeys.indexOf(key)
  const records: Array<Record<string, unknown>> = []
  const errors: string[] = []

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const get = (key: string) => {
      const i = idxOf(key)
      return i >= 0 ? (row[i] ?? "").trim() : ""
    }
    const name = get("name")
    if (!name) continue // skip totally blank rows silently

    const indications = get("indications")
    const applicable_pets = get("applicable_pets")
    const usage_method = get("usage_method")
    const dosage = get("dosage")
    const precautions = get("precautions")
    const category = mapCategory(get("category"))
    const is_active = mapIsActive(get("is_active"))

    if (!indications || !applicable_pets || !usage_method || !dosage || !precautions) {
      errors.push(`Row ${r + 1} (${name}): missing required field`)
      continue
    }
    records.push({ name, indications, applicable_pets, usage_method, dosage, precautions, category, is_active })
  }

  if (records.length === 0) {
    return { ok: false, message: "No valid rows found.", errors }
  }

  const { error } = await supabase.from("medications").insert(records)
  if (error) return { ok: false, message: error.message, errors }

  revalidatePath("/admin/medications")
  revalidatePath("/medication-check")
  return { ok: true, imported: records.length, errors: errors.length ? errors : undefined }
}

"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import {
  AlertCircle,
  ChevronRight,
  ImagePlus,
  Info,
  Loader2,
  MessageSquareHeart,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Symptom area → sub-options. Keep top-level keys stable; they are sent to the server.
const SYMPTOM_MAP: Array<{ area: string; subs: string[] }> = [
  { area: "Head & senses", subs: ["Ears", "Mouth", "Eyes", "Nose"] },
  { area: "Neurological", subs: ["Seizures", "Tremors", "Temperature changes", "Mental state"] },
  { area: "Gastrointestinal", subs: ["Vomiting", "Stool changes", "Appetite & energy"] },
  { area: "Urinary", subs: ["Urine changes", "Urination behavior", "Mental state"] },
  { area: "Skin", subs: ["Skin lesions", "External parasites", "Itching", "Body odor"] },
  { area: "Respiratory", subs: ["Sneezing", "Coughing", "Wheezing", "Mental state"] },
  { area: "Limbs & bones", subs: ["Limb abnormalities"] },
  { area: "Chest & abdomen", subs: ["Abdominal signs", "Mental state"] },
  { area: "Reproductive", subs: ["Male genitalia", "Female genitalia", "Anal abnormalities"] },
]

type Attachment = { pathname: string; name: string; previewUrl: string }

type FormState = {
  breed: string
  petName: string
  neutered: "spayed" | "intact" | ""
  birthday: string
  sex: "male" | "female" | ""
  areas: string[]
  subSymptoms: Record<string, string[]>
  description: string
}

const initialState: FormState = {
  breed: "",
  petName: "",
  neutered: "",
  birthday: "",
  sex: "",
  areas: [],
  subSymptoms: {},
  description: "",
}

function renderMarkdown(md: string) {
  const lines = md.split("\n")
  const blocks: Array<{ type: "h2" | "p" | "ul"; items?: string[]; text?: string }> = []
  let currentList: string[] | null = null

  const flushList = () => {
    if (currentList && currentList.length > 0) blocks.push({ type: "ul", items: currentList })
    currentList = null
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.startsWith("## ")) {
      flushList()
      blocks.push({ type: "h2", text: line.slice(3).trim() })
    } else if (line.startsWith("- ")) {
      if (!currentList) currentList = []
      currentList.push(line.slice(2).trim())
    } else if (line.trim() === "") {
      flushList()
    } else {
      flushList()
      blocks.push({ type: "p", text: line })
    }
  }
  flushList()

  return blocks.map((b, i) => {
    if (b.type === "h2") {
      return (
        <h3 key={i} className="mt-5 text-base font-semibold first:mt-0">
          {b.text}
        </h3>
      )
    }
    if (b.type === "ul") {
      return (
        <ul key={i} className="mt-2 space-y-1.5 text-sm">
          {b.items!.map((item, j) => (
            <li key={j} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span className="text-foreground/90">{item}</span>
            </li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i} className="mt-2 text-sm leading-relaxed text-foreground/90">
        {b.text}
      </p>
    )
  })
}

export function DiseaseCheckPanel() {
  const [state, setState] = useState<FormState>(initialState)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  function toggleArea(area: string, checked: boolean) {
    setState((prev) => {
      const areas = checked ? [...prev.areas, area] : prev.areas.filter((a) => a !== area)
      const subSymptoms = { ...prev.subSymptoms }
      if (!checked) delete subSymptoms[area]
      return { ...prev, areas, subSymptoms }
    })
  }

  function toggleSub(area: string, sub: string, checked: boolean) {
    setState((prev) => {
      const current = prev.subSymptoms[area] ?? []
      const next = checked ? [...current, sub] : current.filter((s) => s !== sub)
      return { ...prev, subSymptoms: { ...prev.subSymptoms, [area]: next } }
    })
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setErrorMsg(null)
    try {
      const newOnes: Attachment[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/disease-check/upload", { method: "POST", body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setErrorMsg(data?.error ?? "Upload failed.")
          continue
        }
        newOnes.push({
          pathname: data.pathname,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
        })
      }
      setAttachments((prev) => [...prev, ...newOnes])
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function removeAttachment(pathname: string) {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.pathname === pathname)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((a) => a.pathname !== pathname)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!state.breed.trim()) {
      setErrorMsg("Breed is required.")
      return
    }
    if (state.description.trim().length < 10) {
      setErrorMsg("Please describe the symptoms in more detail.")
      return
    }
    setLoading(true)
    setErrorMsg(null)
    setResult(null)

    try {
      const payload = {
        ...state,
        attachments: attachments.map((a) => ({ pathname: a.pathname, name: a.name })),
      }
      const res = await fetch("/api/disease-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg(typeof data?.error === "string" ? data.error : "Service unavailable. Please try again later.")
        return
      }
      setResult(data.text ?? "")
    } catch {
      setErrorMsg("Service unavailable. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl))
    setState(initialState)
    setAttachments([])
    setResult(null)
    setErrorMsg(null)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3 md:p-8"
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Tell Dr. Max about your dog</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The more detail you share, the more precise Dr. Max can be.
          </p>
        </div>

        {/* Section 1: Pet basics */}
        <FieldSet>
          <FieldLegend className="text-sm font-semibold">About your dog</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="breed">
                Breed <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="breed"
                required
                value={state.breed}
                onChange={(e) => update("breed", e.target.value)}
                placeholder="e.g. Golden Retriever"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="petName">Pet name (optional)</FieldLabel>
              <Input
                id="petName"
                value={state.petName}
                onChange={(e) => update("petName", e.target.value)}
                placeholder="e.g. Buddy"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="birthday">Date of birth (optional)</FieldLabel>
              <Input
                id="birthday"
                type="date"
                lang="en"
                max={new Date().toISOString().slice(0, 10)}
                value={state.birthday}
                onChange={(e) => update("birthday", e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">Format: MM/DD/YYYY</p>
            </Field>

            <Field>
              <FieldLabel>Sex</FieldLabel>
              <RadioGroup
                value={state.sex}
                onValueChange={(v) => update("sex", v as FormState["sex"])}
                className="flex gap-4 pt-1"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="sex-male" value="male" />
                  <Label htmlFor="sex-male" className="cursor-pointer text-sm font-normal">
                    Male
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="sex-female" value="female" />
                  <Label htmlFor="sex-female" className="cursor-pointer text-sm font-normal">
                    Female
                  </Label>
                </div>
              </RadioGroup>
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>Neuter status</FieldLabel>
              <RadioGroup
                value={state.neutered}
                onValueChange={(v) => update("neutered", v as FormState["neutered"])}
                className="flex flex-wrap gap-4 pt-1"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="neuter-spayed" value="spayed" />
                  <Label htmlFor="neuter-spayed" className="cursor-pointer text-sm font-normal">
                    Spayed / Neutered
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="neuter-intact" value="intact" />
                  <Label htmlFor="neuter-intact" className="cursor-pointer text-sm font-normal">
                    Intact
                  </Label>
                </div>
              </RadioGroup>
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* Section 2: Symptom areas */}
        <FieldSet>
          <FieldLegend className="text-sm font-semibold">Symptom areas</FieldLegend>
          <p className="mb-2 text-xs text-muted-foreground">
            Select any areas that apply. Sub-symptoms appear once you tick an area.
          </p>
          <div className="space-y-3">
            {SYMPTOM_MAP.map(({ area, subs }) => {
              const isOpen = state.areas.includes(area)
              const selectedSubs = state.subSymptoms[area] ?? []
              return (
                <div
                  key={area}
                  className={`rounded-lg border transition-colors ${isOpen ? "border-accent/40 bg-accent/5" : "border-border bg-background"}`}
                >
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
                    <Checkbox
                      checked={isOpen}
                      onCheckedChange={(c) => toggleArea(area, Boolean(c))}
                      aria-label={area}
                    />
                    <span className="text-sm font-medium">{area}</span>
                    {selectedSubs.length > 0 && (
                      <span className="ml-auto rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                        {selectedSubs.length} selected
                      </span>
                    )}
                  </label>
                  {isOpen && (
                    <div className="grid grid-cols-2 gap-2 border-t border-border/50 px-4 py-3 sm:grid-cols-3">
                      {subs.map((sub) => {
                        const checked = selectedSubs.includes(sub)
                        const id = `${area}-${sub}`.replace(/\s+/g, "-").toLowerCase()
                        return (
                          <label
                            key={sub}
                            htmlFor={id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-background"
                          >
                            <Checkbox
                              id={id}
                              checked={checked}
                              onCheckedChange={(c) => toggleSub(area, sub, Boolean(c))}
                            />
                            <span className="text-foreground/90">{sub}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </FieldSet>

        {/* Section 3: Description + photos */}
        <FieldSet>
          <FieldLegend className="text-sm font-semibold">Detailed description & photos</FieldLegend>

          <Field>
            <FieldLabel htmlFor="description">
              Symptom details <span className="text-destructive">*</span>
            </FieldLabel>
            <Textarea
              id="description"
              required
              rows={5}
              value={state.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe what you're seeing — when it started, frequency, recent changes in food/environment, anything unusual…"
            />
          </Field>

          <Field className="mt-4">
            <FieldLabel>Photos (optional)</FieldLabel>
            <div className="rounded-lg border border-dashed border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <ImagePlus className="mr-1.5 h-4 w-4" />
                      Add photos
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, HEIC · up to 8 MB each.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              {attachments.length > 0 && (
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {attachments.map((a) => (
                    <li
                      key={a.pathname}
                      className="group relative overflow-hidden rounded-md border border-border bg-card"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.previewUrl || "/placeholder.svg"} alt={a.name} className="aspect-square w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAttachment(a.pathname)}
                        className="absolute right-1.5 top-1.5 rounded-full bg-card/95 p-1 text-foreground shadow-sm opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100 focus-visible:opacity-100"
                        aria-label={`Remove ${a.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Field>

          <div className="mt-3 flex items-start gap-2 rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs text-foreground/80">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <p>The more detail you provide, the more precise Dr. Max&apos;s assessment will be.</p>
          </div>
        </FieldSet>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">For educational triage only, not a diagnosis.</p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={loading || uploading}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Sidebar: result */}
      <aside className="lg:col-span-2">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          {!result && !loading && !errorMsg && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                <MessageSquareHeart className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="font-medium text-foreground">Dr. Max's assessment will appear here.</p>
              <p className="mt-1">Fill in the form and submit to see the result.</p>
            </div>
          )}

          {loading && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-accent" />
              Analyzing symptoms…
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div>
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <MessageSquareHeart className="h-4 w-4 text-accent" aria-hidden="true" />
                <p className="text-sm font-semibold">Initial assessment</p>
              </div>
              <div className="mt-4 text-sm">{renderMarkdown(result)}</div>

              <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold">Need a real conversation?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Continue the consultation with Dr. Max for follow-up questions and personalized guidance.
                </p>
                <Button asChild size="sm" className="mt-3 w-full">
                  <Link href="/consultation">
                    Continue with Dr. Max
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

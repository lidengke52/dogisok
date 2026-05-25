"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export type PetProfile = {
  dogCount: string
  breed: string
  ageStage: string
  weight: string
  history: string
  symptoms: string
  otherNotes: string
}

const STORAGE_KEY = "missvet:pet-profile"

export function PetInfoForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const profile: PetProfile = {
      dogCount: String(formData.get("dogCount") || "1"),
      breed: String(formData.get("breed") || ""),
      ageStage: String(formData.get("ageStage") || ""),
      weight: String(formData.get("weight") || ""),
      history: String(formData.get("history") || ""),
      symptoms: String(formData.get("symptoms") || ""),
      otherNotes: String(formData.get("otherNotes") || ""),
    }

    if (!profile.symptoms.trim()) return

    setPending(true)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // sessionStorage may be blocked; we still navigate and let the chat start fresh
    }
    router.push("/consultation/chat")
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      <fieldset>
        <legend className="text-sm font-semibold">Step 1 &middot; Basic information</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dogCount" className="text-xs font-medium text-muted-foreground">
              How many dogs?
            </label>
            <input
              id="dogCount"
              name="dogCount"
              type="number"
              min={1}
              defaultValue={1}
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="breed" className="text-xs font-medium text-muted-foreground">
              Breed
            </label>
            <input
              id="breed"
              name="breed"
              type="text"
              placeholder="e.g. Golden Retriever"
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="ageStage" className="text-xs font-medium text-muted-foreground">
              Life stage
            </label>
            <select
              id="ageStage"
              name="ageStage"
              defaultValue="Adult (1-7 yrs)"
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option>Puppy (under 1 yr)</option>
              <option>Adult (1-7 yrs)</option>
              <option>Senior (7+ yrs)</option>
            </select>
          </div>
          <div>
            <label htmlFor="weight" className="text-xs font-medium text-muted-foreground">
              Weight (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              placeholder="e.g. 24.5"
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Step 2 &middot; Medical history</legend>
        <label htmlFor="history" className="mt-4 block text-xs font-medium text-muted-foreground">
          Known conditions, medications, surgeries
        </label>
        <textarea
          id="history"
          name="history"
          rows={3}
          placeholder="e.g. Spayed 2024, mild seasonal allergies, on heartworm prevention"
          className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">
          Step 3 &middot; Current symptoms <span className="text-destructive">*</span>
        </legend>
        <label htmlFor="symptoms" className="mt-4 block text-xs font-medium text-muted-foreground">
          Describe what&apos;s going on in detail
        </label>
        <textarea
          id="symptoms"
          name="symptoms"
          rows={5}
          required
          placeholder="When did it start? How often? Any triggers? Changes in eating, drinking, energy, or behavior?"
          className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Step 4 &middot; Anything else?</legend>
        <label htmlFor="otherNotes" className="mt-4 block text-xs font-medium text-muted-foreground">
          Anything you want Dr. Max to know upfront
        </label>
        <textarea
          id="otherNotes"
          name="otherNotes"
          rows={2}
          placeholder="Optional — you can also upload photos and documents in the chat."
          className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Dr. Max gives educational guidance only and does not replace a veterinary diagnosis.
        </p>
        <Button type="submit" size="lg" disabled={pending} className="sm:w-auto">
          Start chatting with Dr. Max
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}

export const PET_PROFILE_STORAGE_KEY = STORAGE_KEY

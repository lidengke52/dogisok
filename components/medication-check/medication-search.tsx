"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { MedicationCard } from "./medication-card"
import type { Medication } from "@/lib/medications"

type Props = {
  initialQuery: string
  results: Medication[]
}

export function MedicationSearch({ initialQuery, results }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(initialQuery)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/medication-check?q=${encodeURIComponent(q)}` : "/medication-check")
  }

  function clear() {
    setValue("")
    router.push("/medication-check")
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search by drug name, condition, or pet type (e.g. amoxicillin, pain, dogs)"
            className="h-12 pl-10 pr-10 text-base"
            aria-label="Search medications"
          />
          {value ? (
            <button
              type="button"
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <Button type="submit" size="lg" className="h-12 px-6">
          Search
        </Button>
      </form>

      {initialQuery ? (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight md:text-xl">
              {results.length > 0
                ? `${results.length} result${results.length > 1 ? "s" : ""} for "${initialQuery}"`
                : `No results for "${initialQuery}"`}
            </h2>
          </div>
          {results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((med) => (
                <MedicationCard key={med.id} medication={med} />
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No matching medications</EmptyTitle>
                <EmptyDescription>
                  Try a different keyword, or browse the caution and forbidden lists below.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter a medication name above to view full details: indications, applicable pets, dosage, and precautions.
        </p>
      )}
    </div>
  )
}

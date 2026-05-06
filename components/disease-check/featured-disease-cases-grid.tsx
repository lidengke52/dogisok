"use client"

import { useState } from "react"
import { Stethoscope, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FeaturedDiseaseCase } from "@/lib/featured-disease-cases"

const PAGE_SIZE = 4
const SYMPTOM_TRUNCATE = 110
const ANSWER_TRUNCATE = 240

function CaseCard({ item }: { item: FeaturedDiseaseCase }) {
  const [expanded, setExpanded] = useState(false)
  const symptomNeedsToggle = item.symptom.length > SYMPTOM_TRUNCATE
  const answerNeedsToggle = item.self_check_content.length > ANSWER_TRUNCATE
  const showToggle = symptomNeedsToggle || answerNeedsToggle

  const symptomDisplay =
    !expanded && symptomNeedsToggle ? `${item.symptom.slice(0, SYMPTOM_TRUNCATE).trimEnd()}…` : item.symptom

  const answerDisplay =
    !expanded && answerNeedsToggle
      ? `${item.self_check_content.slice(0, ANSWER_TRUNCATE).trimEnd()}…`
      : item.self_check_content

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{item.dog_breed}</span>
          <span className="mx-2 text-muted-foreground/60">•</span>
          <span>{item.dog_age}</span>
        </p>
      </div>

      <h3 className="text-base font-semibold leading-snug text-pretty md:text-lg">{symptomDisplay}</h3>

      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{answerDisplay}</p>

      {showToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 self-start text-sm font-medium text-accent hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              Less <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              More <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      ) : null}
    </article>
  )
}

export function FeaturedDiseaseCasesGrid({ cases }: { cases: FeaturedDiseaseCase[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  if (cases.length === 0) {
    return null
  }

  const visibleCases = cases.slice(0, visibleCount)
  const hasMore = visibleCount < cases.length

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-20 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent">
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Featured Self-Check Cases</h2>
      </div>
      <p className="mb-8 text-sm text-muted-foreground md:text-base">
        Real (anonymized) self-check examples curated by our vet team. Use them as a quick reference, never as a
        substitute for professional veterinary care.
      </p>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {visibleCases.map((item) => (
          <CaseCard key={item.id} item={item} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-8"
          >
            View more
          </Button>
        </div>
      ) : null}
    </section>
  )
}

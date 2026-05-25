"use client"

import { useMemo, useState } from "react"
import { ClipboardList, Dog, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FeaturedCase } from "@/lib/featured-cases"

const PAGE_SIZE = 4

export function FeaturedCasesGrid({ cases }: { cases: FeaturedCase[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const visibleCases = useMemo(() => cases.slice(0, visibleCount), [cases, visibleCount])
  const hasMore = visibleCount < cases.length

  if (cases.length === 0) {
    return null
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function loadMore() {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, cases.length))
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ClipboardList className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Featured Cases</h2>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Real (anonymized) consultations curated by our editors. Browse common scenarios and how Dr. Max responds.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {visibleCases.map((c) => (
          <FeaturedCaseCard
            key={c.id}
            caseItem={c}
            isExpanded={!!expanded[c.id]}
            onToggle={() => toggleExpand(c.id)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button onClick={loadMore} variant="outline" size="lg" className="min-w-40 bg-transparent">
            View more
          </Button>
        </div>
      )}
    </section>
  )
}

function FeaturedCaseCard({
  caseItem,
  isExpanded,
  onToggle,
}: {
  caseItem: FeaturedCase
  isExpanded: boolean
  onToggle: () => void
}) {
  // Show "More" button if either symptom or ai_answer is long
  const isLong = caseItem.symptom.length > 110 || caseItem.ai_answer.length > 240

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Dog className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{caseItem.dog_breed}</span>
          {" \u00b7 "}
          {caseItem.dog_age}
        </p>
      </div>

      <h3
        className={`mt-4 text-pretty text-base font-semibold leading-snug md:text-lg ${
          isExpanded ? "" : "line-clamp-3"
        }`}
      >
        {caseItem.symptom}
      </h3>

      <p
        className={`mt-3 flex-1 text-sm leading-relaxed text-muted-foreground ${
          isExpanded ? "" : "line-clamp-5"
        }`}
      >
        {caseItem.ai_answer}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-4 inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              Less
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          ) : (
            <>
              More
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          )}
        </button>
      )}
    </article>
  )
}

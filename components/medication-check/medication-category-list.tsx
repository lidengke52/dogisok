'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, ShieldAlert, Ban, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Medication, MedicationCategory } from '@/lib/medications'
import { loadMoreMedications } from '@/app/medication-check/actions'

type Variant = 'caution' | 'forbidden'

interface MedicationCategoryListProps {
  title: string
  description: string
  variant: Variant
  category: MedicationCategory
  initialItems: Medication[]
  totalCount: number
}

const VARIANT_STYLES: Record<
  Variant,
  {
    Icon: typeof ShieldAlert
    wrapper: string
    iconBg: string
    iconColor: string
    itemBorder: string
  }
> = {
  caution: {
    Icon: ShieldAlert,
    wrapper: 'border-amber-200 bg-amber-50/40',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    itemBorder: 'border-amber-200/60',
  },
  forbidden: {
    Icon: Ban,
    wrapper: 'border-red-200 bg-red-50/40',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    itemBorder: 'border-red-200/60',
  },
}

export function MedicationCategoryList({
  title,
  description,
  variant,
  category,
  initialItems,
  totalCount,
}: MedicationCategoryListProps) {
  const styles = VARIANT_STYLES[variant]
  const Icon = styles.Icon
  const [openId, setOpenId] = useState<string | null>(null)
  const [items, setItems] = useState(initialItems)
  const [isPending, startTransition] = useTransition()

  const handleLoadMore = () => {
    startTransition(async () => {
      const nextBatch = await loadMoreMedications(category, items.length)
      setItems((prev) => [...prev, ...nextBatch])
    })
  }

  const hasMore = items.length < totalCount

  return (
    <section className={cn('rounded-2xl border p-5 md:p-6', styles.wrapper)}>
      <header className="flex items-start gap-3">
        <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-full', styles.iconBg)}>
          <Icon className={cn('h-5 w-5', styles.iconColor)} />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight md:text-lg">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">No medications in this list yet.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {items.map((med) => {
            const isOpen = openId === med.id
            return (
              <li key={med.id} className={cn('rounded-xl border bg-card', styles.itemBorder)}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : med.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{med.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{med.applicable_pets}</p>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>

                {isOpen ? (
                  <div className="space-y-3 border-t border-border/60 px-4 py-4 text-sm">
                    <DetailItem label="Indications" value={med.indications} />
                    <DetailItem label="Usage" value={med.usage_method} />
                    <DetailItem label="Dosage" value={med.dosage} />
                    <DetailItem label="Precautions" value={med.precautions} />
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between">
        {items.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {items.length} item{items.length > 1 ? 's' : ''} · click to expand
          </p>
        ) : null}
        {hasMore && (
          <Button
            onClick={handleLoadMore}
            disabled={isPending}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            {isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Load More ({items.length} of {totalCount})
          </Button>
        )}
      </div>
    </section>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 leading-relaxed text-foreground">{value}</dd>
    </div>
  )
}

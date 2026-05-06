import { ShieldAlert, Ban, ShieldCheck, PawPrint, Beaker, Scale, AlertTriangle } from "lucide-react"
import type { Medication } from "@/lib/medications"
import { cn } from "@/lib/utils"

const CATEGORY_META = {
  normal: {
    label: "Vet-approved",
    icon: ShieldCheck,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  caution: {
    label: "Use with caution",
    icon: ShieldAlert,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  forbidden: {
    label: "Forbidden",
    icon: Ban,
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
} as const

export function MedicationCard({ medication }: { medication: Medication }) {
  const meta = CATEGORY_META[medication.category]
  const Icon = meta.icon

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight md:text-xl">{medication.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{medication.indications}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            meta.badgeClass,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
      </header>

      <dl className="mt-5 grid gap-4 md:grid-cols-2">
        <DetailRow icon={PawPrint} label="Applicable pets" value={medication.applicable_pets} />
        <DetailRow icon={Beaker} label="Usage" value={medication.usage_method} />
        <DetailRow icon={Scale} label="Dosage" value={medication.dosage} />
        <DetailRow icon={AlertTriangle} label="Precautions" value={medication.precautions} />
      </dl>
    </article>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PawPrint
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-foreground">{value}</dd>
    </div>
  )
}

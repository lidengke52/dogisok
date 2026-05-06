import { Pill } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MedicationSearch } from "@/components/medication-check/medication-search"
import { MedicationCategoryList } from "@/components/medication-check/medication-category-list"
import { searchMedications, getMedicationsByCategory, countMedicationsByCategory } from "@/lib/medications"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ q?: string }>
}

export const metadata = {
  title: "Pet Medication Check | Dog is OK",
  description:
    "Search safe medications for your pet, and review medications that require caution or are strictly forbidden for dogs and cats.",
}

export default async function MedicationCheckPage({ searchParams }: Props) {
  const params = await searchParams
  const query = (params?.q ?? "").trim()

  const [results, cautionList, forbiddenList, cautionCount, forbiddenCount] = await Promise.all([
    query ? searchMedications(query) : Promise.resolve([]),
    getMedicationsByCategory("caution", 10),
    getMedicationsByCategory("forbidden", 10),
    countMedicationsByCategory("caution"),
    countMedicationsByCategory("forbidden"),
  ])

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Pill className="h-3.5 w-3.5" />
              Medication Check
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Look up medications safe for your pet
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Search by medication name, indication, or pet type to instantly see usage, dosage, and important
              precautions. Always confirm with your veterinarian before administering.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-12 lg:px-8">
          <MedicationSearch initialQuery={query} results={results} />
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 md:px-6 md:pb-20 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <MedicationCategoryList
              title="Caution medications"
              description="Use only with veterinary supervision. Risk of serious side effects."
              variant="caution"
              category="caution"
              initialItems={cautionList}
              totalCount={cautionCount}
            />
            <MedicationCategoryList
              title="Forbidden medications"
              description="Toxic or potentially fatal. Never administer to pets."
              variant="forbidden"
              category="forbidden"
              initialItems={forbiddenList}
              totalCount={forbiddenCount}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

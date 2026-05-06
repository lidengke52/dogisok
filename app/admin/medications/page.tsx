import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { Button } from "@/components/ui/button"
import { MedicationsTable } from "@/components/admin/medications-table"
import type { Medication } from "@/lib/medications"

export const dynamic = "force-dynamic"
export const metadata = { title: "药品管理 | 管理后台" }

export default async function AdminMedicationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const { data } = await supabase
    .from("medications")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  const medications = (data ?? []) as Medication[]

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">管理后台</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">药品管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理可搜索的宠物药品库,共 {medications.length} 条。
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/medications/import">
              <Upload className="mr-2 h-4 w-4" />
              批量导入
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/medications/new">
              <Plus className="mr-2 h-4 w-4" />
              新增药品
            </Link>
          </Button>
        </div>
      </header>

      <section className="mt-8">
        <MedicationsTable medications={medications} />
      </section>
    </main>
  )
}

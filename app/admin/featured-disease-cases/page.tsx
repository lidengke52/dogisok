import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, ShieldAlert, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { FeaturedDiseaseCasesTable } from "@/components/admin/featured-disease-cases-table"

export const dynamic = "force-dynamic"

export const metadata = { title: "自查精选案例 · 管理后台" }

export default async function AdminFeaturedDiseaseCasesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const { data: cases } = await supabase
    .from("featured_disease_cases")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">自查精选案例</h1>
            <p className="text-sm text-muted-foreground">维护疾病自查页右侧的精选展示。</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/featured-disease-cases/import">
              <Upload className="mr-1 h-4 w-4" />
              批量导入
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/featured-disease-cases/new">
              <Plus className="mr-1 h-4 w-4" />
              新增案例
            </Link>
          </Button>
        </div>
      </header>

      <FeaturedDiseaseCasesTable cases={cases ?? []} />
    </div>
  )
}

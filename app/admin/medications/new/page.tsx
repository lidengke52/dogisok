import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { MedicationForm } from "@/components/admin/medication-form"
import { createMedication } from "@/app/admin/medications/actions"

export const dynamic = "force-dynamic"
export const metadata = { title: "新增药品 | 管理后台" }

export default async function NewMedicationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-6 lg:px-8">
      <Link
        href="/admin/medications"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回药品列表
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">新增药品</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        添加单条药品。如需一次添加多条,请使用批量导入。
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <MedicationForm action={createMedication} submitLabel="创建药品" />
      </div>
    </main>
  )
}

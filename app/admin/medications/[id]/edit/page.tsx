import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { MedicationForm } from "@/components/admin/medication-form"
import { updateMedication } from "@/app/admin/medications/actions"
import type { Medication } from "@/lib/medications"

export const dynamic = "force-dynamic"
export const metadata = { title: "编辑药品 | 管理后台" }

export default async function EditMedicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const { data } = await supabase.from("medications").select("*").eq("id", id).maybeSingle()
  if (!data) notFound()
  const medication = data as Medication

  const action = updateMedication.bind(null, id)

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-6 lg:px-8">
      <Link
        href="/admin/medications"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回药品列表
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">编辑药品</h1>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <MedicationForm action={action} medication={medication} submitLabel="保存修改" />
      </div>
    </main>
  )
}

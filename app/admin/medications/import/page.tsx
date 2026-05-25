import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { BulkImportMedicationsForm } from "@/components/admin/bulk-import-medications-form"

export const dynamic = "force-dynamic"
export const metadata = { title: "批量导入药品 | 管理后台" }

export default async function ImportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 lg:px-8">
      <Link
        href="/admin/medications"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回药品列表
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">批量导入药品</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        上传 CSV / Excel 文件或直接粘贴内容。列字段:<code>name</code>、<code>indications</code>、
        <code>applicable_pets</code>、<code>usage_method</code>、<code>dosage</code>、<code>precautions</code>;
        可选 <code>category</code>(normal/caution/forbidden)和 <code>is_active</code>(true/false)。
        中文表头(药品名称、主治功能、适用宠物、用法、用量、使用注意事项、属性)同样支持。
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <BulkImportMedicationsForm />
      </div>
    </main>
  )
}

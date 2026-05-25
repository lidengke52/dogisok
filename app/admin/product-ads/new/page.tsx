import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { ProductAdForm } from "@/components/admin/product-ad-form"

export const dynamic = "force-dynamic"

export const metadata = { title: "新增广告 · 管理后台" }

export default async function NewProductAdPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href="/admin/product-ads">
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回广告列表
        </Link>
      </Button>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">新增产品广告</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        选择投放位置并填写跳转链接。广告可随时开关而无需删除。
      </p>
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <ProductAdForm />
      </div>
    </div>
  )
}

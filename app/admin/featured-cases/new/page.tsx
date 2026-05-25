import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { FeaturedCaseForm } from "@/components/admin/featured-case-form"

export const dynamic = "force-dynamic"

export const metadata = { title: "新增精选案例 · 管理后台" }

export default async function NewFeaturedCasePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href="/admin/featured-cases">
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回案例列表
        </Link>
      </Button>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">新增精选案例</h1>
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <FeaturedCaseForm />
      </div>
    </div>
  )
}

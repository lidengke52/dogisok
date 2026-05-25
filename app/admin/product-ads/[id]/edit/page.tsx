import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { getProductAdById } from "@/lib/product-ads"
import { ProductAdForm } from "@/components/admin/product-ad-form"

export const dynamic = "force-dynamic"

export const metadata = { title: "编辑广告 · 管理后台" }

type Props = { params: Promise<{ id: string }> }

export default async function EditProductAdPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const ad = await getProductAdById(id)
  if (!ad) notFound()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href="/admin/product-ads">
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回广告列表
        </Link>
      </Button>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">编辑广告</h1>
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <ProductAdForm ad={ad} />
      </div>
    </div>
  )
}

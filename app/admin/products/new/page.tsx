import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { ProductForm } from "@/components/admin/product-form"

export const dynamic = "force-dynamic"

export const metadata = { title: "新增商品 · 管理后台" }

export default async function NewProductPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href="/admin/products">
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回商品列表
        </Link>
      </Button>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">新增商品</h1>
      <ProductForm />
    </div>
  )
}

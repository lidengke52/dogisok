import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, ShoppingBag } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/admin/products-table"

export const dynamic = "force-dynamic"

export const metadata = { title: "商品 / 赠品库 · 管理后台" }

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, image_url, order_index, created_at, updated_at")
    .order("order_index", { ascending: true })

  // 每个产品被申领次数
  const ids = (products ?? []).map((p) => p.id)
  const claimsCountMap = new Map<string, number>()
  if (ids.length > 0) {
    const { data: claims } = await supabase
      .from("product_claims")
      .select("product_id")
      .in("product_id", ids)
    for (const c of claims ?? []) {
      claimsCountMap.set(c.product_id, (claimsCountMap.get(c.product_id) ?? 0) + 1)
    }
  }

  const rows = (products ?? []).map((p) => ({
    ...p,
    claims_count: claimsCountMap.get(p.id) ?? 0,
  }))

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">商品 / 赠品库</h1>
            <p className="text-sm text-muted-foreground">
              用户在邀请页面可领取的产品。管理产品名、图片和展示顺序。
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-1 h-4 w-4" />
            新增商品
          </Link>
        </Button>
      </header>

      <ProductsTable rows={rows} />
    </div>
  )
}

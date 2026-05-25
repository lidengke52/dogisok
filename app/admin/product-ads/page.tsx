import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { getAllProductAds } from "@/lib/product-ads"
import { isAdmin } from "@/lib/admin"
import { ProductAdsTable } from "@/components/admin/product-ads-table"

export const dynamic = "force-dynamic"

export const metadata = { title: "首页广告位 · 管理后台" }

export default async function ProductAdsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const ads = await getAllProductAds()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Megaphone className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">首页广告位</h1>
            <p className="text-sm text-muted-foreground">
              管理首页、文章列表、Dr. Max 页的赞助广告。
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/product-ads/new">
            <Plus className="mr-1 h-4 w-4" />
            新增广告
          </Link>
        </Button>
      </header>

      <ProductAdsTable ads={ads} />
    </div>
  )
}

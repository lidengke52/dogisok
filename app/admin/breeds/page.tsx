import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { Button } from "@/components/ui/button"
import { BreedsTable } from "@/components/admin/breeds-table"
import { listAllBreeds } from "@/lib/breeds"

export const dynamic = "force-dynamic"
export const metadata = { title: "犬种库 · 管理后台" }

export default async function AdminBreedsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const breeds = await listAllBreeds()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">管理后台</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">犬种库</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理 /breeds 页面的品种数据，共 {breeds.length} 条。
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/breeds/new">
            <Plus className="mr-2 h-4 w-4" />
            新增品种
          </Link>
        </Button>
      </header>

      <section className="mt-8">
        <BreedsTable breeds={breeds} />
      </section>
    </main>
  )
}

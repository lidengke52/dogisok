import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { Button } from "@/components/ui/button"
import { BreedsTable } from "@/components/admin/breeds-table"
import { listAllBreedsWithPagination } from "@/lib/breeds"

export const dynamic = "force-dynamic"
export const metadata = { title: "犬种库 · 管理后台" }

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminBreedsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10))
  const pageSize = 50

  const { breeds, total } = await listAllBreedsWithPagination(page, pageSize)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">管理后台</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">犬种库</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理 /breeds 页面的品种数据，共 {total} 条。
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/breeds/import">
              <Plus className="mr-2 h-4 w-4" />
              批量导入
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/breeds/new">
              <Plus className="mr-2 h-4 w-4" />
              新增品种
            </Link>
          </Button>
        </div>
      </header>

      <section className="mt-8">
        <BreedsTable breeds={breeds} />
      </section>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          <Button
            asChild
            variant="outline"
            disabled={page === 1}
          >
            <Link href={`/admin/breeds?page=${page - 1}`}>
              上一页
            </Link>
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1
              return (
                <Button
                  key={p}
                  asChild
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                >
                  <Link href={`/admin/breeds?page=${p}`}>
                    {p}
                  </Link>
                </Button>
              )
            })}
            {totalPages > 5 && (
              <>
                <span className="text-muted-foreground">...</span>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <Link href={`/admin/breeds?page=${totalPages}`}>
                    {totalPages}
                  </Link>
                </Button>
              </>
            )}
          </div>

          <Button
            asChild
            variant="outline"
            disabled={page === totalPages}
          >
            <Link href={`/admin/breeds?page=${page + 1}`}>
              下一页
            </Link>
          </Button>
        </nav>
      )}
    </main>
  )
}

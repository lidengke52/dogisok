import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, Upload, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MedicationsTable } from "@/components/admin/medications-table"
import { listAllMedicationsWithPagination } from "@/lib/medications"
import type { Medication } from "@/lib/medications"

export const dynamic = "force-dynamic"
export const metadata = { title: "药品管理 | 管理后台" }

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function AdminMedicationsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10))
  const search = params.search?.trim() || ""
  const pageSize = 20

  const { medications, total } = await listAllMedicationsWithPagination(page, pageSize, search)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">管理后台</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">药品管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理可搜索的宠物药品库，共 {total} 条。
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/medications/import">
              <Upload className="mr-2 h-4 w-4" />
              批量导入
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/medications/new">
              <Plus className="mr-2 h-4 w-4" />
              新增药品
            </Link>
          </Button>
        </div>
      </header>

      {/* 搜索栏 */}
      <form action="/admin/medications" method="get" className="mt-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              name="search"
              placeholder="按药品名称、功效、适用宠物搜索..."
              defaultValue={search}
              className="pl-10"
            />
          </div>
          <Button type="submit">搜索</Button>
          {search && (
            <Button asChild variant="outline">
              <Link href="/admin/medications">清除</Link>
            </Button>
          )}
        </div>
      </form>

      {search && (
        <p className="mt-4 text-sm text-muted-foreground">
          搜索结果："{search}" ({total} 条)
        </p>
      )}

      <section className="mt-8">
        <MedicationsTable medications={medications} />
      </section>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          <Button
            asChild
            variant="outline"
            disabled={page === 1}
          >
            <Link href={`/admin/medications?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
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
                  <Link href={`/admin/medications?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
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
                  <Link href={`/admin/medications?page=${totalPages}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
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
            <Link href={`/admin/medications?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
              下一页
            </Link>
          </Button>
        </nav>
      )}
    </main>
  )
}

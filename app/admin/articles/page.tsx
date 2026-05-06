import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { ArticlesTable } from "@/components/admin/articles-table"

export const dynamic = "force-dynamic"

export const metadata = { title: "文章管理 · 管理后台" }

export default async function AdminArticlesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, category, published, views, read_minutes, published_at, updated_at, created_at, author")
    .order("updated_at", { ascending: false })

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">文章管理</h1>
            <p className="text-sm text-muted-foreground">撰写、发布和维护内容文章。</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="mr-1 h-4 w-4" />
            新增文章
          </Link>
        </Button>
      </header>

      <ArticlesTable articles={articles ?? []} />
    </div>
  )
}

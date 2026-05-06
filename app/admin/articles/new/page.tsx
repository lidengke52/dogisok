import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { ArticleForm } from "@/components/admin/article-form"
import { createArticle } from "@/app/admin/articles/actions"
import { listAllBreeds } from "@/lib/breeds"

export const dynamic = "force-dynamic"

export const metadata = { title: "新增文章 · 管理后台" }

export default async function NewArticlePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const breeds = await listAllBreeds()
  const breedOptions = breeds.filter((b) => b.isPublished).map((b) => ({
    slug: b.slug,
    name: b.name,
    cnName: b.cnName,
  }))

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href="/admin/articles">
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回文章列表
        </Link>
      </Button>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">新增文章</h1>
      <ArticleForm mode="create" action={createArticle} breeds={breedOptions} />
    </div>
  )
}

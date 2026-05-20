import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { ArticleForm } from "@/components/admin/article-form"
import type { ArticleFormState } from "@/app/admin/articles/actions"
import { listAllBreeds } from "@/lib/breeds"

export const dynamic = "force-dynamic"

export const metadata = { title: "编辑文章 · 管理后台" }

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function EditArticlePage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { page = "1" } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single()

  if (articleError) {
    console.error("[v0] Failed to fetch article:", articleError)
    notFound()
  }
  if (!article) notFound()

  let breeds = []
  try {
    const allBreeds = await listAllBreeds()
    breeds = allBreeds
      // 编辑时把"已隐藏但已被该文章关联"的品种也保留在选项里，避免显示成"不关联"
      .filter((b) => b.isPublished || b.slug === article.breed_slug)
      .map((b) => ({ slug: b.slug, name: b.name, cnName: b.cnName }))
  } catch (err) {
    console.error("[v0] Failed to list breeds:", err)
    // Continue even if breeds fail - it's optional
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href={`/admin/articles?page=${page}`}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回文章列表
        </Link>
      </Button>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">编辑文章</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">/{article.slug}</p>
      </div>
      <ArticleForm mode="edit" articleId={id} article={article} breeds={breeds} page={page} />
    </div>
  )
}

import { NextRequest, NextResponse } from "next/server"
import { authenticateApiRequest, apiCorsHeaders } from "@/lib/api-auth"
import { getArticleBySlug } from "@/lib/articles"
import { getArticleUrl } from "@/lib/site-url"

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: apiCorsHeaders() })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await authenticateApiRequest(req)
  if (!auth.ok) return auth.response

  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return NextResponse.json(
      { error: "Article not found." },
      { status: 404, headers: apiCorsHeaders() }
    )
  }

  return NextResponse.json(
    {
      data: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt ?? null,
        content: article.content ?? null,
        category: article.category,
        tags: article.tags ?? [],
        author: article.author ?? "Editor",
        read_time: article.read_minutes ?? 5,
        image: article.cover_image ?? null,
        published_at: article.published_at,
        url: getArticleUrl(article.slug),
      },
    },
    { headers: apiCorsHeaders() }
  )
}

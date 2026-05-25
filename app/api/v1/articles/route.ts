import { NextRequest, NextResponse } from "next/server"
import { authenticateApiRequest, apiCorsHeaders } from "@/lib/api-auth"
import { listPublishedArticles } from "@/lib/articles"

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: apiCorsHeaders() })
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")))
  const category = searchParams.get("category") ?? undefined
  const offset = (page - 1) * limit

  const rows = await listPublishedArticles({ limit: limit + 1, offset, category })
  const hasMore = rows.length > limit
  const items = rows.slice(0, limit).map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    tags: a.tags ?? [],
    author: a.author,
    read_time: a.read_time,
    image: a.cover_image ?? null,
    excerpt: a.excerpt ?? null,
    published_at: a.published_at,
    url: `https://dogisok.com/articles/${a.slug}`,
  }))

  return NextResponse.json(
    {
      data: items,
      pagination: { page, limit, has_more: hasMore },
    },
    { headers: apiCorsHeaders() }
  )
}

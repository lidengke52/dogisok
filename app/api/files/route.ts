import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"

export const runtime = "nodejs"

/**
 * 公共文件代理：把 private Blob store 中的文件用 GET 流式输出。
 *
 * 商品图、卖点配图等是要给所有访客看的，但 Blob store 是 private 类型，
 * `blob.url` 不能直接公开访问。前端把 URL 写成 `/api/files?pathname=<encoded>` 后，
 * 该路由用 `get()` 取出文件并以正确的 Content-Type 输出。
 *
 * 缓存策略：上传时已加随机后缀，所以 pathname 是不可变的。
 * 用 `Cache-Control: public, max-age=31536000, immutable` 让浏览器/CDN 长期缓存，
 * 同时支持 ETag 304 协商。
 */
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname")
  if (!pathname) {
    return NextResponse.json({ error: "Missing pathname" }, { status: 400 })
  }

  try {
    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    })

    if (!result) {
      return new NextResponse("Not found", { status: 404 })
    }

    // 304: 资源未修改，告诉浏览器复用缓存
    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        ETag: result.blob.etag,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[api/files] error:", error)
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 })
  }
}

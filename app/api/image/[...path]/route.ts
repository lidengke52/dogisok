import { NextRequest, NextResponse } from "next/server"
import { list } from "@vercel/blob"

/**
 * 图片代理 API — 用于访问私有 Vercel Blob 存储中的图片
 * 路径示例: /api/image/breeds/1234567-image.png
 *
 * 私有 Blob 需要在请求头中携带 Authorization: Bearer <BLOB_READ_WRITE_TOKEN>
 * 才能访问，head() 的 downloadUrl 只是 ?download=1，不携带认证信息。
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    if (!path || path.length === 0) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 })
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return NextResponse.json({ error: "Storage token not configured" }, { status: 500 })
    }

    // pathname 例：breeds/1778165103668-3a533f04.png
    const pathname = path.join("/")

    // list() 用 token 鉴权，找到完整的私有 Blob URL
    const { blobs } = await list({ prefix: pathname, limit: 1 })
    if (!blobs.length) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // 用 BLOB_READ_WRITE_TOKEN 作为 Bearer token 直接访问私有 Blob URL
    const blobUrl = blobs[0].url
    const imageRes = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: `Storage returned ${imageRes.status}` },
        { status: 502 }
      )
    }

    const buffer = await imageRes.arrayBuffer()
    const contentType = imageRes.headers.get("content-type") || "image/jpeg"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("[v0] Image proxy error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch image" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { list, head } from "@vercel/blob"

/**
 * 图片代理 API — 用于访问私有 Vercel Blob 存储中的图片
 * 路径示例: /api/image/breeds/1234567-image.png
 *
 * 原理：用 list({ prefix }) 通过路径找到完整 Blob URL，
 * 再用 head() 获取带签名的 downloadUrl，最后转发内容给浏览器。
 * 无需任何额外环境变量，BLOB_READ_WRITE_TOKEN 已自动注入。
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

    // pathname 例：breeds/1778165103668-3a533f04.png
    const pathname = path.join("/")

    // 用 list 按前缀查找，自动得到完整 Blob URL（含 store 域名），无需手动配置
    const { blobs } = await list({ prefix: pathname, limit: 1 })
    if (!blobs.length) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // head() 返回带签名的临时 downloadUrl，可直接访问私有 blob
    const metadata = await head(blobs[0].url)

    const imageRes = await fetch(metadata.downloadUrl)
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch from storage" }, { status: 502 })
    }

    const buffer = await imageRes.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": metadata.contentType || "image/jpeg",
        // 缓存 1 天（downloadUrl 是临时签名链接，不适合永久缓存）
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

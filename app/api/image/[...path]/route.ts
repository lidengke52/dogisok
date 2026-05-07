import { NextRequest, NextResponse } from "next/server"
import { head } from "@vercel/blob"

/**
 * 图片代理 API
 * 用于访问私有 Vercel Blob 存储中的图片
 * 路径示例: /api/image/breeds/1234567-image.png
 *
 * Vercel Blob 私有存储的 base URL 格式：
 *   https://<store-id>.private.blob.vercel-storage.com
 * 通过环境变量 BLOB_READ_WRITE_TOKEN 的 store ID 部分可以推算，
 * 但更简单的做法是：用 head() 拿到 downloadUrl（带签名），再 fetch 转发给前端。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    if (!path || path.length === 0) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 })
    }

    const pathname = path.join("/")

    // 用环境变量拼出完整的 Blob URL
    // BLOB_STORE_URL 格式：https://<store-id>.private.blob.vercel-storage.com
    const storeUrl = process.env.BLOB_STORE_URL
    if (!storeUrl) {
      console.error("[v0] BLOB_STORE_URL not set")
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 })
    }

    const blobUrl = `${storeUrl}/${pathname}`

    // head() 会验证文件存在并返回带有临时 downloadUrl 的元数据
    const metadata = await head(blobUrl)

    // 用 downloadUrl（已签名，可直接访问私有 blob）获取内容并转发给浏览器
    const imageRes = await fetch(metadata.downloadUrl)
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch image from storage" }, { status: 502 })
    }

    const imageBuffer = await imageRes.arrayBuffer()
    const contentType = metadata.contentType || "image/jpeg"

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
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

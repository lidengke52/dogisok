import { NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"

/**
 * 图片代理 API
 * 用于访问私有 Vercel Blob 存储中的图片
 * 路径示例: /api/image/breeds/1234567-image.png
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

    // 重构路径
    const filePath = path.join("/")

    // 从 Vercel Blob 获取文件
    const blob = await get(filePath)

    if (!blob) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // 返回文件内容和正确的 headers
    return new NextResponse(blob, {
      headers: {
        "Content-Type": blob.type || "image/jpeg",
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

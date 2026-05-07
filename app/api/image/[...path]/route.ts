import { NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    const blobPath = path.join("/")

    // 从 Vercel Blob 获取图片
    const blob = await get(blobPath)

    if (!blob) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // 获取blob的二进制数据
    const arrayBuffer = await blob.arrayBuffer()

    // 返回图片，并设置适当的缓存头
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": blob.contentType || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[v0] Image proxy error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load image" },
      { status: 500 }
    )
  }
}

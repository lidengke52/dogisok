import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const timestamp = Date.now()
    // 去除空格和特殊字符，避免 Blob list() 路径匹配失败
    const safeName = file.name.replace(/\s+/g, "-").replace(/[^\w.\-]/g, "")
    const filename = `admin-uploads/${timestamp}-${safeName}`

    console.log("[v0] Uploading:", filename, "size:", buffer.byteLength)

    const blob = await put(filename, buffer, {
      access: "private",
      contentType: file.type,
    })

    console.log("[v0] Upload complete, URL:", blob.url)

    // 验证返回的 URL
    if (!blob.url) {
      throw new Error("Blob returned no URL")
    }

    try {
      new URL(blob.url)
    } catch {
      console.error("[v0] Invalid URL from Blob:", blob.url)
      throw new Error("Invalid URL format from Blob: " + blob.url)
    }

    // 返回完整的 blob URL（http(s) 格式）供数据库存储
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Image upload error:", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

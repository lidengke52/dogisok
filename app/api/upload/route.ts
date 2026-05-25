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

    const blob = await put(filename, buffer, {
      access: "private",
      contentType: file.type,
    })

    // 私有 Blob 需要通过 /api/image 代理访问，存代理路径到数据库
    const proxyUrl = `/api/image/${blob.pathname}`
    return NextResponse.json({ url: proxyUrl })
  } catch (error) {
    console.error("[v0] Image upload error:", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

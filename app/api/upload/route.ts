import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"

/**
 * 图片上传 API
 * 
 * 当前使用：Vercel Blob (public)
 * 
 * 迁移到其他 CDN 时：
 * 1. 修改 `/lib/storage.ts` 中的存储提供商
 * 2. 在此文件中调用相应的存储服务
 * 3. 更新环境变量配置
 * 
 * 例如迁移到阿里云 OSS：
 * - 修改环境变量 NEXT_PUBLIC_STORAGE_PROVIDER=aliyun-oss
 * - 配置 OSS 凭证
 * - 实现 AliyunOSSStorage.uploadFile()
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
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

    // 上传到 Vercel Blob
    const buffer = await file.arrayBuffer()
    const timestamp = Date.now()
    const filename = `breeds/${timestamp}-${file.name}`

    const blob = await put(filename, buffer, {
      access: "public",
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Image upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"

/**
 * 图片上传 API
 * 
 * 当前使用：Vercel Blob (private + 代理)
 * 由于 Blob 存储被配置为私有访问，需要通过 /api/image 代理来获取图片
 * 
 * 迁移策略：
 * 1. 在 Vercel 控制面板改 Blob 为 public 访问
 * 2. 改此文件返回 blob.url 而不是代理 URL
 * 3. 删除 /api/image 代理 API
 * 
 * 迁移到其他 CDN 时：
 * 1. 修改 `/lib/storage.ts` 中的存储提供商
 * 2. 在此文件中调用相应的存储服务
 * 3. 更新环境变量配置
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
      access: "private",
      contentType: file.type,
    })

    // 返回代理 URL（用于访问私有 Blob）
    // 当 Blob 改为 public 时，改为返回 blob.url
    const proxyUrl = `/api/image/${blob.pathname}`

    return NextResponse.json({ url: proxyUrl })
  } catch (error) {
    console.error("[v0] Image upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}

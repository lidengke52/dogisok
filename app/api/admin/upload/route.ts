import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"

export const runtime = "nodejs"

/**
 * 管理后台图片上传：使用 Vercel Blob 客户端直传模式。
 *
 * 浏览器调用 `upload()` 时会先 POST 到这里换取一次性 token，
 * 拿到 token 后浏览器直接把文件传到 Blob 存储 —— 绕过 Next.js 4.5MB
 * 请求体上限，且原生支持多文件并发上传。
 *
 * 注意：当前项目的 Blob store 是 private（私有）类型，
 * 因此 `access` 必须为 `private`；返回的 blob.url 不能公开访问，
 * 我们用 blob.pathname 拼装 `/api/files?pathname=...` 公共代理 URL，
 * 由 `app/api/files/route.ts` 流式输出文件内容供前台展示。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // 校验 admin 身份（cookies 自动随同源 fetch 发送）
        const supabase = await createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("未登录")
        if (!(await isAdmin(user.id))) throw new Error("无权限")

        return {
          access: "private" as const,
          allowedContentTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
          addRandomSuffix: true,
          maximumSizeInBytes: 10 * 1024 * 1024, // 单文件 10 MB
          tokenPayload: JSON.stringify({ uid: user.id }),
        }
      },
      // 不提供 onUploadCompleted：沙箱/本地无公网回调域名，且我们也不需要
      // 在服务端记录上传完成事件 —— 浏览器拿到 blob.pathname 后会直接传给
      // 表单提交流程。
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("[admin/upload] error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "上传失败" },
      { status: 400 },
    )
  }
}

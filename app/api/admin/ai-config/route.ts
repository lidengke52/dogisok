import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 使用 service role 客户端绕过 RLS（已在上面验证管理员）
    const adminClient = createAdminClient()
    const { data, error } = await adminClient.from("ai_config").select("*").eq("id", "default").maybeSingle()

    if (error) {
      console.error("[Dr.Max] GET error:", error)
      throw error
    }

    // 隐藏 API Key
    if (data?.api_key) {
      data.api_key = data.api_key.substring(0, 10) + "***"
    }

    return NextResponse.json(data || null)
  } catch (error) {
    console.error("[Dr.Max] Error fetching AI config:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch configuration" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { api_url, api_key, model, system_prompt } = body

    if (!api_url || !model || !system_prompt) {
      return NextResponse.json(
        { error: "缺少必填字段（API 地址 / 模型 / 系统提示词）" },
        { status: 400 }
      )
    }

    // 使用 service role 客户端绕过 RLS（已在上面验证管理员）
    const adminClient = createAdminClient()

    // 如果 api_key 是已隐藏的预览（包含 *），则保留旧值
    let finalApiKey = api_key
    if (!finalApiKey || finalApiKey.includes("*")) {
      const { data: existing } = await adminClient
        .from("ai_config")
        .select("api_key")
        .eq("id", "default")
        .maybeSingle()
      finalApiKey = existing?.api_key || ""
    }

    if (!finalApiKey) {
      return NextResponse.json({ error: "请填写 API Key" }, { status: 400 })
    }

    // 使用 upsert 既可更新也可创建
    const { data, error } = await adminClient
      .from("ai_config")
      .upsert(
        {
          id: "default",
          api_url,
          api_key: finalApiKey,
          model,
          system_prompt,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single()

    if (error) {
      console.error("[Dr.Max] Upsert error:", error)
      throw error
    }

    // 返回成功，隐藏 API Key
    if (data?.api_key) {
      data.api_key = data.api_key.substring(0, 10) + "***"
    }

    return NextResponse.json({ message: "配置已保存成功", config: data })
  } catch (error) {
    console.error("[Dr.Max] Error saving AI config:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存配置失败" },
      { status: 500 }
    )
  }
}


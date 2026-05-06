import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/admin"
import { AiConfigForm } from "@/components/admin/ai-config-form-v2"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Dr.Max AI 配置",
  description: "配置 DeepSeek API 和系统提示词",
}

export default async function AIConfigPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/admin/ai-config")
  }

  if (!(await isAdmin(user.id))) {
    redirect("/")
  }

  // 获取当前配置（使用 service role 绕过 RLS）
  let currentConfig = null
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient.from("ai_config").select("*").eq("id", "default").maybeSingle()
    currentConfig = data
  } catch (error) {
    console.error("[Dr.Max] Error fetching config:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dr.Max AI 配置</h1>
        <p className="text-muted-foreground mt-2">配置 DeepSeek API、模型和系统提示词</p>
      </div>

      <AiConfigForm
        initialConfig={
          currentConfig
            ? {
                api_url: currentConfig.api_url,
                api_key: currentConfig.api_key,
                model: currentConfig.model,
                system_prompt: currentConfig.system_prompt,
              }
            : undefined
        }
      />
    </div>
  )
}


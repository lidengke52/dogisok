import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/admin"
import { AiConfigForm } from "@/components/admin/ai-config-form-v2"

export const dynamic = "force-dynamic"

interface ConfigData {
  id: string
  api_url: string
  api_key: string
  model: string
  system_prompt: string
  scenario_type: string
}

export default async function DrMaxAiConfigPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/admin/ai-config/dr-max")
  }

  if (!(await isAdmin(user.id))) {
    redirect("/")
  }

  // 获取 Dr. Max 场景的配置
  let config: ConfigData | null = null
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from("ai_config")
      .select("*")
      .eq("scenario_type", "dr-max")
      .maybeSingle()
    
    config = data
  } catch (error) {
    console.error("[Dr.Max Config] Error fetching config:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dr.Max AI 配置</h1>
        <p className="text-muted-foreground mt-2">配置 Dr. Max 多轮对话模式的 AI 模型、API 和系统提示词</p>
      </div>

      <AiConfigForm
        scenario="dr-max"
        initialConfig={
          config
            ? {
                api_url: config.api_url,
                api_key: config.api_key,
                model: config.model,
                system_prompt: config.system_prompt,
              }
            : undefined
        }
      />
    </div>
  )
}

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

export default async function DiseaseCheckAiConfigPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/admin/ai-config/disease-check")
  }

  if (!(await isAdmin(user.id))) {
    redirect("/")
  }

  // 获取疾病自查场景的配置
  let config: ConfigData | null = null
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from("ai_config")
      .select("*")
      .eq("scenario_type", "disease-check")
      .maybeSingle()
    
    config = data
  } catch (error) {
    console.error("[Disease Check Config] Error fetching config:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">疾病自查 AI 配置</h1>
        <p className="text-muted-foreground mt-2">配置疾病自查一次性诊断模式的 AI 模型、API 和系统提示词</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-semibold">工作模式：一次性初步诊断</h3>
        <p className="text-sm text-muted-foreground mt-2">
          基于用户输入的症状，快速提供初步诊断建议，包括可能的病因、紧急程度、家庭护理建议和危险信号。
        </p>
      </div>

      <AiConfigForm
        scenario="disease-check"
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

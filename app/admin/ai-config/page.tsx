import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/admin"
import { AiConfigPageClient } from "@/components/admin/ai-config-page-client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "AI 模型配置管理",
  description: "配置不同场景的 AI 模型、API 和系统提示词",
}

interface ConfigData {
  id: string
  api_url: string
  api_key: string
  model: string
  system_prompt: string
  scenario_type: string
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

  // 获取所有场景的配置
  let configs: Record<string, ConfigData> = {}
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient.from("ai_config").select("*")

    if (data) {
      for (const config of data) {
        configs[config.scenario_type] = config
      }
    }
  } catch (error) {
    console.error("[AI Config] Error fetching configs:", error)
  }

  return <AiConfigPageClient initialConfigs={configs} />
}

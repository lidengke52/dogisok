"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AiConfigForm } from "@/components/admin/ai-config-form-v2"

interface ConfigData {
  id: string
  api_url: string
  api_key: string
  model: string
  system_prompt: string
  scenario_type: string
}

interface AiConfigPageClientProps {
  initialConfigs: Record<string, ConfigData>
}

const SCENARIOS = [
  { id: "dr-max", label: "Dr. Max (多轮对话)", description: "AI 医生长对话模式配置" },
  { id: "disease-check", label: "疾病自查 (一次性诊断)", description: "初步症状诊断配置" },
]

export function AiConfigPageClient({ initialConfigs }: AiConfigPageClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI 模型配置管理</h1>
        <p className="text-muted-foreground mt-2">配置不同场景的 AI 模型、API 和系统提示词</p>
      </div>

      <Tabs defaultValue="dr-max" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {SCENARIOS.map((scenario) => (
            <TabsTrigger key={scenario.id} value={scenario.id}>
              {scenario.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SCENARIOS.map((scenario) => {
          const config = initialConfigs[scenario.id]
          return (
            <TabsContent key={scenario.id} value={scenario.id} className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold">{scenario.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
              </div>

              <AiConfigForm
                scenario={scenario.id}
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
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

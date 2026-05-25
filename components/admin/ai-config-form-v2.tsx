"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface AiConfigFormProps {
  scenario?: string
  initialConfig?: {
    api_url: string
    api_key: string
    model: string
    system_prompt: string
  }
}

export function AiConfigForm({ scenario = "dr-max", initialConfig }: AiConfigFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [testError, setTestError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState("")

  const [formData, setFormData] = useState({
    api_url: initialConfig?.api_url || "https://api.deepseek.com/chat/completions",
    api_key: initialConfig?.api_key || "",
    model: initialConfig?.model || "deepseek-v4-pro",
    system_prompt: initialConfig?.system_prompt || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTestConnection = async () => {
    setTestStatus("testing")
    setTestError("")
    try {
      const response = await fetch("/api/admin/ai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_url: formData.api_url,
          api_key: formData.api_key,
          model: formData.model,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setTestStatus("error")
        setTestError(data.error || "连接失败")
        return
      }

      setTestStatus("success")
      setTestError("")
    } catch (error) {
      setTestStatus("error")
      setTestError(error instanceof Error ? error.message : "连接失败")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/ai-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            scenario,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || error.message || "保存失败")
        }

        const result = await response.json()
        setSuccessMessage(result.message || "配置已保存成功！")
        setTimeout(() => setSuccessMessage(""), 3000)
        router.refresh()
      } catch (error) {
        alert(error instanceof Error ? error.message : "保存失败")
      }
    })
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel>API 地址</FieldLabel>
          <Input
            name="api_url"
            value={formData.api_url}
            onChange={handleChange}
            placeholder="https://api.deepseek.com/chat/completions"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">DeepSeek API 完整端点地址</p>
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel>API Key</FieldLabel>
          <Input
            name="api_key"
            type="password"
            value={formData.api_key}
            onChange={handleChange}
            placeholder="sk-..."
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            从 <a href="https://platform.deepseek.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">https://platform.deepseek.com</a> 获取
          </p>
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel>模型</FieldLabel>
          <Input
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="deepseek-v4-pro"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">默认为 deepseek-v4-pro，可选其他可用模型</p>
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel>系统提示词</FieldLabel>
          <Textarea
            name="system_prompt"
            value={formData.system_prompt}
            onChange={handleChange}
            placeholder="输入 Dr.Max 的系统提示词..."
            rows={10}
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">定义 Dr.Max 的角色、行为准则和内容护栏</p>
        </Field>
      </FieldGroup>

      {testError && (
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
          <div>
            <p className="font-medium text-destructive">连接测试失败</p>
            <p className="text-sm text-destructive/80">{testError}</p>
          </div>
        </div>
      )}

      {testStatus === "success" && (
        <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
          <p className="font-medium text-green-600">连接成功！</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
          <p className="font-medium text-green-600">{successMessage}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleTestConnection}
          disabled={pending || testStatus === "testing"}
        >
          {testStatus === "testing" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          测试连接
        </Button>
        <Button type="submit" disabled={pending || testStatus === "testing"}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          保存配置
        </Button>
      </div>
    </form>
  )
}

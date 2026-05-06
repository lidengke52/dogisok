"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/field";

interface AIConfig {
  key: string;
  api_key: string;
  base_url: string;
  system_prompt: string;
  updated_at?: string;
}

export function AIConfigForm() {
  const router = useRouter();
  const [config, setConfig] = useState<AIConfig>({
    key: "deepseek",
    api_key: "",
    base_url: "https://api.deepseek.com",
    system_prompt: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 加载现有配置
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/ai-config");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (error) {
        console.error("[v0] Failed to load AI config:", error);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  // 保存配置
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ai-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setTestResult({ success: true, message: "Configuration saved successfully" });
        setTimeout(() => setTestResult(null), 3000);
      } else {
        const error = await res.json();
        setTestResult({ success: false, message: error.error });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to save configuration",
      });
    } finally {
      setSaving(false);
    }
  }

  // 测试连接
  async function handleTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: config.api_key,
          base_url: config.base_url,
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Test failed",
      });
    } finally {
      setTesting(false);
    }
  }

  // 复制默认提示词
  function copyDefaultPrompt() {
    const defaultPrompt = `你是专业的宠物医生Dr. Max。你必须严格遵守以下2条核心规则：

## 1. 角色与职责边界（System Prompt）
- 你的职责仅限于基于宠物医疗知识库回答关于宠物健康、疾病、护理等方面的问题。
- **严禁回答任何与宠物医疗无关的话题**，包括但不限于政治、财经、娱乐、日常生活闲聊等。
- 当用户提问超出范围时，请统一回复："抱歉，我是一名宠物医生，只能回答与宠物健康相关的问题。"

## 2. 内容护栏（Guardrails）
你需要在理解用户提问和生成回答时，自动执行以下过滤：
- **关键词拦截**：如果用户提问中包含任何非医疗、敏感或违规词汇（如暴力、色情、政治等），直接拒绝回答并回复："抱歉，您的问题涉及不合规内容，我只能解答宠物健康问题。"
- **话题限定**：时刻判断当前对话是否偏离宠物医疗主题。一旦发现跑题，立即重定向并回复第1条中的标准拒绝语句。
- **敏感词过滤**：在你的生成内容中，不得出现任何不恰当、不文明或可能引起误解的表述。确保所有输出专业、温和且安全。

请始终以宠物健康为首要准则，提供准确、有帮助且安全的回答。用客户的提问语种，输出对应的语种。`;
    setConfig({ ...config, system_prompt: defaultPrompt });
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Dr. Max AI 配置</h2>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="base-url">API Base URL</FieldLabel>
            <Input
              id="base-url"
              placeholder="https://api.deepseek.com"
              value={config.base_url}
              onChange={(e) =>
                setConfig({ ...config, base_url: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              DeepSeek API 的基础 URL，默认为官方 API 端点
            </p>
          </Field>

          <Field>
            <FieldLabel htmlFor="api-key">API Key</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.api_key}
                onChange={(e) =>
                  setConfig({ ...config, api_key: e.target.value })
                }
              />
              {config.api_key.includes("***") && (
                <span className="text-xs text-muted-foreground pt-2">
                  (已加密)
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              从 DeepSeek 平台获取的 API 密钥
            </p>
          </Field>

          <Field>
            <div className="flex items-center justify-between mb-2">
              <FieldLabel htmlFor="system-prompt">系统提示词</FieldLabel>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyDefaultPrompt}
                className="gap-1.5"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    使用默认
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="system-prompt"
              placeholder="输入 Dr. Max 的系统提示词..."
              value={config.system_prompt}
              onChange={(e) =>
                setConfig({ ...config, system_prompt: e.target.value })
              }
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              定义 Dr. Max 的角色和行为准则
            </p>
          </Field>
        </FieldGroup>

        {testResult && (
          <div
            className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
              testResult.success
                ? "bg-emerald-50 text-emerald-900"
                : "bg-red-50 text-red-900"
            }`}
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{testResult.message}</p>
              {testResult.success && config.updated_at && (
                <p className="text-sm mt-1">
                  上次更新: {new Date(config.updated_at).toLocaleString("zh-CN")}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button onClick={handleTest} disabled={testing || !config.api_key}>
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                测试连接中...
              </>
            ) : (
              "测试连接"
            )}
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={saving || !config.api_key || !config.system_prompt}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              "保存配置"
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">帮助信息</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>API Key 可从 https://platform.deepseek.com 获取</li>
          <li>配置保存后会立即生效</li>
          <li>API Key 在数据库中加密存储</li>
          <li>修改系统提示词会改变 Dr. Max 的回答风格</li>
        </ul>
      </Card>
    </div>
  );
}

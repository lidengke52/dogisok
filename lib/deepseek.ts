import { openai } from "@ai-sdk/openai"
import { generateText, streamText, Message } from "ai"
import { getOrInitializeAiConfig } from "@/lib/ai-config"

// 获取 AI 配置（从数据库）
async function getAIConfig() {
  try {
    const config = await getOrInitializeAiConfig()
    
    return {
      apiKey: config.api_key || "",
      apiUrl: config.api_url || "https://api.deepseek.com/chat/completions",
      model: config.model || "deepseek-v4-pro",
      systemPrompt: config.system_prompt || getDefaultSystemPrompt(),
    }
  } catch (error) {
    console.error("[Dr.Max] Failed to get AI config, using defaults:", error)
    // Return fallback config if database fails
    return {
      apiKey: process.env.DEEPSEEK_API_KEY || "",
      apiUrl: "https://api.deepseek.com/chat/completions",
      model: "deepseek-v4-pro",
      systemPrompt: getDefaultSystemPrompt(),
    }
  }
}

// 默认系统提示词
function getDefaultSystemPrompt() {
  return `You are Dr. Max, a professional veterinary assistant. You must strictly follow these core rules:

## 1. Role and Responsibilities
- Your role is limited to answering questions about pet health, diseases, and care based on veterinary knowledge.
- NEVER answer questions unrelated to pet health, including politics, finance, entertainment, or casual chat.
- When users ask out-of-scope questions, respond: "I'm sorry, I'm a veterinary doctor and can only answer questions related to pet health."

## 2. Content Safety (Guardrails)
You must implement the following filters when understanding user questions and generating responses:
- **Keyword Blocking**: If user input contains non-medical, sensitive or prohibited words (violence, adult content, politics, etc.), refuse and respond: "I'm sorry, your question contains inappropriate content. I can only answer pet health questions."
- **Topic Limiting**: Constantly judge if the conversation is drifting from pet healthcare topics. If so, immediately redirect with the standard refusal from rule 1.
- **Sensitive Language Filtering**: Ensure your responses contain no inappropriate, unprofessional or misleading language. Keep all output professional, gentle and safe.

Always prioritize pet health. Provide accurate, helpful and safe answers. Respond in the same language as the user's question.`
}

// 创建 DeepSeek 客户端
function createDeepSeekClient(config: { apiKey: string; apiUrl: string; model: string }) {
  return openai({
    apiKey: config.apiKey,
    baseURL: config.apiUrl.replace("/chat/completions", ""), // Remove endpoint path
    defaultModel: config.model,
  })
}

// 流式回复（用于实时对话）
export async function streamDrMaxResponse(
  userMessage: string,
  conversationHistory: Message[] = []
) {
  const config = await getAIConfig()

  if (!config.apiKey) {
    throw new Error("DeepSeek API Key 未配置")
  }

  const client = createDeepSeekClient({
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
    model: config.model,
  })

  const messages: Message[] = [
    ...conversationHistory,
    {
      role: "user",
      content: userMessage,
    },
  ]

  return streamText({
    model: client(config.model),
    system: config.systemPrompt,
    messages,
  })
}

// 非流式回复（用于快速响应）
export async function getDrMaxResponse(
  userMessage: string,
  conversationHistory: Message[] = []
) {
  const config = await getAIConfig()

  if (!config.apiKey) {
    throw new Error("DeepSeek API Key 未配置")
  }

  const client = createDeepSeekClient({
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
    model: config.model,
  })

  const messages: Message[] = [
    ...conversationHistory,
    {
      role: "user",
      content: userMessage,
    },
  ]

  const result = await generateText({
    model: client(config.model),
    system: config.systemPrompt,
    messages,
  })

  return result.text
}

// 导出配置获取函数供后台使用
export { getAIConfig, getDefaultSystemPrompt }

import { streamDrMaxResponse } from "@/lib/deepseek"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Message } from "ai"

export const runtime = "nodejs"

const TRUSTED_PARTNER_COOKIE = "pawsareok"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), { status: 400 })
    }

    // 获取最后一条用户消息
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== "user") {
      return new Response(JSON.stringify({ error: "Last message must be from user" }), { status: 400 })
    }

    // 获取当前用户（用于记录）
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 检查合作伙伴 cookie（pawsareok.com 免登录访问）
    const cookieStore = await cookies()
    const partnerCookie = cookieStore.get("partner_access")?.value
    const isPartnerAccess = partnerCookie === TRUSTED_PARTNER_COOKIE

    if (!user && !isPartnerAccess) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    // 将 messages 转换为 AI SDK 格式的 Message 数组（去掉最后一个用户消息，因为 streamDrMaxResponse 会添加）
    const conversationHistory: Message[] = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // 调用 DeepSeek API 获取流式响应
    const result = await streamDrMaxResponse(lastMessage.content, conversationHistory)

    // 记录到数据库（可选）
    if (user) {
      supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          user_message: lastMessage.content,
          created_at: new Date().toISOString(),
        })
        .catch((err) => console.warn("[Dr.Max] Failed to log conversation:", err))
    }

    // 返回流式文本
    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[Dr.Max] API error:", error)

    if (error instanceof Error) {
      if (error.message.includes("API Key")) {
        return new Response(
          JSON.stringify({
            error: "AI service is not configured. Please configure DeepSeek API key in admin panel.",
          }),
          { status: 503 }
        )
      }
    }

    return new Response(JSON.stringify({ error: "Failed to get response from Dr. Max" }), {
      status: 500,
    })
  }
}


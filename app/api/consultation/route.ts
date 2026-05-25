import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { createClient } from "@/lib/supabase/server"
import { getOrInitializeAiConfig } from "@/lib/ai-config"

export const maxDuration = 60

const GENERIC_ERROR = "Dr. Max is temporarily unavailable. Please try again in a moment."

export async function POST(req: Request) {
  // Auth guard: AI Doctor is login-only
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: "Please sign in to continue." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  }

  try {
    const body = await req.json()
    
    // DefaultChatTransport sends { messages: Array<{type: string; parts: [{type: "text"; text: string}] | similar}> }
    // Convert to standard Message format: Array<{ role: "user" | "assistant"; content: string }>
    const incomingMessages = body.messages || []
    
    let messages: Array<{ role: "user" | "assistant"; content: string }> = []
    
    for (const msg of incomingMessages) {
      if (!msg.parts || msg.parts.length === 0) continue
      
      // Extract text from parts
      const text = msg.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("")
      
      if (text) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: text,
        })
      }
    }

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "No message content" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      })
    }

    console.log("[v0] Dr.Max consultation messages:", messages)

    // Load admin-configured AI settings from DB (api_url, api_key, model, system_prompt)
    const config = await getOrInitializeAiConfig()

    if (!config.api_key) {
      console.error("[v0] Dr.Max: missing API key in ai_config")
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
        status: 500,
        headers: { "content-type": "application/json" },
      })
    }

    // DeepSeek exposes an OpenAI-compatible chat completions API.
    // createOpenAI expects the baseURL WITHOUT the trailing /chat/completions.
    const baseURL = (config.api_url || "https://api.deepseek.com/chat/completions").replace(
      /\/chat\/completions\/?$/,
      "",
    )

    console.log("[v0] Dr.Max config:", { baseURL, model: config.model })

    const provider = createOpenAI({
      baseURL,
      apiKey: config.api_key,
      // DeepSeek is OpenAI-compatible only at /chat/completions, not the new /responses endpoint
      compatibility: "compatible",
    })

    const result = streamText({
      // .chat() forces /chat/completions endpoint. Default provider() uses /responses which DeepSeek does not support.
      model: provider.chat(config.model || "deepseek-chat"),
      system: config.system_prompt,
      messages,
      abortSignal: req.signal,
    })

    // Use toUIMessageStreamResponse to match DefaultChatTransport format
    return result.toUIMessageStreamResponse({
      onError: (err) => {
        console.error("[v0] Dr.Max stream error:", err)
        return GENERIC_ERROR
      },
    })
  } catch (err) {
    console.error("[v0] Dr.Max request error:", err)
    if (err instanceof Error) {
      console.error("[v0] Error details:", err.message, err.stack)
    }
    return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
}


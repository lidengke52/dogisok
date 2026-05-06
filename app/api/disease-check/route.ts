import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { getAiConfigByScenario } from "@/lib/ai-config"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

const GENERIC_ERROR = "The assessment service is temporarily unavailable. Please try again in a moment."

type Payload = {
  breed?: string
  petName?: string
  neutered?: "spayed" | "intact" | ""
  birthday?: string
  sex?: "male" | "female" | ""
  areas?: string[]
  subSymptoms?: Record<string, string[]>
  description?: string
  attachments?: Array<{ pathname: string; name: string }>
}

function calcAge(birthday?: string) {
  if (!birthday) return ""
  const d = new Date(birthday)
  if (Number.isNaN(d.getTime())) return ""
  const now = new Date()
  const months =
    (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()) - (now.getDate() < d.getDate() ? 1 : 0)
  if (months < 12) return `${Math.max(months, 0)} month(s) old`
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  return remMonths === 0 ? `${years} year(s) old` : `${years} year(s) ${remMonths} month(s) old`
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Please sign in to use the self-check service." }, { status: 401 })
    }

    const body = (await req.json()) as Payload
    const { breed, petName, neutered, birthday, sex, areas, subSymptoms, description, attachments } = body ?? {}

    if (!breed || typeof breed !== "string" || breed.trim().length === 0) {
      return Response.json({ error: "Breed is required." }, { status: 400 })
    }

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return Response.json(
        { error: "Please describe the symptoms in more detail (at least 10 characters)." },
        { status: 400 },
      )
    }

    const ageText = calcAge(birthday)
    const sexText = sex === "male" ? "Male" : sex === "female" ? "Female" : "Unknown"
    const neuterText = neutered === "spayed" ? "Spayed/Neutered" : neutered === "intact" ? "Intact" : "Unknown"

    const areaLines: string[] = []
    if (Array.isArray(areas) && areas.length > 0) {
      for (const area of areas) {
        const subs = (subSymptoms?.[area] ?? []).filter(Boolean)
        if (subs.length > 0) {
          areaLines.push(`- ${area}: ${subs.join(", ")}`)
        } else {
          areaLines.push(`- ${area}`)
        }
      }
    }

    const attachmentNote =
      Array.isArray(attachments) && attachments.length > 0
        ? `The user attached ${attachments.length} photo(s) of the affected area: ${attachments
            .map((a) => a.name)
            .join(", ")}. (Photos are stored privately and not shown to you, but acknowledge they exist.)`
        : "No photos attached."

    const prompt = [
      `Breed: ${breed.trim()}`,
      petName ? `Pet name: ${petName.trim()}` : null,
      `Sex: ${sexText}`,
      `Neuter status: ${neuterText}`,
      ageText ? `Age: ${ageText}` : null,
      "",
      areaLines.length > 0 ? "Symptom areas selected:" : "Symptom areas: (none specified)",
      ...areaLines,
      "",
      "Owner's description:",
      description.trim(),
      "",
      attachmentNote,
    ]
      .filter((line) => line !== null)
      .join("\n")

    // 从数据库获取疾病自查配置
    const diseaseCheckConfig = await getAiConfigByScenario("disease-check")
    
    if (!diseaseCheckConfig.api_key) {
      console.error("[disease-check] error: API Key not configured")
      return Response.json({ error: GENERIC_ERROR }, { status: 500 })
    }
    
    // 创建自定义 API 客户端（按 OpenAI 兼容模式）
    const baseURL = (diseaseCheckConfig.api_url || "https://api.deepseek.com/chat/completions").replace(
      /\/chat\/completions\/?$/,
      "",
    )
    
    const provider = createOpenAI({
      baseURL,
      apiKey: diseaseCheckConfig.api_key,
      compatibility: "compatible",
    })
    
    const result = await generateText({
      model: provider.chat(diseaseCheckConfig.model),
      system: diseaseCheckConfig.system_prompt,
      prompt,
      abortSignal: req.signal,
    })

    return Response.json({ text: result.text })
  } catch (err) {
    console.error("[disease-check] error:", err)
    return Response.json({ error: GENERIC_ERROR }, { status: 500 })
  }
}

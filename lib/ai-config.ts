import { createAdminClient } from "@/lib/supabase/admin"

const DEEPSEEK_DEFAULT_CONFIG = {
  api_url: "https://api.deepseek.com/chat/completions",
  api_key: "",
  model: "deepseek-v4-pro",
  system_prompt: `You are "Dr. Max", a friendly and professional AI veterinary assistant.

STRICT SCOPE
- You ONLY answer questions related to dog and cat health, behavior, nutrition, training, grooming, and general pet care.
- If the user asks anything outside pet care (politics, coding, finance, human medicine, celebrity news, etc.), politely decline in one sentence and redirect them back to pet-related topics.
- Never diagnose with certainty. Always frame your answer as educational guidance, and encourage professional veterinary examination when symptoms are serious, persistent, or ambiguous.

RESPONSE STYLE
- Warm, calm, and empathetic. Use plain language, avoid jargon.
- Be concise. Prefer short paragraphs and bullet points over long walls of text.
- When giving advice, structure your answer as: 1) likely causes, 2) what to do at home, 3) red flags that require an in-person vet visit.
- ALWAYS respond in English. Do not output Chinese or any other language.

SAFETY
- If the user describes life-threatening symptoms (collapse, seizure, severe bleeding, difficulty breathing, suspected poisoning, bloat, heatstroke), IMMEDIATELY tell them to go to an emergency vet RIGHT NOW before anything else.
- Never recommend specific prescription medications or dosages. You may mention general categories (e.g. "antihistamines your vet may prescribe") but not brands or dosages.
- Do not encourage users to avoid professional vets.

FORMAT
- Use markdown for structure (headings, bullets, bold for emphasis).
- Keep each response under 400 words unless the user asks for more detail.`,
}

// 获取指定场景的配置
export async function getAiConfigByScenario(scenario: string = "dr-max") {
  try {
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from("ai_config")
      .select("*")
      .eq("scenario_type", scenario)
      .maybeSingle()

    // If there's an error accessing the table, fall back to default config
    if (error) {
      console.log(`[AI Config] Using default config for scenario "${scenario}" - table may not exist yet:`, error.message)
      return DEEPSEEK_DEFAULT_CONFIG
    }

    // If data exists, use it
    if (data) {
      return data
    }

    // If no data but table exists, return default
    console.log(`[AI Config] No config found for scenario "${scenario}", using default`)
    return DEEPSEEK_DEFAULT_CONFIG
  } catch (error) {
    console.error(`[AI Config] Error getting AI config for scenario "${scenario}":`, error)
    // Always return default config as fallback
    return DEEPSEEK_DEFAULT_CONFIG
  }
}

// 向后兼容：获取 Dr. Max 配置
export async function getOrInitializeAiConfig() {
  return getAiConfigByScenario("dr-max")
}

export async function updateAiConfig(config: {
  api_url?: string
  api_key?: string
  model?: string
  system_prompt?: string
}, scenario: string = "dr-max") {
  try {
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from("ai_config")
      .update(config)
      .eq("scenario_type", scenario)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error(`[AI Config] Error updating AI config for scenario "${scenario}":`, error)
    throw error
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

const DEFAULT_SYSTEM_PROMPT = `你是专业的宠物医生Dr. Max。你必须严格遵守以下2条核心规则：

## 1. 角色与职责边界（System Prompt）
- 你的职责仅限于基于宠物医疗知识库回答关于宠物健康、疾病、护理等方面的问题。
- **严禁回答任何与宠物医疗无关的话题**，包括但不限于政治、财经、娱乐、日常生活闲聊等。
- 当用户提问超出范围时，请统一回复："抱歉，我是一名宠物医生，只能回答与宠物健康相关的问题。"

## 2. 内容护栏（Guardrails）
你需要在理解用户提问和生成回答时，自动执行以下过滤：
- **关键词拦截**：如果用户提问中包含任何非医疗、敏感或违规词汇（如暴力、色情、政治等），直接拒绝回答并回复："抱歉，您的问题涉及不合规内容，我只能解答宠物健康问题。"
- **话题限定**：时刻判断当前对话是否偏离宠物医疗主题。一旦发现跑题，立即重定向并回复第1条中的标准拒绝语句。
- **敏感词过滤**：在你的生成内容中，不得出现任何不恰当、不文明或可能引起误解的表述。确保所有输出专业、温和且安全。

请始终以宠物健康为首要准则，提供准确、有帮助且安全的回答。用客户的提问语种，输出对应的语种。`

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 尝试直接插入，如果表不存在会得到错误
    const { data: existing, error: checkError } = await supabase
      .from("ai_config")
      .select("id")
      .eq("id", "default")
      .single()

    if (checkError?.code === "PGRST116") {
      // 表不存在或没有该记录，尝试创建
      console.log("[Dr.Max] Attempting to create ai_config table...")

      // 首先插入默认配置，这会自动创建表如果不存在（如果表定义在 Supabase 中）
      const { data, error } = await supabase
        .from("ai_config")
        .insert([
          {
            id: "default",
            api_url: "https://api.deepseek.com/chat/completions",
            api_key: "sk-7047f35e0aff4394a0aa5fb6dc46ae8a",
            model: "deepseek-v4-pro",
            system_prompt: DEFAULT_SYSTEM_PROMPT,
            is_active: true,
          },
        ])
        .select()

      if (error) {
        console.error("[Dr.Max] Insert error:", error)
        return NextResponse.json(
          {
            error: "表不存在，请在 Supabase SQL Editor 中执行以下 SQL：",
            sql: `
CREATE TABLE IF NOT EXISTS ai_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'deepseek-v4-pro',
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read ai_config" ON ai_config;
CREATE POLICY "Admins can read ai_config"
  ON ai_config FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update ai_config" ON ai_config;  
CREATE POLICY "Admins can update ai_config"
  ON ai_config FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert ai_config" ON ai_config;
CREATE POLICY "Admins can insert ai_config"
  ON ai_config FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
            `,
          },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "AI 配置表已创建并初始化默认配置",
        data,
      })
    }

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError
    }

    // 表已存在且有默认配置
    return NextResponse.json({
      success: true,
      message: "AI 配置表已存在",
      existing,
    })
  } catch (error) {
    console.error("[Dr.Max] Setup error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "初始化失败",
      },
      { status: 500 }
    )
  }
}


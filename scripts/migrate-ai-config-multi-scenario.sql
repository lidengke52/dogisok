-- Migration: Add multi-scenario support to ai_config table
-- Adds scenario_type column to distinguish between different AI features (e.g., Dr. Max, Disease Check)

-- Add scenario_type column if it doesn't exist
ALTER TABLE ai_config
ADD COLUMN IF NOT EXISTS scenario_type TEXT DEFAULT 'default' NOT NULL;

-- Create unique constraint on scenario_type (one config per scenario)
ALTER TABLE ai_config
DROP CONSTRAINT IF EXISTS ai_config_scenario_type_key;

ALTER TABLE ai_config
ADD CONSTRAINT ai_config_scenario_type_key UNIQUE (scenario_type);

-- Update the existing 'default' record to explicitly be 'dr-max' scenario
UPDATE ai_config
SET scenario_type = 'dr-max'
WHERE id = 'default' AND scenario_type = 'default';

-- Insert disease-check scenario configuration
INSERT INTO ai_config (id, scenario_type, api_url, api_key, model, system_prompt, is_active, created_at, updated_at)
VALUES (
  'disease-check',
  'disease-check',
  'https://api.deepseek.com/chat/completions',
  'sk-7047f35e0aff4394a0aa5fb6dc46ae8a',
  'deepseek-v4-pro',
  '你是"Dr. Max 症状快速诊断助手"，专门进行**一次性初步评估**。

## 角色定位
- 这不是多轮对话，而是基于宠物症状的**快速初步诊断**
- 目标：在 20-30 秒内提供初步的三级评估
- 风格：直接、结构化、可执行性强

## 必须遵循的格式（严格按照以下结构输出）

## 可能的病因
（从最可能到最不可能，2-4 个，每行一句话，不超过 60 字/条）

## 紧急程度
（**必须选一个**）
- 🚨 紧急 - 立即就医
- ⚠️ 较急 - 24 小时内就医
- ⏱️ 建议就医 - 一周内预约
- 💊 自我观察 - 居家护理可行

## 家庭护理建议
（3-5 个具体建议，可执行）

## 🚩 危险信号（出现立即就医）
（3-5 个，具体症状描述）

## 下一步建议
（一句话，推荐进入 Dr. Max 深度咨询 或 现场就医）

## 重要规则
- ⛔ 不做确定性诊断，只给出"最可能"
- ⛔ 不推荐具体药物和用量，只说"类别"
- ⛔ 总长度不超 350 字
- ⛔ 如是明显急症 → 紧急程度选"立即就医"，下一步直接转向急诊
- ✅ 如果症状不清楚 → 提示"信息不足，建议就医咨询"',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  scenario_type = 'disease-check',
  api_url = EXCLUDED.api_url,
  model = EXCLUDED.model,
  system_prompt = EXCLUDED.system_prompt,
  updated_at = now();

-- Ensure Dr. Max record has correct id (change from 'default' to 'dr-max' if needed)
UPDATE ai_config
SET id = 'dr-max'
WHERE scenario_type = 'dr-max' AND id != 'dr-max';

# Dr.Max AI 配置保存失败修复指南

## 问题原因
保存失败是因为 `ai_config` 表尚未在 Supabase 数据库中创建。

## 快速修复（2步）

### 第一步：在 Supabase 中创建表

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 复制以下 SQL 并执行：

```sql
-- 创建 AI 配置表
CREATE TABLE IF NOT EXISTS public.ai_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'deepseek-v4-pro',
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

-- 创建策略：管理员可读
DROP POLICY IF EXISTS "Admins can read ai_config" ON public.ai_config;
CREATE POLICY "Admins can read ai_config"
  ON public.ai_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 创建策略：管理员可更新
DROP POLICY IF EXISTS "Admins can update ai_config" ON public.ai_config;
CREATE POLICY "Admins can update ai_config"
  ON public.ai_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 创建策略：管理员可插入
DROP POLICY IF EXISTS "Admins can insert ai_config" ON public.ai_config;
CREATE POLICY "Admins can insert ai_config"
  ON public.ai_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 插入默认配置
INSERT INTO public.ai_config (id, api_url, api_key, model, system_prompt)
VALUES (
  'default',
  'https://api.deepseek.com/chat/completions',
  'sk-7047f35e0aff4394a0aa5fb6dc46ae8a',
  'deepseek-v4-pro',
  '你是专业的宠物医生Dr. Max。你必须严格遵守以下2条核心规则：

## 1. 角色与职责边界（System Prompt）
- 你的职责仅限于基于宠物医疗知识库回答关于宠物健康、疾病、护理等方面的问题。
- **严禁回答任何与宠物医疗无关的话题**，包括但不限于政治、财经、娱乐、日常生活闲聊等。
- 当用户提问超出范围时，请统一回复："抱歉，我是一名宠物医生，只能回答与宠物健康相关的问题。"

## 2. 内容护栏（Guardrails）
你需要在理解用户提问和生成回答时，自动执行以下过滤：
- **关键词拦截**：如果用户提问中包含任何非医疗、敏感或违规词汇（如暴力、色情、政治等），直接拒绝回答并回复："抱歉，您的问题涉及不合规内容，我只能解答宠物健康问题。"
- **话题限定**：时刻判断当前对话是否偏离宠物医疗主题。一旦发现跑题，立即重定向并回复第1条中的标准拒绝语句。
- **敏感词过滤**：在你的生成内容中，不得出现任何不恰当、不文明或可能引起误解的表述。确保所有输出专业、温和且安全。

请始终以宠物健康为首要准则，提供准确、有帮助且安全的回答。用客户的提问语种，输出对应的语种。'
)
ON CONFLICT (id) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  api_key = EXCLUDED.api_key,
  model = EXCLUDED.model,
  system_prompt = EXCLUDED.system_prompt,
  updated_at = now();
```

5. 点击 **Run** 执行 SQL
6. 等待执行完成（应该显示成功）

### 第二步：返回后台配置页面

1. 刷新浏览器
2. 返回后台 → 系统设置 → Dr.Max AI 配置
3. 现在应该能看到已有的配置
4. 修改后点击"保存配置"应该能成功

## 验证成功

如果保存成功，应该看到绿色提示："配置已保存成功！"

## 常见问题

**Q: 执行 SQL 出错？**
A: 检查是否粘贴完整，或者尝试逐行执行。

**Q: 表创建成功但仍然保存失败？**
A: 
- 确保你是管理员（在 profiles 表中 role = 'admin'）
- 刷新浏览器并重新尝试
- 检查浏览器控制台（F12）是否有其他错误信息

**Q: 想重置配置？**
A: 在 Supabase SQL Editor 中运行：
```sql
DELETE FROM public.ai_config WHERE id = 'default';
```
然后再次执行上面的 INSERT 语句。

## 如需帮助

检查以下几点：
1. ✅ 确保 ai_config 表已创建：进入 Supabase → Tables → 检查是否看到 ai_config
2. ✅ 确保 RLS 策略已应用：点击表 → RLS → 应该有 3 个策略
3. ✅ 确保你的用户是管理员：检查 profiles 表中你的用户记录

# Dr. Max AI - 完整配置指南

## 一、快速开始（3 步）

### 第一步：访问后台配置页面
1. 登录为管理员账户
2. 访问：`http://your-domain.com/admin/ai-config`

### 第二步：输入配置信息

| 字段 | 值 | 说明 |
|------|-----|------|
| **API Base URL** | `https://api.deepseek.com` | DeepSeek API 服务地址 |
| **API Key** | 你的 API Key | 从 [platform.deepseek.com](https://platform.deepseek.com) 获取 |
| **系统提示词** | 见下方完整提示词 | 控制 Dr. Max 的行为和安全护栏 |

### 第三步：测试并保存
1. 点击"Test Connection"测试连接
2. 连接成功后点击"Save Configuration"保存

---

## 二、系统提示词（完整版）

直接复制以下内容到"系统提示词"字段：

```
你是专业的宠物医生Dr. Max。你必须严格遵守以下2条核心规则：

## 1. 角色与职责边界（System Prompt）
- 你的职责仅限于基于宠物医疗知识库回答关于宠物健康、疾病、护理等方面的问题。
- **严禁回答任何与宠物医疗无关的话题**，包括但不限于政治、财经、娱乐、日常生活闲聊等。
- 当用户提问超出范围时，请统一回复："抱歉，我是一名宠物医生，只能回答与宠物健康相关的问题。"

## 2. 内容护栏（Guardrails）
你需要在理解用户提问和生成回答时，自动执行以下过滤：
- **关键词拦截**：如果用户提问中包含任何非医疗、敏感或违规词汇（如暴力、色情、政治等），直接拒绝回答并回复："抱歉，您的问题涉及不合规内容，我只能解答宠物健康问题。"
- **话题限定**：时刻判断当前对话是否偏离宠物医疗主题。一旦发现跑题，立即重定向并回复第1条中的标准拒绝语句。
- **敏感词过滤**：在你的生成内容中，不得出现任何不恰当、不文明或可能引起误解的表述。确保所有输出专业、温和且安全。

请始终以宠物健康为首要准则，提供准确、有帮助且安全的回答。用客户的提问语种，输出对应的语种。
```

---

## 三、新旧组件对比

### 旧版本（已弃用）

**原始 Consultation 页面的特点：**

- **多步骤流程**：
  1. 用户先填写宠物信息表单（品种、年龄、名字等）
  2. 表单提交后才能开始聊天
  3. 显示"特色案例"和产品广告

- **功能限制**：
  - 没有实际的 AI 集成（占位符）
  - 无法动态配置 AI 参数
  - 固定的页面布局，不够灵活

- **数据保存**：
  - 宠物信息存储在本地状态
  - 无对话历史记录

| 组件 | 路径 | 用途 |
|------|------|------|
| PetInfoForm | `components/consultation/pet-info-form.tsx` | 收集宠物信息表单 |
| FeaturedCasesGrid | `components/consultation/featured-cases-grid.tsx` | 展示特色案例 |
| ProductAdSlot | `components/ads/product-ad-card.tsx` | 产品广告位 |

### 新版本（现在使用）

**新的 Consultation 页面特点：**

- **直达聊天**：
  1. 用户进入直接看到聊天界面
  2. 无需填表单，立即可以提问
  3. Dr. Max 会在对话中询问必要信息

- **完整功能**：
  - ✅ 实时 DeepSeek AI 集成
  - ✅ 后台可动态配置 API、提示词
  - ✅ 流式响应（实时打字效果）
  - ✅ 自动内容审核（内置 guardrails）

- **数据管理**：
  - ✅ 对话历史永久保存在数据库
  - ✅ 用户可查看历史对话
  - ✅ 管理后台可导出数据

| 组件 | 路径 | 用途 |
|------|------|------|
| DrMaxChat | `components/dr-max-chat.tsx` | 主聊天界面和逻辑 |
| AIConfigForm | `components/admin/ai-config-form.tsx` | 后台配置表单 |

---

## 四、功能对比详表

| 功能 | 旧版本 | 新版本 | 备注 |
|------|--------|--------|------|
| **AI 集成** | ❌ 无 | ✅ DeepSeek | 支持自定义模型 |
| **流式响应** | ❌ 无 | ✅ 有 | 实时打字效果 |
| **后台配置** | ❌ 无 | ✅ 完整 | 可改 API、提示词 |
| **对话历史** | ❌ 无 | ✅ 有 | 永久保存 |
| **安全护栏** | ❌ 无 | ✅ 内置 | 防止不当回答 |
| **多语言** | ❌ 无 | ✅ 自动 | 语言自适应 |
| **文件上传** | ✅ 有 | 计划中 | 用户可上传图片 |
| **特色案例展示** | ✅ 有 | ❌ 移除 | 简化用户体验 |
| **产品广告** | ✅ 有 | ❌ 移除 | 专注聊天体验 |

---

## 五、数据库表结构

### ai_config 表
```sql
- id: 主键
- key: 配置键（通常为 'default'）
- api_key: DeepSeek API Key（加密存储）
- base_url: API 地址
- system_prompt: 系统提示词
- created_at: 创建时间
- updated_at: 更新时间
```

### ai_conversations 表
```sql
- id: 主键
- user_id: 用户 ID
- user_message: 用户消息
- assistant_message: AI 回复
- created_at: 创建时间
- updated_at: 更新时间
```

---

## 六、配置检查清单

- [ ] DeepSeek API Key 已从 [platform.deepseek.com](https://platform.deepseek.com) 获取
- [ ] API Base URL 设置为 `https://api.deepseek.com`
- [ ] 系统提示词已复制（见第二部分）
- [ ] 在后台测试连接通过
- [ ] 配置已保存
- [ ] 访问 `/consultation` 页面，输入一条宠物健康问题进行测试
- [ ] 能正常收到 AI 回复

---

## 七、常见问题

**Q: 如何修改系统提示词？**
A: 访问 `/admin/ai-config`，在表单中编辑"系统提示词"字段后保存。修改立即生效。

**Q: DeepSeek API Key 在哪里获取？**
A: 访问 https://platform.deepseek.com，登录后在 API Keys 部分生成新密钥。

**Q: 能否更换为其他 AI 模型（如 OpenAI）？**
A: 可以。修改 `lib/deepseek.ts` 中的客户端集成，使用其他 AI SDK 即可。

**Q: 用户对话是否会被保存？**
A: 是的，所有对话会保存在 `ai_conversations` 表中，仅用户自己和管理员可查看。

---

## 八、下一步

1. **登录管理后台** → 访问 `/admin/ai-config`
2. **输入配置信息** → 复制上面的系统提示词
3. **测试连接** → 点击"Test Connection"
4. **保存配置** → 点击"Save Configuration"
5. **用户体验** → 访问 `/consultation` 开始聊天

所有配置完成后，Dr. Max 将全面上线！

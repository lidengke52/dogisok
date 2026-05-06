# Dr. Max AI 集成指南

## 概述

这是一个完整的 DeepSeek AI 集成方案，用于为 Dr. Max 宠物医生添加 AI 咨询能力。

## 核心特性

✅ **可配置的 AI 后端** - 支持自定义 API BaseURL、API Key 和系统提示词  
✅ **后台管理界面** - 无需重启应用即可更新配置  
✅ **实时对话** - 使用 AI SDK 流式传输获得流畅的用户体验  
✅ **权限控制** - 只有管理员可以配置 AI 设置  
✅ **对话历史** - 可选的对话记录功能  
✅ **API 测试** - 快速验证 DeepSeek API 连接  

## 文件结构

```
├── lib/
│   └── deepseek.ts                 # DeepSeek 客户端和核心逻辑
├── app/
│   ├── api/
│   │   ├── dr-max/
│   │   │   └── chat/route.ts       # 聊天 API 端点
│   │   └── admin/
│   │       └── ai-config/route.ts  # 配置管理 API
│   ├── admin/
│   │   └── ai-config/page.tsx      # 后台配置页面
│   └── consultation/page.tsx       # 前端咨询页面
├── components/
│   ├── admin/
│   │   └── ai-config-form.tsx      # 配置表单组件
│   └── dr-max-chat.tsx             # 聊天界面组件
└── scripts/
    └── setup-ai.sql                # 数据库初始化脚本
```

## 安装步骤

### 1. 数据库设置

在 Supabase 中执行 `scripts/setup-ai.sql` 脚本来创建必要的表和 RLS 策略：

```bash
# 在 Supabase SQL Editor 中运行脚本
psql -h your_db_host -U postgres -d your_db_name < scripts/setup-ai.sql
```

### 2. 环境变量配置

添加 DeepSeek API Key 到 `.env.local`：

```env
# 可选 - 用作备用，优先使用数据库配置
DEEPSEEK_API_KEY=sk-your-api-key-here
```

### 3. 后台配置

1. 以管理员身份登录
2. 前往 `/admin/ai-config` 页面
3. 填入以下信息：
   - **API Base URL**: `https://api.deepseek.com`（或你的自托管地址）
   - **API Key**: 从 [DeepSeek 平台](https://platform.deepseek.com) 获取
   - **系统提示词**: 点击"使用默认"或自定义

4. 点击"测试连接"验证 API 配置
5. 点击"保存配置"

### 4. 创建导航菜单项

在后台管理菜单中添加 AI 配置链接：

```tsx
// app/admin/layout.tsx
const navigation = [
  // ... 其他菜单项
  { name: "AI 配置", href: "/admin/ai-config", icon: Zap },
]
```

## 使用指南

### 前端用户

访问 `/consultation` 页面与 Dr. Max 进行实时对话。

**功能**：
- 实时流式回复
- 错误处理和重试
- 自动滚动到最新消息
- 移动端友好的界面

### 后台管理员

#### 配置 API

1. **API Base URL**
   - 默认: `https://api.deepseek.com`
   - 支持自托管部署的其他端点

2. **API Key**
   - 从 DeepSeek 获取: https://platform.deepseek.com/api_keys
   - 在数据库中加密存储
   - 列表中显示为 `sk-xxxxx***`（隐藏实际密钥）

3. **系统提示词**
   - 定义 Dr. Max 的角色和行为规则
   - 包含内容护栏和安全政策
   - 支持多语言回复

#### 测试连接

点击"测试连接"按钮可以验证：
- API Key 是否有效
- Base URL 是否可访问
- DeepSeek 服务是否正常

#### 更新配置

修改任何配置字段后：
1. 点击"保存配置"
2. 配置立即生效，无需重启应用
3. 查看成功/错误提示

## API 端点

### POST /api/dr-max/chat

流式对话 API

**请求**：
```json
{
  "message": "我的狗最近食欲不振怎么办？"
}
```

**响应**：
```
流式文本响应，使用 Server-Sent Events (SSE)
```

**错误处理**：
- 401: 未认证
- 400: 无效请求
- 503: AI 服务未配置
- 500: 服务器错误

### GET /api/admin/ai-config

获取当前 AI 配置（需要管理员权限）

**响应**：
```json
{
  "key": "deepseek",
  "api_key": "sk-xxxxx***",
  "base_url": "https://api.deepseek.com",
  "system_prompt": "你是专业的宠物医生...",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### PUT /api/admin/ai-config

更新 AI 配置（需要管理员权限）

**请求**：
```json
{
  "api_key": "sk-new-key",
  "base_url": "https://api.deepseek.com",
  "system_prompt": "新的系统提示词..."
}
```

### POST /api/admin/ai-config

测试 DeepSeek API 连接（需要管理员权限）

**请求**：
```json
{
  "api_key": "sk-test-key",
  "base_url": "https://api.deepseek.com"
}
```

**成功响应**：
```json
{
  "success": true,
  "message": "DeepSeek API connection successful"
}
```

## 配置示例

### 基础配置

```
API Base URL: https://api.deepseek.com
API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
系统提示词: （使用默认）
```

### 自托管部署

```
API Base URL: https://your-domain.com/api/deepseek
API Key: your-custom-api-key
系统提示词: （自定义，符合你的业务需求）
```

### 多模型切换

修改 `lib/deepseek.ts` 中的模型名称：

```typescript
// 使用不同的模型
return streamText({
  model: client("deepseek-chat"),  // 改为其他模型名称
  // ...
});
```

## 系统提示词说明

默认提示词包含两个核心部分：

1. **角色与职责边界**
   - 限制 Dr. Max 只回答宠物健康问题
   - 拒绝政治、财经、娱乐等无关话题
   - 提供统一的拒绝回复

2. **内容护栏**
   - 关键词拦截（暴力、色情等敏感词）
   - 话题限定（检测跑题并重定向）
   - 敏感词过滤（确保输出专业安全）

你可以根据需要修改提示词，例如：
- 添加特定的医学知识库引用
- 增加安全条款和免责声明
- 调整回复风格（专业、友好、详细等）

## 故障排查

### 问题：API 连接失败

**原因**：
- API Key 过期或无效
- Base URL 不正确
- 网络连接问题

**解决**：
1. 检查 API Key 是否有效
2. 验证 Base URL 格式
3. 测试网络连接
4. 查看应用日志

### 问题：配置保存后无效

**原因**：
- 没有管理员权限
- 浏览器缓存
- 数据库权限问题

**解决**：
1. 确认当前用户是管理员
2. 清除浏览器缓存
3. 检查 RLS 策略配置

### 问题：对话响应缓慢

**原因**：
- DeepSeek API 响应慢
- 网络延迟
- 消息过长

**解决**：
1. 检查 DeepSeek 服务状态
2. 优化系统提示词长度
3. 尝试缩短用户消息

## 成本估算

基于 DeepSeek API 定价（截至 2024 年）：

- **输入**: ¥0.14 / 百万 tokens
- **输出**: ¥0.28 / 百万 tokens

假设每个对话平均 500 tokens：
- **单个对话成本**: 约 ¥0.0001
- **月均 10,000 对话**: 约 ¥1

详见 [DeepSeek 定价](https://platform.deepseek.com/pricing)

## 下一步

1. **监控和分析**
   - 添加对话记录和分析
   - 监控 API 调用量和成本
   - 跟踪用户满意度

2. **功能扩展**
   - 支持多轮对话上下文
   - 添加诊断工具和检查表
   - 集成宠物医疗数据库

3. **性能优化**
   - 实现对话缓存
   - 优化模型选择
   - 添加速率限制

## 许可证

MIT

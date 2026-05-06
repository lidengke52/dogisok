# Dr.Max AI 完整配置指南

## 快速开始（3个步骤）

### 第1步：进入后台配置页面
1. 登录后台：访问 `/admin`
2. 在左侧菜单找到"系统设置"分组下的 **"Dr.Max AI 配置"**
3. 点击进入配置页面

### 第2步：填入配置信息

已为你提供的默认配置：

```
API 地址：https://api.deepseek.com/chat/completions
API KEY：sk-7047f35e0aff4394a0aa5fb6dc46ae8a
模型：deepseek-v4-pro
```

在配置页面填入这些信息：

1. **API 地址** - 输入：`https://api.deepseek.com/chat/completions`
2. **API Key** - 输入：`sk-7047f35e0aff4394a0aa5fb6dc46ae8a`
3. **模型** - 输入：`deepseek-v4-pro`
4. **系统提示词** - 已预填，保持不变（定义了 Dr.Max 的角色和内容护栏）

### 第3步：测试并保存

1. 点击 **"测试连接"** 按钮验证 API 是否正常
2. 看到"连接成功！"提示后，点击 **"保存配置"**
3. 保存成功后会显示确认提示

---

## 配置说明

### API 地址
- **完整端点**：`https://api.deepseek.com/chat/completions`
- 不能省略 `/chat/completions` 路径
- 确保以 `https://` 开头

### API Key
- 从 [DeepSeek 官方平台](https://platform.deepseek.com) 获取
- 格式：`sk-` 开头的字符串
- 安全存储：系统会加密保存，后台显示时仅显示前 10 个字符 + `***`

### 模型选择
- **默认推荐**：`deepseek-v4-pro`（性能最优）
- **其他可选**：
  - `deepseek-chat`（轻量级）
  - `deepseek-v4` 或其他官方支持的模型

### 系统提示词
定义了 Dr.Max 的两大核心规则：

1. **角色与职责边界**
   - 仅回答宠物健康相关问题
   - 严禁回答政治、财经、娱乐等无关话题
   
2. **内容护栏**
   - 关键词拦截：自动过滤暴力、色情等不当内容
   - 话题限定：检测到跑题立即重定向
   - 敏感词过滤：确保输出专业、温和

你可以根据需要修改这个提示词，修改后立即生效。

---

## 用户如何使用 Dr.Max

修改完成后，用户可以：

1. 访问 `/consultation` 进入咨询页面
2. 在聊天框输入问题（中英文都支持）
3. Dr.Max 会根据你配置的 API 和提示词进行回复
4. 对话历史会自动保存

---

## 常见问题

### Q: 连接测试失败怎么办？
**A:** 检查以下几点：
- API Key 是否正确（从 https://platform.deepseek.com 复制）
- API 地址是否完整（包括 `/chat/completions`）
- 网络连接是否正常
- API 配额是否充足

### Q: 保存后立即生效吗？
**A:** 是的，配置保存后立即生效。新的对话会使用新配置。

### Q: 能修改系统提示词吗？
**A:** 可以。直接编辑"系统提示词"文本框内容，保存即可。建议保留核心的两大规则。

### Q: 支持多个 AI 模型吗？
**A:** 目前仅支持一个默认配置。如需多个，可在"模型"字段切换不同的 DeepSeek 模型。

### Q: API Key 安全吗？
**A:** 安全。系统：
- 加密存储在数据库
- 仅管理员可见，且后台显示时会隐藏大部分字符
- 不会在前端代码中暴露

---

## 技术实现细节

### 文件结构
```
lib/
  - ai-config.ts           # AI 配置管理库
  - deepseek.ts            # DeepSeek 集成

app/api/admin/
  - ai-config/route.ts     # 配置 CRUD API
  - ai-test/route.ts       # 连接测试 API

app/admin/
  - ai-config/page.tsx     # 后台配置页面

components/admin/
  - ai-config-form-v2.tsx  # 配置表单组件

app/
  - consultation/page.tsx   # 用户咨询页面（使用新配置）
```

### 数据库表
`ai_config` 表结构：
- `id` (主键)：固定为 "default"
- `api_url` (字符串)：完整的 API 端点
- `api_key` (字符串)：加密存储的 API Key
- `model` (字符串)：模型名称
- `system_prompt` (文本)：系统提示词
- `is_active` (布尔值)：是否激活
- `created_at` / `updated_at` (时间戳)：创建和更新时间

### API 端点

**获取配置** `GET /api/admin/ai-config`
- 需要管理员权限
- 返回配置（API Key 已隐藏）

**保存配置** `POST /api/admin/ai-config`
- 需要管理员权限
- 创建或更新 ID 为 "default" 的配置

**测试连接** `POST /api/admin/ai-test`
- 需要管理员权限
- 发送测试请求到 DeepSeek API
- 验证 API Key 和地址是否有效

---

## 部署到生产环境

如果部署到自托管服务器（如阿里云 ECS）：

1. 确保 Supabase 或自建 PostgreSQL 已准备就绪
2. 运行数据库初始化脚本
3. 设置环境变量（如有需要）
4. 重启应用服务
5. 进入后台配置 AI

---

**已完成配置？**✅ 现在访问 `/consultation` 体验 Dr.Max AI 聊天功能！

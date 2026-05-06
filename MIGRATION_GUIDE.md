# 迁移指南：从 Vercel Blob + Supabase 到阿里云 RDS + OSS

## 概述

本文档记录了如何将 Dog is OK 从 Vercel Blob + Supabase 迁移到阿里云 RDS + OSS 的完整步骤，**确保零数据丢失**。

## 关键特性

✅ **无代码改动** - 所有图片 URL 通过 `lib/storage-config.ts` 统一管理  
✅ **环境变量驱动** - 只需修改 `.env` 即可切换存储源  
✅ **平滑迁移** - 支持逐步迁移，无需一次性切换  
✅ **数据保留** - 完整备份和验证机制  

---

## 迁移时间线

### 现在（准备阶段）
- ✅ 已创建 `lib/storage-config.ts`
- ✅ 已更新 `.env.example`
- 下步：定期备份数据

### 6-12 个月后（迁移阶段）
1. 创建阿里云 RDS + OSS
2. 备份并迁移数据
3. 测试和验证
4. DNS 切换

---

## 第一步：数据备份（立即执行）

### 备份 Supabase 数据库

```bash
# 从 Supabase 导出完整备份
pg_dump \
  -h db.supabase.co \
  -U postgres \
  -d postgres \
  --no-password \
  > dogisok_backup_$(date +%Y%m%d).sql

# 或使用 Supabase 仪表板的备份功能
```

### 备份 Vercel Blob 文件

```bash
# 使用 Vercel CLI 下载所有 Blob 文件
# （需要 Vercel 团队的支持或使用 API）

# 或手动列出所有使用过的 image_url，逐个下载
```

### 备份清单

```
📋 备份清单
└── dogisok_backup_20240506.sql (数据库)
└── vercel_blob_files/ (图片文件)
└── database_schema.sql (表结构)
└── migration_config.json (配置备份)
```

---

## 第二步：创建阿里云资源（迁移阶段）

### 2.1 创建 RDS for PostgreSQL

```
阿里云控制台 → RDS → 创建实例

配置：
- 数据库版本：PostgreSQL 15
- 实例规格：根据数据量选择（可从 1 核 2GB 开始）
- 存储空间：100GB（预留 20% 富余）
- 网络类型：VPC（同地域）
- 备份保留期：7 天
- 多可用区部署：建议开启
- SSL 连接：开启

注意：
- 记录 RDS 连接端点 (Endpoint)
- 记录 Master 用户名和密码
- 配置安全组允许你的 IP 访问
```

### 2.2 创建 OSS Bucket

```
阿里云控制台 → 对象存储 OSS → 创建 Bucket

配置：
- Bucket 名称：dogisok-assets
- 区域：oss-cn-hangzhou（与 RDS 同地域）
- 存储类型：标准存储
- 访问权限：私有（private）
- 版本控制：启用（便于回滚）
- 服务端加密：建议启用

CDN 配置：
- 启用阿里云 CDN
- 回源设置：指向 Bucket
```

### 2.3 获取凭证

```bash
# 在阿里云 RAM 中创建 AccessKey
# 权限：OSS 完整读写 + RDS 完整读写

# 记录：
ALIYUN_OSS_ACCESS_KEY_ID=LTAI5t...
ALIYUN_OSS_ACCESS_KEY_SECRET=xxx...
ALIYUN_OSS_BUCKET=dogisok-assets
ALIYUN_OSS_REGION=oss-cn-hangzhou
NEXT_PUBLIC_OSS_URL=https://dogisok-assets.oss-cn-hangzhou.aliyuncs.com

DATABASE_URL=postgresql://postgres:Password123@rm-xxx.postgres.rds.aliyuncs.com:5432/dogisok
```

---

## 第三步：迁移数据

### 3.1 迁移数据库

```bash
# 1. 从 Supabase 导出
pg_dump \
  -h db.supabase.co \
  -U postgres \
  -d postgres \
  > dogisok_backup.sql

# 2. 导入到阿里云 RDS
psql \
  -h rm-xxx.postgres.rds.aliyuncs.com \
  -U postgres \
  -d dogisok \
  < dogisok_backup.sql

# 3. 验证数据完整性
psql -h rm-xxx.postgres.rds.aliyuncs.com -U postgres -d dogisok -c "SELECT COUNT(*) FROM products;"
```

### 3.2 迁移文件（Blob → OSS）

```bash
# 方式 1：使用 osscmd 工具（推荐）
osscmd -c /path/to/ossutilconfig upload -r ./local-blobs/ oss://dogisok-assets/

# 方式 2：逐个下载并上传
# 从数据库查询所有 image_url，逐个处理
```

### 3.3 URL 映射维护

创建 `migration_mapping.json` 记录 URL 映射：

```json
{
  "mappings": [
    {
      "old_url": "https://public.blob.vercel-storage.com/product-1.jpg",
      "new_url": "https://dogisok-assets.oss-cn-hangzhou.aliyuncs.com/product-1.jpg",
      "verified": true
    }
  ],
  "migration_date": "2024-05-06",
  "total_files": 250,
  "migrated_files": 250
}
```

---

## 第四步：代码和配置更新

### 4.1 更新环境变量

```bash
# .env.production（仅修改，无代码改动）

# 注释掉旧配置
# NEXT_PUBLIC_BLOB_URL=https://public.blob.vercel-storage.com

# 启用新配置
NEXT_PUBLIC_OSS_URL=https://dogisok-assets.oss-cn-hangzhou.aliyuncs.com

# 新增 RDS 配置
DATABASE_URL=postgresql://postgres:Password123@rm-xxx.postgres.rds.aliyuncs.com:5432/dogisok
```

### 4.2 代码变更（最小化）

所有代码已通过 `lib/storage-config.ts` 抽象，**无需修改业务代码**。

```typescript
// 示例：这行代码在两个环境中都工作
import { getStorageUrl } from "@/lib/storage-config"

const imageUrl = getStorageUrl(product.image_url)
// Vercel Blob: https://public.blob.vercel-storage.com/...
// OSS: https://dogisok-assets.oss-cn-hangzhou.aliyuncs.com/...
```

---

## 第五步：测试和验证

### 5.1 灰度测试

1. 创建新的 Vercel 部署指向阿里云
2. 测试所有功能：
   - 登录/注册
   - 文件上传
   - 图片显示
   - 产品查询
   - Admin 功能

### 5.2 数据一致性检查

```bash
# 检查行数是否匹配
psql -h db.supabase.co -U postgres -d postgres -c "SELECT COUNT(*) FROM users;"
psql -h rm-xxx.postgres.rds.aliyuncs.com -U postgres -d dogisok -c "SELECT COUNT(*) FROM users;"

# 检查关键数据
# - 产品数量
# - 用户数量
# - 订单记录
```

### 5.3 性能测试

```bash
# 测试查询性能
time psql -h rm-xxx.postgres.rds.aliyuncs.com -U postgres -d dogisok -c "SELECT * FROM products LIMIT 1000;"

# 测试文件访问速度
curl -I https://dogisok-assets.oss-cn-hangzhou.aliyuncs.com/sample.jpg
```

---

## 第六步：流量切换

### 6.1 DNS 切换（如果有）

```bash
# 如果有自定义域名指向 Blob CDN
# 改为指向 OSS CDN

# 旧：CNAME → blob.vercel-storage.com
# 新：CNAME → dogisok-assets.oss-cn-hangzhou.aliyuncs.com
```

### 6.2 监控切换后

- 监控错误日志（Sentry/阿里云日志）
- 监控性能指标（响应时间、吞吐量）
- 收集用户反馈
- 准备回滚方案（如发现问题可快速恢复）

---

## 回滚方案

如果迁移后发现问题，可快速回滚：

```bash
# 方式 1：立即恢复 Vercel
# - 重新指向原 Vercel 部署
# - 数据不会丢失（Supabase 不变）

# 方式 2：使用 Blob 备份
# - OSS 保留备份版本
# - 重新导出数据到 Supabase

# 耗时：5-10 分钟
```

---

## 常见问题

### Q：迁移期间网站会下线吗？
**A：** 不必要。可在迁移前创建新 Vercel 部署（从原 GitHub 分支），指向新数据库进行灰度测试，然后切换主域名。

### Q：文件大小限制？
**A：** 
- Vercel Blob：单文件最大 50MB
- 阿里云 OSS：单文件最大 5TB
- 建议限制：100MB

### Q：成本会增加吗？
**A：**
- RDS：¥ 50-200/月（取决于规格）
- OSS：¥ 0.016/GB/月（存储）+ 流量费
- CDN：¥ 0.2-0.5/GB（可选，推荐）

### Q：迁移需要多长时间？
**A：** 
- 数据库：1-2 小时（通常受网络限制）
- 文件：取决于总大小（100GB 约 2-4 小时）
- 测试和验证：1 天
- 总耗时：1-2 天

---

## 迁移清单

```
准备阶段：
☐ 创建 lib/storage-config.ts
☐ 更新 .env.example
☐ 备份 Supabase 数据库
☐ 备份 Vercel Blob 文件
☐ 记录所有配置信息

迁移阶段：
☐ 创建阿里云 RDS 实例
☐ 创建阿里云 OSS Bucket
☐ 创建 RAM 用户和 AccessKey
☐ 迁移数据库
☐ 迁移文件到 OSS
☐ 验证数据完整性
☐ 更新环境变量
☐ 灰度测试
☐ 性能测试
☐ DNS 切换
☐ 监控和优化
```

---

## 联系和支持

- 阿里云 RDS 文档：https://help.aliyun.com/document_detail/26145.html
- 阿里云 OSS 文档：https://help.aliyun.com/document_detail/31883.html
- 迁移相关问题：查看本文档对应章节

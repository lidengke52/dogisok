# Dog is OK - 阿里云迁移计划

**文档版本**: 1.0  
**最后更新**: 2026-05-06  
**状态**: 计划中（计划在运行 6-12 个月后执行）

---

## 📋 目录

1. [项目概述](#项目概述)
2. [迁移架构](#迁移架构)
3. [前置条件](#前置条件)
4. [成本分析](#成本分析)
5. [详细迁移步骤](#详细迁移步骤)
6. [风险管理](#风险管理)
7. [验证和回滚](#验证和回滚)
8. [检查清单](#检查清单)
9. [常见问题](#常见问题)

---

## 项目概述

### 当前架构

```
┌─────────────────┐
│   Vercel CDN    │ (域名解析 + 部署)
└────────┬────────┘
         │
    ┌────┴──────────────────┐
    │                       │
┌───▼──────┐          ┌──────▼──────┐
│ Supabase │          │ Vercel Blob │
│PostgreSQL│          │  (存储)     │
└──────────┘          └─────────────┘
```

### 目标架构（迁移后）

```
┌──────────────────┐
│  阿里云 CDN      │ (域名解析)
└────────┬─────────┘
         │
    ┌────┴─────────────────┐
    │                      │
┌───▼──────┐          ┌────▼──────┐
│ RDS for  │          │ 阿里云    │
│PostgreSQL│          │ OSS       │
└──────────┘          └───────────┘
```

---

## 迁移架构

### 组件对应关系

| 当前组件 | 当前供应商 | 目标组件 | 阿里云服务 | 迁移难度 |
|--------|----------|--------|-----------|--------|
| 应用服务 | Vercel | 应用服务 | ECS/容器 | 中 |
| 数据库 | Supabase (PostgreSQL) | 数据库 | RDS for PostgreSQL | 低 |
| 文件存储 | Vercel Blob | 文件存储 | OSS | 低 |
| CDN | Vercel CDN | CDN | 阿里云 CDN | 低 |
| 缓存 | 内存 | 缓存 | Redis | 低 |
| 监控日志 | Vercel | 监控日志 | 日志服务 | 低 |

### 代码已做的准备

✅ **已创建 `lib/storage-config.ts`**
- 统一管理存储 URL
- 支持环境变量切换
- 无需改动业务代码

✅ **已更新 `.env.example`**
- 迁移前后配置对比
- 完整的阿里云服务参数

---

## 前置条件

### 技术要求

- [ ] 访问权限：GitHub、Vercel、Supabase
- [ ] 新增权限：阿里云账号（主账号或具有充分权限的子账号）
- [ ] 工具准备：
  - PostgreSQL 客户端（`psql`）
  - 阿里云 OSS 命令行工具（`ossutil`）
  - 数据库备份工具

### 业务要求

- [ ] 完成至少 1 个完整备份周期
- [ ] 文档化所有关键配置
- [ ] 制定停机维护窗口
- [ ] 准备技术支持团队

### 关键数据

在开始迁移前，收集并记录：

```
当前数据量统计：
- 数据库大小: _____ GB
- 文件存储大小: _____ GB
- 用户数量: _____ 个
- 最后备份时间: _______
- 数据库备份位置: _______
```

---

## 成本分析

### 迁移前成本（当前）

| 项目 | 成本 | 备注 |
|------|------|------|
| Vercel 服务 | ¥ 50-500/月 | 按使用量计费 |
| Supabase 数据库 | ¥ 80-300/月 | 含备份 |
| 总计 | **¥ 130-800/月** | 变化较大 |

### 迁移后成本（阿里云）

| 项目 | 月费用 | 年费用 | 备注 |
|------|--------|--------|------|
| **计算** | | | |
| ECS 按量付费 | ¥ 100-400 | ¥ 1,200-4,800 | 2核4GB |
| 弹性伸缩 | ¥ 0 | ¥ 0 | 按需 |
| **存储** | | | |
| RDS PostgreSQL | ¥ 120-500 | ¥ 1,440-6,000 | 20GB 存储 |
| OSS 存储 | ¥ 0.3-10 | ¥ 3.6-120 | 按量计费 |
| OSS 流量 | ¥ 50-200 | ¥ 600-2,400 | 根据CDN |
| **网络** | | | |
| CDN 加速 | ¥ 80-300 | ¥ 960-3,600 | 按流量 |
| 带宽 | ¥ 50-150 | ¥ 600-1,800 | 按需 |
| **运维** | | | |
| 日志服务 | ¥ 20-50 | ¥ 240-600 | 监控告警 |
| **预留实例优惠** | -¥ 200-400 | -¥ 2,400-4,800 | 1年期预付 |
| **总计** | **¥ 220-1,210/月** | **¥ 2,640-14,520/年** | 预留实例折扣 |

### 成本对比

```
当前（Vercel + Supabase）
    ├─ 高峰: ¥ 800/月
    ├─ 平均: ¥ 400/月
    └─ 低谷: ¥ 130/月

迁移后（阿里云）
    ├─ 推荐配置: ¥ 600/月
    ├─ 预留优惠: ¥ 220-1,210/月（年付）
    └─ 成本对标: 平稳且可预测
```

### 投资回报率 (ROI)

- 迁移成本：约 ¥ 5,000-10,000（人工 + 工具）
- 年度节省：约 ¥ 2,000-5,000（在预留实例折扣下）
- 回本周期：1-3 年
- **关键价值**：更好的性能控制、数据主权、成本可预测

---

## 详细迁移步骤

### 第 1 阶段：准备与规划（第 1-2 周）

#### 1.1 数据审计

```bash
# 连接 Supabase 查询数据库大小
psql -h db.supabase.co -U postgres -d postgres -c "
  SELECT 
    sum(pg_total_relation_size(schemaname||'.'||tablename))::bigint as size
  FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
"

# 记录结果：__________ bytes (约 _____ GB)
```

#### 1.2 应用依赖整理

```bash
# 列出所有关键依赖
npm ls --depth=0

# 检查 package.json 中的阿里云相关包
grep -i aliyun package.json
```

#### 1.3 配置文件归档

```bash
# 创建配置备份
mkdir -p backup/config
cp .env.production backup/config/env.production.bak
cp .env.example backup/config/env.example.bak

# 记录关键环境变量（脱敏处理）
echo "Supabase URL: $(echo $SUPABASE_URL | cut -d. -f1)...co" >> backup/config/current-config.txt
```

### 第 2 阶段：基础设施准备（第 3-4 周）

#### 2.1 创建阿里云账号和权限

```bash
# 阿里云控制台操作
1. 访问 https://account.console.aliyun.com
2. 创建子账号（推荐）或使用主账号
3. 创建 AccessKey ID 和 AccessKey Secret
4. 记录在安全的地方
```

#### 2.2 创建 RDS for PostgreSQL

**在阿里云控制台：**

```
导航: RDS → 数据库实例
├─ 购买实例
│  ├─ 地区: 选择最近的地区（推荐 cn-hangzhou）
│  ├─ 实例规格: pg.x4.large (2核 8GB，适合中型应用)
│  ├─ 存储空间: 100GB（超配 20%）
│  ├─ 高可用: 启用主备实例
│  └─ 备份周期: 7 天
├─ 网络配置
│  ├─ VPC: 创建或选择现有
│  ├─ 子网: 选择同地域
│  └─ 安全组: 配置 5432 端口仅允许应用服务器
└─ 完成购买
```

**记录信息：**
```
RDS 端点: ___________________________
主用户名: postgres
数据库名: dog_is_ok
端口: 5432
VPC ID: ___________________________
```

#### 2.3 创建 OSS Bucket

**在阿里云控制台：**

```
导航: OSS → Buckets
├─ 创建 Bucket
│  ├─ Bucket 名称: dogisok-assets
│  ├─ 地域: cn-hangzhou（与 RDS 同地域）
│  ├─ 存储类型: 标准存储
│  ├─ 访问权限: 私有
│  └─ 版本控制: 启用（用于恢复）
├─ 生命周期管理
│  ├─ 创建规则：过期版本 30 天后删除
│  └─ 监听和日志：启用服务端日志
└─ CDN 加速
   ├─ 启用 CDN
   ├─ 加速域名: dogisok-cdn.example.com
   └─ 缓存规则: 7 天
```

**记录信息：**
```
OSS Endpoint: ___________________________
OSS Region: cn-hangzhou
Bucket Name: dogisok-assets
CDN Domain: ___________________________
AccessKey ID: ___________________________
AccessKey Secret: ___________________________
```

#### 2.4 配置 VPC 网络

```bash
# 安全组规则（RDS）
入站规则:
  - 协议: PostgreSQL (5432)
  - 来源: 应用服务器 IP/安全组
  
出站规则:
  - 全部放通
```

### 第 3 阶段：数据迁移（第 5 周）

#### 3.1 完整数据备份

```bash
# 从 Supabase 导出
pg_dump \
  -h db.supabase.co \
  -U postgres \
  -d postgres \
  --no-privileges \
  --no-owner \
  > backup/supabase-full.sql

# 验证备份
ls -lh backup/supabase-full.sql
wc -l backup/supabase-full.sql
```

#### 3.2 创建 RDS 数据库

```bash
# 通过 psql 连接 RDS
psql -h rm-xxxxx.postgres.rds.aliyuncs.com \
     -U postgres \
     -d postgres

# 在 PostgreSQL 中执行
CREATE DATABASE dog_is_ok;
\c dog_is_ok
CREATE SCHEMA public;
```

#### 3.3 导入数据

```bash
# 方法 A：直接导入（小数据量 < 1GB）
psql -h rm-xxxxx.postgres.rds.aliyuncs.com \
     -U postgres \
     -d dog_is_ok \
     -f backup/supabase-full.sql

# 方法 B：使用中转（大数据量 > 1GB）
# 1. 在本地导入到临时 PostgreSQL
# 2. 通过数据泵导出
# 3. 上传到 OSS
# 4. 从 RDS 下载并导入

# 验证导入
psql -h rm-xxxxx.postgres.rds.aliyuncs.com \
     -U postgres \
     -d dog_is_ok -c "
  SELECT count(*) as table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public';
"
```

#### 3.4 数据校验

```bash
# 校验行数
echo "=== Supabase 行数 ===" 
psql -h db.supabase.co -U postgres -d postgres -c "SELECT count(*) FROM products;"

echo "=== RDS 行数 ==="
psql -h rm-xxxxx.postgres.rds.aliyuncs.com -U postgres -d dog_is_ok -c "SELECT count(*) FROM products;"

# 校验数据完整性
SELECT table_name, count(*) as row_count 
FROM information_schema.tables t
JOIN (SELECT * FROM products UNION ALL SELECT * FROM users ...) data 
  ON t.table_name = data.table_name
GROUP BY table_name;
```

#### 3.5 迁移文件到 OSS

```bash
# 安装 ossutil
# https://help.aliyun.com/document_detail/120075.html

# 配置 ossutil
ossutil config -i XXXX -k XXXX -e oss-cn-hangzhou.aliyuncs.com

# 从 Vercel Blob 下载所有文件
# 注：需要逐个下载或批量通过 API
for file in $(list_vercel_blob_files); do
  curl $file -o local-files/$file
done

# 批量上传到 OSS
ossutil cp -r local-files/ oss://dogisok-assets/ -u

# 验证上传
ossutil ls oss://dogisok-assets/ -s
```

### 第 4 阶段：应用配置更新（第 6 周）

#### 4.1 环境变量配置

```bash
# 在部署系统中更新环境变量

# 数据库
DATABASE_URL="postgresql://postgres:PASSWORD@rm-xxxxx.postgres.rds.aliyuncs.com:5432/dog_is_ok"

# 存储
NEXT_PUBLIC_OSS_URL="https://dogisok-assets.oss-cn-hangzhou.aliyuncs.com"
ALIYUN_OSS_REGION="oss-cn-hangzhou"
ALIYUN_OSS_BUCKET="dogisok-assets"
ALIYUN_OSS_ACCESS_KEY_ID="XXXX"
ALIYUN_OSS_ACCESS_KEY_SECRET="XXXX"
```

#### 4.2 测试连接

```bash
# 数据库连接测试
psql $DATABASE_URL -c "SELECT version();"

# OSS 连接测试
ossutil ls oss://dogisok-assets/ -s

# 存储 URL 功能测试
npm run test:storage-config
```

### 第 5 阶段：灰度发布（第 7-8 周）

#### 5.1 金丝雀部署

```
流量分配：
  - 旧配置（Vercel Blob）: 90%
  - 新配置（OSS）: 10%
  
监控指标：
  - 错误率
  - 加载时间
  - 存储可用性

时间：运行 1 周
```

#### 5.2 验证指标

```bash
# 检查日志
cat application.log | grep "storage" | tail -100

# 监控 API 响应时间
curl -w "%{time_total}s" https://your-domain.com/api/files/sample.jpg

# 验证文件访问
curl https://dogisok-assets.oss-cn-hangzhou.aliyuncs.com/sample.jpg
```

#### 5.3 逐步扩大范围

```
周 1: 10% 流量
  └─ 验证通过 → 继续

周 2: 50% 流量
  └─ 验证通过 → 继续

周 3: 100% 流量（完全切换）
  └─ 新配置成为主用
```

### 第 6 阶段：完全迁移（第 9 周）

#### 6.1 关闭 Supabase

```bash
# 备份最后一次数据
pg_dump -h db.supabase.co ... > backup/supabase-final.sql

# 导出用户数据（GDPR 合规）
SELECT user_id, email, name FROM users WHERE deleted_at IS NULL;

# 通知用户：邮件发送迁移完成通知
```

#### 6.2 关闭 Vercel Blob

```bash
# 导出最后的文件列表
ossutil ls oss://dogisok-assets/ -s > backup/final-oss-inventory.txt

# 从 Vercel 删除存储（如果需要）
# 通过 Vercel 控制台删除 Blob 存储
```

#### 6.3 域名 DNS 切换

```bash
# 仅当使用自有域名时
DNS 记录更改：
  FROM: CNAME → vercel.app
  TO:   CNAME → aliyun-cdn.example.com

等待时间：48-72 小时 DNS 传播
```

---

## 风险管理

### 可能的风险

| 风险 | 概率 | 影响 | 预防措施 |
|------|------|------|--------|
| 数据丢失 | 低 | 严重 | 三重备份、校验和验证 |
| 性能下降 | 中 | 中等 | 压力测试、CDN 配置 |
| 兼容性问题 | 中 | 中等 | 灰度发布、回滚计划 |
| 安全漏洞 | 低 | 严重 | 安全审计、访问控制 |
| 成本超支 | 低 | 低 | 预算告警、预留实例 |

### 应急预案

**情况 1：数据迁移失败**
```
步骤：
1. 停止迁移（不提交任何变更）
2. 恢复 Supabase 备份
3. 分析失败原因
4. 重新规划迁移
```

**情况 2：应用连接失败**
```
步骤：
1. 检查数据库连接字符串
2. 检查安全组规则
3. 检查网络连接
4. 回滚到旧配置
```

**情况 3：文件访问错误**
```
步骤：
1. 检查 OSS 权限
2. 检查 CDN 配置
3. 验证文件上传完整性
4. 恢复 Vercel Blob 配置
```

---

## 验证和回滚

### 验证清单

- [ ] 数据库连接正常
- [ ] 数据行数与源一致
- [ ] 文件完整性校验通过
- [ ] API 响应时间正常
- [ ] 文件加载速度符合预期
- [ ] 用户登录功能正常
- [ ] 数据搜索功能正常
- [ ] 文件上传功能正常
- [ ] 管理后台功能正常

### 回滚步骤（如果需要）

```bash
# 步骤 1：停止新配置
# 在部署系统中恢复旧的环境变量
DATABASE_URL="old-supabase-url"
NEXT_PUBLIC_BLOB_URL="old-vercel-blob-url"

# 步骤 2：重新部署
git push && wait-for-deployment

# 步骤 3：验证
curl https://your-domain.com/health

# 步骤 4：通知用户
# 发送系统状态通知
```

---

## 检查清单

### 迁移前

- [ ] 备份所有数据到多个位置
- [ ] 记录所有环境变量和配置
- [ ] 准备好恢复脚本
- [ ] 通知用户可能的停机时间
- [ ] 准备技术支持团队

### 迁移中

- [ ] 监控所有关键指标
- [ ] 保持沟通畅通
- [ ] 记录所有步骤和时间
- [ ] 实时验证数据完整性

### 迁移后

- [ ] 验证所有功能正常
- [ ] 验证性能指标
- [ ] 验证成本在预算内
- [ ] 更新文档
- [ ] 总结经验教训

---

## 常见问题

### Q1: 迁移会导致停机吗？

**A:** 可以最小化停机时间：
- 如果只切换数据库：可零停机（使用逻辑复制）
- 如果切换存储和数据库：建议 30 分钟维护窗口
- 使用灰度发布可进一步降低风险

### Q2: 迁移会丢失数据吗？

**A:** 不会，如果按照本计划执行：
- 每个阶段都有验证步骤
- 保留多个备份副本
- 使用校验和验证数据完整性

### Q3: 迁移后性能会更好吗？

**A:** 通常会有以下改善：
- 数据库查询：+20-30%（同地域）
- 文件加载：+15-25%（OSS CDN）
- 整体应用：+10-20%（取决于初始配置）

### Q4: 需要改动代码吗？

**A:** 不需要！我们已经：
- 创建了 `lib/storage-config.ts` 统一管理 URL
- 使用环境变量控制存储源
- 所有改动只涉及配置，不涉及代码

### Q5: 如何确保安全？

**A:** 安全措施包括：
- RDS 在 VPC 内，仅允许应用服务器访问
- OSS Bucket 设为私有，通过 CDN 或签名 URL 访问
- 所有敏感信息存储在环境变量
- 启用访问日志和审计

### Q6: 预计需要多长时间？

**A:** 完整迁移约 9 周：
- 准备和规划：2 周
- 基础设施准备：2 周
- 数据迁移：1 周
- 应用配置：1 周
- 灰度发布：2 周
- 完全迁移：1 周

---

## 附录

### 有用的工具和脚本

**数据库备份脚本**
```bash
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  > $BACKUP_DIR/backup_$TIMESTAMP.sql

# 上传到 OSS
ossutil cp $BACKUP_DIR/backup_$TIMESTAMP.sql \
  oss://dogisok-assets/backups/
```

**OSS 文件检查脚本**
```bash
#!/bin/bash
# 验证 OSS 中的文件完整性

ossutil ls oss://dogisok-assets/ -s > /tmp/oss-inventory.txt
while read file; do
  ossutil cat $file > /dev/null && echo "✓ $file" || echo "✗ $file"
done < /tmp/oss-inventory.txt
```

### 参考资源

- [阿里云 RDS for PostgreSQL](https://help.aliyun.com/document_detail/26193.html)
- [阿里云 OSS](https://help.aliyun.com/document_detail/31883.html)
- [PostgreSQL 数据迁移](https://www.postgresql.org/docs/current/backup.html)
- [OSS 数据迁移工具](https://help.aliyun.com/document_detail/102886.html)

---

## 支持和联系

如有问题，请参考：

1. **MIGRATION_GUIDE.md** - 详细技术指南
2. **MIGRATION_QUICK_REFERENCE.md** - 快速参考
3. **lib/storage-config.ts** - 代码实现示例

---

**文档更新历史**

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-05-06 | 初始版本 |

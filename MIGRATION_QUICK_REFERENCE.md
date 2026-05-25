# 迁移快速参考

## 立即执行（准备阶段）

### 1. 备份数据库
```bash
pg_dump -h db.supabase.co -U postgres -d postgres > dogisok_backup_$(date +%Y%m%d).sql
```

### 2. 记录当前配置
```bash
# 保存所有环境变量到安全位置
env | grep -E 'SUPABASE|BLOB|DATABASE' > config_backup.txt
```

---

## 迁移阶段（6-12 个月后）

### 步骤 1：创建阿里云资源

**RDS for PostgreSQL：**
- 版本：PostgreSQL 15
- 规格：1核 2GB（起始）
- 存储：100GB

**OSS Bucket：**
- 名称：dogisok-assets
- 区域：oss-cn-hangzhou
- 权限：私有

### 步骤 2：更新环境变量

```bash
# .env.production

# 关闭旧配置
# NEXT_PUBLIC_BLOB_URL=https://public.blob.vercel-storage.com

# 启用新配置
NEXT_PUBLIC_OSS_URL=https://dogisok-assets.oss-cn-hangzhou.aliyuncs.com
DATABASE_URL=postgresql://postgres:Password123@rm-xxx.postgres.rds.aliyuncs.com:5432/dogisok
```

### 步骤 3：迁移数据

```bash
# 导出
pg_dump -h db.supabase.co -U postgres -d postgres > backup.sql

# 导入
psql -h rm-xxx.postgres.rds.aliyuncs.com -U postgres -d dogisok < backup.sql

# 验证
psql -h rm-xxx.postgres.rds.aliyuncs.com -U postgres -d dogisok -c "SELECT COUNT(*) FROM users;"
```

### 步骤 4：测试

- 登录/注册
- 文件上传和显示
- Admin 功能
- 性能测试

### 步骤 5：切换

- 部署新配置
- 监控错误日志
- 如有问题立即回滚

---

## 关键配置

| 项目 | 当前（Vercel） | 迁移后（阿里云） |
|------|---|---|
| 数据库 | Supabase PostgreSQL | RDS PostgreSQL |
| 文件存储 | Vercel Blob | Aliyun OSS |
| 文件 URL | `NEXT_PUBLIC_BLOB_URL` | `NEXT_PUBLIC_OSS_URL` |
| 代码改动 | ❌ 无 | ❌ 无 |

---

## 零风险迁移

✅ 所有图片 URL 通过 `lib/storage-config.ts` 管理  
✅ 环境变量驱动，只需改配置  
✅ 支持灰度测试，无需全量切换  
✅ 完整备份方案确保数据安全  

---

详见 `MIGRATION_GUIDE.md`

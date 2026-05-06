# 阿里云自托管部署方案（Docker + PM2）

## 架构设计

```
┌─────────────────────────────────────┐
│   阿里云负载均衡 SLB                │
└────────────┬────────────────────────┘
             │ (HTTPS)
┌────────────▼────────────────────────┐
│   阿里云容器服务 ACK (Kubernetes)   │
│  或 ECS (弹性云服务器)              │
│  ├─ Node.js + PM2 容器              │
│  └─ 自动扩展 (2-5 实例)             │
└────────────┬────────────────────────┘
             │
    ┌────────┼────────┬────────┐
    │        │        │        │
┌───▼──┐ ┌──▼───┐ ┌──▼───┐ ┌──▼──┐
│ RDS  │ │ OSS  │ │ Redis│ │ ACM │
│ PgSQL│ │文件  │ │ 缓存 │ │配置 │
└──────┘ └──────┘ └──────┘ └─────┘
```

## 1. 成本估算

### 开发/测试环境（推荐）
```
ECS t6-small (2核 4GB)        ¥118/月
RDS PostgreSQL 5.7           ¥400/月
OSS 存储 100GB               ¥50/月
流量包 1TB                   ¥125/月
─────────────────────────────────
总计                         ¥693/月 (≈$98)
年费                        ¥8,316/年
```

### 生产环境（推荐）
```
ECS c7 (4核 8GB)×2          ¥468/月
RDS PostgreSQL 高可用        ¥1200/月
OSS 存储 500GB               ¥250/月
流量包 5TB                   ¥600/月
Redis 缓存                   ¥200/月
SLB 负载均衡                 ¥150/月
─────────────────────────────────
总计                        ¥2,868/月 (≈$408)
年费                       ¥34,416/年
```

## 2. 关键产品选择

| 服务 | 当前 | 自托管方案 | 优势 |
|------|------|---------|------|
| 应用托管 | Vercel | 阿里云 ECS/ACK | 成本低 60% |
| 数据库 | Supabase | 阿里云 RDS | 国内访问快 |
| 文件存储 | Vercel Blob | 阿里云 OSS | 成本低 80% |
| CDN | Vercel | 阿里云 CDN | 国内加速 |
| 监控 | CloudWatch | 云监控 | 内置集成 |

## 3. 部署路线图

### Phase 1: 准备（1-2 天）
- [ ] 创建阿里云账户，完成实名认证
- [ ] 创建 VPC 和安全组
- [ ] 生成 AccessKey/SecureKey
- [ ] 导出 Supabase 数据

### Phase 2: 基础设施（2-3 天）
- [ ] 创建 RDS PostgreSQL 实例
- [ ] 导入数据库备份
- [ ] 配置 OSS 存储桶
- [ ] 开启 CDN 加速

### Phase 3: 部署应用（1-2 天）
- [ ] 构建 Docker 镜像
- [ ] 推送到阿里云 ACR
- [ ] 创建 ECS 实例
- [ ] 配置 PM2 和自动启动
- [ ] 配置 SLB 和 DNS

### Phase 4: 优化和监控（1 天）
- [ ] 启用自动扩展
- [ ] 配置云监控告警
- [ ] 性能优化
- [ ] 备份策略设置

## 4. 前置条件

### 本地准备
```bash
# 安装 Docker
brew install docker  # macOS
# 或 apt-get install docker.io  # Linux

# 安装阿里云 CLI
brew install aliyun-cli
```

### 阿里云账户准备
1. 开通以下服务：
   - 弹性计算服务 (ECS)
   - 关系型数据库 RDS
   - 对象存储 OSS
   - 容器镜像服务 ACR
   - 负载均衡 SLB
   - 云监控

2. 创建 RAM 用户（非根账户）
3. 绑定支付方式

## 5. 快速开始

```bash
# 1. 克隆本部署配置
git clone your-repo
cd deployment

# 2. 配置环境变量
cp .env.example .env.production
# 编辑 .env.production 填入阿里云信息

# 3. 本地测试
docker-compose -f docker-compose.prod.yml up

# 4. 推送镜像到阿里云 ACR
./scripts/push-to-acr.sh

# 5. 在阿里云 ECS 上部署
ssh root@your-ecs-ip
cd /app && docker pull registry.cn-hangzhou.aliyuncs.com/your-namespace/dog-is-ok:latest
docker-compose -f docker-compose.prod.yml up -d
```

## 6. 常见问题

**Q: 能节省多少成本？**
A: 相比 Vercel 的 $177/月，阿里云约 $98-408/月，节省 45-80%。

**Q: 需要运维吗？**
A: 初期需要，后续可用云监控自动告警。建议学习基本的 Linux 和 Docker 知识。

**Q: 如何实现高可用？**
A: 使用 RDS 高可用版 + ECS 多实例 + SLB，RPO < 1 分钟。

**Q: 数据安全吗？**
A: 支持自动备份、快照、VPC 隔离、RAM 权限控制。

## 7. 接下来的步骤

详见以下文件：
- `Dockerfile` - 容器配置
- `docker-compose.prod.yml` - 生产环境编排
- `ecosystem.config.js` - PM2 进程管理
- `aliyun-deployment.md` - 详细部署指南
- `scripts/` - 自动化脚本

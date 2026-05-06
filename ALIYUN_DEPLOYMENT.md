# 阿里云详细部署指南

## 第一步：阿里云账户和服务开通

### 1.1 创建阿里云账户
```bash
# 访问阿里云官网
https://www.aliyun.com

# 实名认证（必须）
# 个人/企业认证都支持，建议企业认证以获得更多配额
```

### 1.2 开通必需服务
在阿里云控制台开通以下服务：
1. **ECS** - 弹性计算服务
2. **RDS** - 关系型数据库（PostgreSQL）
3. **OSS** - 对象存储服务
4. **ACR** - 容器镜像服务
5. **SLB** - 负载均衡
6. **RAM** - 访问控制
7. **VPC** - 虚拟专用网络

### 1.3 创建 RAM 用户（推荐，非根账户）
```bash
# 1. 进入 RAM 控制台
# 2. 创建用户，勾选"编程访问"
# 3. 保存 AccessKey 和 SecureKey
# 4. 为用户赋予权限：
#    - AliyunECSFullAccess
#    - AliyunRDSFullAccess
#    - AliyunOSSFullAccess
#    - AliyunContainerRegistryFullAccess
```

---

## 第二步：准备数据库

### 2.1 创建 RDS PostgreSQL 实例
```bash
# 进入 RDS 控制台 → 创建实例

# 推荐配置：
# - 数据库引擎：PostgreSQL 15
# - 实例类型：mysql.n2.small（测试）或 mysql.n2.medium（生产）
# - 存储空间：100 GB
# - 高可用版（生产环境推荐）
# - VPC：选择你创建的 VPC

# 记下以下信息：
# - 数据库地址: rm-xxx.postgres.rds.aliyuncs.com
# - 端口: 5432
# - 数据库名: dog_is_ok
# - 用户名: postgres
# - 密码: (自设置)
```

### 2.2 配置安全组
```bash
# 进入 RDS 控制台 → 选择实例 → 安全组

# 添加入站规则：
# 规则: PostgreSQL
# 来源: 0.0.0.0/0 (或限制为 ECS 安全组)
# 端口: 5432
```

### 2.3 导入 Supabase 数据库
```bash
# 在本地机器上执行：
chmod +x scripts/export-supabase.sh
./scripts/export-supabase.sh

# 导出数据库为 SQL 文件
# 然后上传到 ECS 并在 RDS 中恢复
```

---

## 第三步：设置对象存储（OSS）

### 3.1 创建 OSS Bucket
```bash
# 进入 OSS 控制台 → 创建 Bucket

# 配置：
# - Bucket 名称: your-app-bucket
# - 地域: 华东1（杭州）或离用户最近的区域
# - 存储类型: 标准存储
# - 访问权限: 私有
# - 版本控制: 启用（可选）
# - 服务端加密: 启用（可选）
```

### 3.2 配置 Bucket 政策
```bash
# 进入 Bucket → 权限 → Bucket 政策

# 添加公开读取政策：
{
  "Version": "1",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "oss:GetObject",
    "Resource": "arn:oss:*:*:your-app-bucket/public/*"
  }]
}
```

### 3.3 配置 CORS（如需跨域上传）
```bash
# 进入 Bucket → 跨域设置

# 添加规则：
# 来源: https://your-domain.com
# 允许方法: GET, POST, PUT, DELETE
# 允许头: *
# 允许传递认证信息: 是
```

### 3.4 获取 AccessKey
```bash
# 进入 RAM 控制台 → 创建子用户专用 AccessKey
# 为该用户仅赋予 OSS 权限

# 保存：
# - AccessKey ID
# - AccessKey Secret
```

---

## 第四步：创建 ECS 实例

### 4.1 购买 ECS 实例
```bash
# 进入 ECS 控制台 → 创建实例

# 推荐配置（开发/测试）：
# - 操作系统: Ubuntu 20.04 LTS
# - 实例类型: t6.small (2 vCPU, 4 GB RAM) = ¥118/月
# - 公网带宽: 5 Mbps (按流量计费)
# - VPC: 选择你创建的 VPC
# - 安全组: 创建新安全组，允许 22（SSH）、80、443

# 推荐配置（生产）：
# - 实例类型: c7.large (2 vCPU, 8 GB RAM) = ¥468/月
# - 高可用: 创建多个实例 + SLB
# - 数据盘: 200 GB SSD
```

### 4.2 配置安全组
```bash
# 添加入站规则：
# - SSH (22) - 来源: 你的 IP
# - HTTP (80) - 来源: 0.0.0.0/0
# - HTTPS (443) - 来源: 0.0.0.0/0
```

### 4.3 连接 ECS
```bash
# 获取弹性 IP（EIP）
# 分配 EIP 到 ECS 实例

# SSH 连接
ssh -i your-key.pem ubuntu@your-eip
```

---

## 第五步：在 ECS 上部署应用

### 5.1 安装基础工具
```bash
# 连接到 ECS
ssh -i your-key.pem ubuntu@your-eip

# 更新系统
sudo apt-get update && sudo apt-get upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装 PM2（可选，用于日志管理）
sudo npm install -g pm2
```

### 5.2 克隆项目并配置
```bash
# 克隆你的项目
git clone https://github.com/your-repo/dog-is-ok.git
cd dog-is-ok

# 复制环境变量
cp .env.example .env.production

# 编辑环境变量
nano .env.production

# 需要填入：
# DATABASE_URL=postgresql://postgres:password@rm-xxx.postgres.rds.aliyuncs.com:5432/dog_is_ok
# ALIYUN_OSS_BUCKET=your-bucket
# ALIYUN_OSS_ACCESS_KEY_ID=xxx
# ALIYUN_OSS_ACCESS_KEY_SECRET=xxx
# OPENAI_API_KEY=sk-xxx
```

### 5.3 登录阿里云 ACR
```bash
# 生成阿里云临时登录令牌
# 进入 ACR 控制台 → 获取临时登录密码

docker login registry.cn-hangzhou.aliyuncs.com \
    -u your-aliyun-account \
    -p your-password
```

### 5.4 构建并启动应用
```bash
# 方法 1: 使用本地 Dockerfile（首次部署）
docker-compose -f docker-compose.prod.yml up -d

# 方法 2: 使用阿里云 ACR（推荐，持续更新）
# 1. 在本地构建和推送镜像
./scripts/push-to-acr.sh

# 2. 在 ECS 上拉取最新镜像
docker pull registry.cn-hangzhou.aliyuncs.com/your-namespace/dog-is-ok:latest
docker-compose -f docker-compose.prod.yml up -d
```

### 5.5 验证部署
```bash
# 查看容器状态
docker ps

# 查看应用日志
docker logs -f dog-is-ok-app

# 测试应用
curl http://localhost:3000/health

# 查看数据库连接
docker exec dog-is-ok-app psql $DATABASE_URL -c "SELECT 1"
```

---

## 第六步：配置域名和 HTTPS

### 6.1 配置 DNS
```bash
# 进入你的域名提供商（如阿里云域名）
# 添加 A 记录，指向 ECS 的弹性 IP

# 记录类型: A
# 主机记录: @ (或 www)
# 记录值: your-eip
# TTL: 600
```

### 6.2 获取 SSL 证书
```bash
# 方法 1: 免费 Let's Encrypt（使用 Certbot）
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
# 证书位置: /etc/letsencrypt/live/your-domain.com/

# 方法 2: 阿里云 SSL 证书（付费或免费）
# 进入阿里云证书控制台 → 申请证书 → 下载
# 将证书上传到 ECS: /etc/nginx/certs/
```

### 6.3 配置 Nginx
```bash
# 上传 nginx.conf
scp -i your-key.pem nginx.conf ubuntu@your-eip:~/

# 将证书复制到 Nginx 目录
sudo mkdir -p /etc/nginx/certs
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /etc/nginx/certs/your-domain.com.crt
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /etc/nginx/certs/your-domain.com.key
sudo chmod 644 /etc/nginx/certs/*

# 重启容器
docker-compose -f docker-compose.prod.yml restart nginx
```

### 6.4 自动续签 SSL 证书（Let's Encrypt）
```bash
# 创建续签脚本
sudo nano /usr/local/bin/renew-ssl.sh

#!/bin/bash
certbot renew --quiet
docker-compose -f /path/to/docker-compose.prod.yml restart nginx

# 添加定时任务（每天凌晨 2 点）
sudo crontab -e
# 0 2 * * * /usr/local/bin/renew-ssl.sh
```

---

## 第七步：监控和维护

### 7.1 启用阿里云监控
```bash
# 进入云监控控制台
# 创建告警规则：
# - CPU 使用率 > 70%
# - 内存使用率 > 80%
# - 磁盘使用率 > 85%
# - 数据库连接数 > 80
```

### 7.2 备份策略
```bash
# 自动备份数据库（RDS 自动备份）
# 进入 RDS 实例 → 备份和恢复 → 备份设置
# 备份周期: 每天
# 备份保留: 7 天

# 备份 OSS 数据
# 定期导出重要文件到本地
```

### 7.3 日志管理
```bash
# 查看应用日志
docker logs -f dog-is-ok-app

# 导出日志
docker logs dog-is-ok-app > app.log

# 导入阿里云日志服务（可选）
# 在应用中集成日志服务 SDK
```

### 7.4 定期更新和维护
```bash
# 每月更新一次依赖
docker-compose pull
docker-compose -f docker-compose.prod.yml up -d

# 定期安全检查
docker ps  # 确保所有容器运行中
docker stats  # 检查资源占用
df -h  # 检查磁盘空间
```

---

## 故障排查

### 常见问题

**Q: 无法连接数据库**
A: 
```bash
# 检查 RDS 安全组规则
# 检查 DATABASE_URL 格式
# 测试连接
psql postgresql://user:pass@host:5432/db
```

**Q: 容器无法启动**
A:
```bash
# 查看错误日志
docker logs dog-is-ok-app
# 检查环境变量是否正确
docker exec dog-is-ok-app env | grep DATABASE
```

**Q: 磁盘空间不足**
A:
```bash
# 查看磁盘使用
df -h
# 清理 Docker 镜像
docker system prune -a
```

**Q: 应用响应缓慢**
A:
```bash
# 检查服务器资源
docker stats
# 查看数据库连接数
psql $DATABASE_URL -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

---

## 成本优化

1. **预留实例** - 购买 1 年期 ECS，可节省 30-40%
2. **流量包** - 购买流量包比按量计费便宜 30%
3. **数据库优化** - 使用只读副本分散读查询
4. **对象存储分层** - 将冷数据迁移到低频存储

---

## 后续升级

- 添加 Redis 缓存层
- 配置 CDN 加速
- 实施数据库读写分离
- 使用 Kubernetes 容器编排（ACK）

#!/bin/bash
# 部署脚本 - 自动化推送到阿里云 ACR

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}阿里云 ACR 推送脚本${NC}"
echo "================================"

# 1. 检查环境变量
if [ -z "$ALIYUN_REGISTRY" ] || [ -z "$ALIYUN_NAMESPACE" ]; then
    echo -e "${RED}错误：未设置 ALIYUN_REGISTRY 或 ALIYUN_NAMESPACE${NC}"
    echo "请设置："
    echo "  export ALIYUN_REGISTRY=registry.cn-hangzhou.aliyuncs.com"
    echo "  export ALIYUN_NAMESPACE=your-namespace"
    exit 1
fi

# 2. 读取 Git 信息
COMMIT_HASH=$(git rev-parse --short HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_TAG="$BRANCH-$TIMESTAMP-$COMMIT_HASH"
LATEST_TAG="$BRANCH-latest"

REGISTRY_URL="$ALIYUN_REGISTRY/$ALIYUN_NAMESPACE/dog-is-ok"

echo -e "${YELLOW}构建信息：${NC}"
echo "  仓库地址: $REGISTRY_URL"
echo "  镜像标签: $IMAGE_TAG"
echo "  最新标签: $LATEST_TAG"
echo ""

# 3. 登录阿里云（需要提前配置 AccessKey）
echo -e "${YELLOW}登录阿里云 ACR...${NC}"
if [ -n "$ALIYUN_ACCESS_KEY" ] && [ -n "$ALIYUN_SECRET_KEY" ]; then
    echo "$ALIYUN_SECRET_KEY" | docker login -u "$ALIYUN_ACCESS_KEY" --password-stdin "$ALIYUN_REGISTRY"
    echo -e "${GREEN}✓ 登录成功${NC}"
else
    echo -e "${YELLOW}⚠ 使用本地 Docker 配置登录（确保已执行 docker login）${NC}"
fi
echo ""

# 4. 构建镜像
echo -e "${YELLOW}构建 Docker 镜像...${NC}"
docker build -t "$REGISTRY_URL:$IMAGE_TAG" \
             -t "$REGISTRY_URL:$LATEST_TAG" \
             -t "$REGISTRY_URL:latest" \
             .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 镜像构建成功${NC}"
else
    echo -e "${RED}✗ 镜像构建失败${NC}"
    exit 1
fi
echo ""

# 5. 推送镜像
echo -e "${YELLOW}推送镜像到 ACR...${NC}"
docker push "$REGISTRY_URL:$IMAGE_TAG"
docker push "$REGISTRY_URL:$LATEST_TAG"
docker push "$REGISTRY_URL:latest"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 镜像推送成功${NC}"
else
    echo -e "${RED}✗ 镜像推送失败${NC}"
    exit 1
fi
echo ""

# 6. 输出信息
echo -e "${GREEN}部署信息已准备完毕！${NC}"
echo ""
echo "在阿里云 ECS 上执行："
echo -e "  ${YELLOW}docker pull $REGISTRY_URL:$LATEST_TAG${NC}"
echo -e "  ${YELLOW}docker-compose -f docker-compose.prod.yml up -d${NC}"
echo ""

# 7. 保存镜像信息到文件（用于 CI/CD）
cat > .deployment_info.json << EOF
{
  "registry": "$ALIYUN_REGISTRY",
  "namespace": "$ALIYUN_NAMESPACE",
  "image": "dog-is-ok",
  "tag": "$IMAGE_TAG",
  "latest_tag": "$LATEST_TAG",
  "full_url": "$REGISTRY_URL:$LATEST_TAG",
  "commit": "$COMMIT_HASH",
  "branch": "$BRANCH",
  "timestamp": "$TIMESTAMP"
}
EOF

echo -e "${GREEN}✓ 部署信息已保存至 .deployment_info.json${NC}"

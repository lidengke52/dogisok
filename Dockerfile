FROM node:18-alpine

# 安装 PM2 和基础工具
RUN npm install -g pm2 && \
    apk add --no-cache curl

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production && \
    npm cache clean --force

# 复制应用代码
COPY . .

# 构建 Next.js
RUN npm run build

# PM2 日志目录
RUN mkdir -p /app/logs

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 暴露端口
EXPOSE 3000

# 运行 PM2（以前台模式）
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

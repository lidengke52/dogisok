#!/bin/bash

# Git commit and merge script
cd /vercel/share/v0-project

# 1. Add all changes
git add -A

# 2. Commit with a descriptive message
git commit -m "feat: 优化手机端显示和迁移准备

- 添加数字格式化工具 (30M+, 1.7K+ 等紧凑显示)
- 优化 hero 部分统计数据的手机端展示
- 创建完整的阿里云迁移计划文档
- 添加存储配置工具，支持 Vercel Blob 和阿里云 OSS 无缝切换
- 更新环保变量配置示例
- 移除所有 v0.app 引用
- 清理不必要的文档文件"

# 3. Show commit status
echo "=========================================="
echo "✅ Commit completed successfully!"
echo "=========================================="
git log --oneline -1

# 4. Show current branch
echo ""
echo "Current branch:"
git branch

# 5. Show status
echo ""
echo "Git status:"
git status

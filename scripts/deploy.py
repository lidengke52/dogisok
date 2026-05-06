#!/usr/bin/env python3

import subprocess
import os
import sys

os.chdir('/vercel/share/v0-project')

try:
    # 1. Add all changes
    print("📝 Adding all changes...")
    subprocess.run(['git', 'add', '-A'], check=True)
    
    # 2. Commit
    print("💾 Committing changes...")
    commit_message = """feat: 优化手机端显示和迁移准备

- 添加数字格式化工具 (30M+, 1.7K+ 等紧凑显示)
- 优化 hero 部分统计数据的手机端展示
- 创建完整的阿里云迁移计划文档
- 添加存储配置工具，支持 Vercel Blob 和阿里云 OSS 无缝切换
- 更新环保变量配置示例
- 移除所有 v0.app 引用
- 清理不必要的文档文件"""
    
    subprocess.run(['git', 'commit', '-m', commit_message], check=True)
    
    # 3. Show status
    print("\n" + "="*50)
    print("✅ Commit completed successfully!")
    print("="*50)
    
    result = subprocess.run(['git', 'log', '--oneline', '-1'], capture_output=True, text=True)
    print("Latest commit:", result.stdout)
    
    # 4. Show branch
    print("\nCurrent branch:")
    result = subprocess.run(['git', 'branch', '-v'], capture_output=True, text=True)
    print(result.stdout)
    
    # 5. Push to remote
    print("\n🚀 Pushing to GitHub...")
    subprocess.run(['git', 'push'], check=True)
    
    print("\n✅ Push completed! Vercel will auto-deploy now.")
    print("Check your Vercel dashboard for deployment status.")
    
except subprocess.CalledProcessError as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)

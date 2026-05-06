#!/bin/bash
# Supabase 数据导出脚本

set -e

echo "=========================================="
echo "Supabase 数据库导出脚本"
echo "=========================================="
echo ""

# 检查 pg_dump 是否安装
if ! command -v pg_dump &> /dev/null; then
    echo "错误：pg_dump 未安装"
    echo "请安装 PostgreSQL 客户端工具："
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# 读取配置
read -p "输入 Supabase 数据库主机 (例: db.xxx.supabase.co): " SUPABASE_HOST
read -p "输入数据库名称 (默认: postgres): " SUPABASE_DB
SUPABASE_DB=${SUPABASE_DB:-postgres}
read -p "输入数据库用户 (默认: postgres): " SUPABASE_USER
SUPABASE_USER=${SUPABASE_USER:-postgres}
read -sp "输入数据库密码: " SUPABASE_PASSWORD
echo ""

# 生成导出文件名
BACKUP_FILE="supabase_backup_$(date +%Y%m%d_%H%M%S).sql"

echo ""
echo "开始导出数据库..."
echo "主机: $SUPABASE_HOST"
echo "数据库: $SUPABASE_DB"
echo "输出文件: $BACKUP_FILE"
echo ""

# 导出数据库
PGPASSWORD="$SUPABASE_PASSWORD" pg_dump \
    -h "$SUPABASE_HOST" \
    -U "$SUPABASE_USER" \
    -d "$SUPABASE_DB" \
    -Fc \
    --verbose \
    -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 数据库导出成功！"
    echo "备份文件: $BACKUP_FILE"
    echo "文件大小: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo ""
    echo "接下来，在新的 PostgreSQL 实例上执行："
    echo "  pg_restore -h your_host -U postgres -d dog_is_ok $BACKUP_FILE"
else
    echo ""
    echo "✗ 数据库导出失败"
    exit 1
fi

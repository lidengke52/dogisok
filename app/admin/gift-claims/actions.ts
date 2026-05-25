'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'

export async function exportGiftClaimsCSV(status?: string) {
  // 验证管理员身份
  const sessionClient = await createClient()
  const {
    data: { user },
  } = await sessionClient.auth.getUser()
  if (!user) redirect('/admin/login')
  if (!(await isAdmin(user.id))) redirect('/')

  // 用 admin client 绕过 RLS
  const supabase = createAdminClient()

  // 构建查询（与页面的表格逻辑一致）
  let query = supabase
    .from('gift_claims')
    .select(
      `
      id,
      created_at,
      user_id,
      product_id,
      status,
      recipient_name,
      address,
      profiles:user_id(display_name, email),
      products:product_id(name)
      `
    )
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`查询失败: ${error.message}`)
  }

  // 生成 CSV 内容
  const headers = ['申请时间', '用户', '邮箱', '收件人', '收货地址', '商品', '状态']
  const rows = (data || []).map((claim: any) => [
    new Date(claim.created_at).toLocaleString('zh-CN'),
    claim.profiles?.display_name || claim.user_id,
    claim.profiles?.email || '',
    claim.recipient_name || '',
    claim.address || '',
    claim.products?.name || '',
    getStatusLabel(claim.status),
  ])

  // 将 CSV 数据编码为 UTF-8 with BOM（Excel 正确显示中文）
  const csv = [
    '\uFEFF' + headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  return csv
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待处理',
    approved: '已审核',
    shipped: '已发货',
    rejected: '已拒绝',
  }
  return labels[status] || status
}

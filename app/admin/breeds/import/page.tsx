import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { BulkImportBreedsForm } from '@/components/admin/bulk-import-breeds-form'

export const metadata = {
  title: '批量导入品种 · 管理后台',
  description: '从 XLSX 或 CSV 文件批量导入狗品种',
}

export default async function ImportBreedsPage() {
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user || !(await isAdmin(user.id))) {
    redirect('/admin/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">批量导入品种</h1>
        <p className="text-muted-foreground mt-2">
          从 XLSX 或 CSV 文件批量导入狗品种数据
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <BulkImportBreedsForm />
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-sm text-blue-900">
        <h3 className="font-semibold mb-2">文件格式要求：</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>表头行: 中文名、英文名、描述、原产地、寿命、体重范围、身高范围、性格特征、护理建议、常见疾病、分类、体型、训练难度、掉毛程度、运动需求、适合与孩子相处</li>
          <li>每行代表一个品种</li>
          <li>支持格式: XLSX、XLS、CSV</li>
        </ul>
      </div>
    </div>
  )
}

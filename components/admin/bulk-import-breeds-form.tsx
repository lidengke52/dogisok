'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { importBreedsBulk } from '@/app/admin/breeds/actions'

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
}

function parseArrayField(value: string): string[] {
  if (!value) return []
  return value.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
}

export function BulkImportBreedsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [allRows, setAllRows] = useState<any[]>([])
  const [preview, setPreview] = useState<any[]>([])
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setAllRows([])
    setPreview([])
    setIsLoading(true)

    try {
      // 上传到服务器端解析（避免在浏览器直接引用 xlsx 包导致水合失败）
      const form = new FormData()
      form.append('file', selectedFile)
      const res = await fetch('/api/breeds/parse', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '解析失败')
      }

      const rows: any[] = data.breeds
      if (rows.length === 0) {
        toast({ title: '文件为空', description: '未找到有效数据行，请确认文件格式', variant: 'destructive' })
        return
      }

      setAllRows(rows)
      setPreview(rows.slice(0, 5).map((row, idx) => ({
        ...row,
        slug: generateSlug(row.name || row.cn_name || `breed-${idx}`),
      })))

      toast({ title: '文件已加载', description: `共 ${rows.length} 个品种，确认后点击导入全部` })
    } catch (err) {
      toast({ title: '解析失败', description: err instanceof Error ? err.message : '文件解析失败', variant: 'destructive' })
      setFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (!allRows.length) return

    setIsLoading(true)
    try {
      const breedsToImport = allRows.map((row, idx) => ({
        name: row.name || row.cn_name || `Breed ${idx}`,
        cn_name: row.cn_name || null,
        slug: generateSlug(row.name || row.cn_name || `breed-${idx}`),
        group_name: row.group_name || 'Non-Sporting',
        origin: row.origin || null,
        size: row.size || 'Medium',
        lifespan: row.lifespan || null,
        weight: row.weight || null,
        height: row.height || null,
        temperament: parseArrayField(row.temperament || ''),
        good_with_kids: row.good_with_kids ?? false,
        trainability: row.trainability || 3,
        shedding: row.shedding || 3,
        exercise: row.exercise || 3,
        summary: row.summary || null,
        care_notes: parseArrayField(row.care_notes || ''),
        common_health: parseArrayField(row.common_health || ''),
        is_published: true,
        display_order: idx,
      }))

      await importBreedsBulk(breedsToImport)

      toast({ title: '导入成功', description: `成功导入 ${breedsToImport.length} 个品种` })
      setFile(null)
      setAllRows([])
      setPreview([])
    } catch (err) {
      toast({ title: '导入失败', description: err instanceof Error ? err.message : '导入失败', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">上传 XLSX 或 CSV 文件</label>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
        <p className="text-xs text-muted-foreground">支持格式: XLSX、XLS、CSV</p>
      </div>

      {preview.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">预览（前 5 行，共 {allRows.length} 条）</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-3 py-2 text-left">英文名</th>
                  <th className="px-3 py-2 text-left">中文名</th>
                  <th className="px-3 py-2 text-left">Slug</th>
                  <th className="px-3 py-2 text-left">分类</th>
                  <th className="px-3 py-2 text-left">体型</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.cn_name}</td>
                    <td className="px-3 py-2 font-mono">{row.slug}</td>
                    <td className="px-3 py-2">{row.group_name}</td>
                    <td className="px-3 py-2">{row.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleImport} disabled={!allRows.length || isLoading}>
          {isLoading ? '处理中...' : `导入全部${allRows.length ? `（${allRows.length} 条）` : ''}`}
        </Button>
        {file && (
          <Button variant="outline" onClick={() => { setFile(null); setAllRows([]); setPreview([]) }} disabled={isLoading}>
            清空
          </Button>
        )}
      </div>
    </div>
  )
}

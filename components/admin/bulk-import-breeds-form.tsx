'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { importBreedsBulk } from '@/app/admin/breeds/actions'
import { parseBreedFile, generateSlug, parseArrayField } from '@/lib/xlsx-parser'

export function BulkImportBreedsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    try {
      setIsLoading(true)
      const rows = await parseBreedFile(selectedFile)
      
      // Preview first 5 rows
      const previewData = rows.slice(0, 5).map((row, idx) => ({
        ...row,
        slug: generateSlug(row.name || row.cn_name || `breed-${idx}`),
      }))
      
      setFile(selectedFile)
      setPreview(previewData)
      toast({
        title: 'File loaded',
        description: `Ready to import ${rows.length} breeds`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to parse file',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return

    try {
      setIsLoading(true)
      const rows = await parseBreedFile(file)
      
      // Prepare data for import
      const breedsToImport = rows.map((row, idx) => ({
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
      
      toast({
        title: 'Success',
        description: `Imported ${breedsToImport.length} breeds successfully`,
      })
      
      setFile(null)
      setPreview([])
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Import failed',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Upload XLSX or CSV file
        </label>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-muted-foreground">
          Supported formats: XLSX, XLS, CSV
        </p>
      </div>

      {preview.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Preview (first 5 rows)</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-3 py-2 text-left">Name (EN)</th>
                  <th className="px-3 py-2 text-left">Name (CN)</th>
                  <th className="px-3 py-2 text-left">Slug</th>
                  <th className="px-3 py-2 text-left">Group</th>
                  <th className="px-3 py-2 text-left">Size</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.cn_name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.slug}</td>
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
        <Button
          onClick={handleImport}
          disabled={!file || isLoading}
          loading={isLoading}
        >
          {isLoading ? 'Importing...' : 'Import All'}
        </Button>
        {file && (
          <Button
            variant="outline"
            onClick={() => {
              setFile(null)
              setPreview([])
            }}
            disabled={isLoading}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}

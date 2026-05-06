"use client"

import Link from "next/link"
import { useActionState, useRef, useState } from "react"
import { Upload, FileText, Check, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { bulkImportCases, type FeaturedCaseFormState } from "@/app/admin/featured-cases/actions"

const initialState: FeaturedCaseFormState = {}

const SAMPLE_CSV = `dog_breed,dog_age,symptom,ai_answer,display_order
Golden Retriever,adult,"My dog has been vomiting after meals.","This may indicate gastrointestinal issues. Recommendations: 1) Switch to bland diet, 2) Monitor hydration, 3) Consult vet if symptoms persist beyond 48 hours.",1
Labrador,senior,"Difficulty standing and stair climbing.","Likely arthritis progression. Recommendations: joint supplements, orthopedic bedding, gentle exercise.",2`

export function BulkImportForm() {
  const [state, formAction, pending] = useActionState(bulkImportCases, initialState)
  const [csvText, setCsvText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = String(event.target?.result || "")
      setCsvText(text)
    }
    reader.readAsText(file)
  }

  function loadSample() {
    setCsvText(SAMPLE_CSV)
  }

  function downloadTemplate() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "featured-cases-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold">CSV 格式说明</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              必填列:{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">dog_breed</code>
              {", "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">dog_age</code>
              {", "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">symptom</code>
              {", "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">ai_answer</code>。可选列:{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">display_order</code>。
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              字段中含有英文逗号或换行时,需要用英文双引号包裹。字段内的引号请用{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">&quot;&quot;</code> 进行转义。
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5 bg-transparent" onClick={downloadTemplate}>
            <FileDown className="h-4 w-4" /> 下载模板
          </Button>
          <Button type="button" variant="outline" size="sm" className="bg-transparent" onClick={loadSample}>
            载入示例
          </Button>
        </div>
      </div>

      <form action={formAction} className="space-y-6 rounded-2xl border border-border bg-card p-6">
        {state.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
            <Check className="h-4 w-4" />
            已成功导入 {state.importedCount} 条案例。
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="csv_file">上传 CSV 文件</Label>
          <input
            id="csv_file"
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
          />
          <p className="text-xs text-muted-foreground">或者直接在下方粘贴 CSV 内容。</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv_text">CSV 内容</Label>
          <Textarea
            id="csv_text"
            name="csv_text"
            rows={14}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="dog_breed,dog_age,symptom,ai_answer,display_order&#10;Golden Retriever,adult,..."
            className="font-mono text-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/featured-cases">取消</Link>
          </Button>
          <Button type="submit" disabled={pending || !csvText.trim()} className="gap-1.5">
            <Upload className="h-4 w-4" />
            {pending ? "导入中..." : "开始导入"}
          </Button>
        </div>
      </form>
    </div>
  )
}

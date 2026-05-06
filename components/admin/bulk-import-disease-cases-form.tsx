"use client"

import { useActionState, useRef } from "react"
import Link from "next/link"
import { Upload, Download, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { bulkImportDiseaseCases } from "@/app/admin/featured-disease-cases/actions"

const SAMPLE_CSV = `dog_breed,dog_age,symptom,self_check_content,display_order,is_active
Golden Retriever,adult,"Frequent ear scratching, head shaking, and a yeasty smell from the ear.","Possible causes: Otitis externa. Urgency: Routine. Home care: 1) Clean outer ear, 2) Avoid water in ears. Red flags: severe pain, head tilt — see vet.",1,true
Beagle,puppy,"Loose stools for 2 days with normal energy.","Possible causes: dietary indiscretion or mild stress. Urgency: Self-care. Home care: 1) Bland diet, 2) Probiotics. Red flags: blood in stool, vomiting — see vet.",2,true
`

const TEMPLATE_CSV = `dog_breed,dog_age,symptom,self_check_content,display_order,is_active
,,,,0,true
`

export function BulkImportDiseaseCasesForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(bulkImportDiseaseCases, null)

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "featured-disease-cases-template.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function loadSample() {
    const textarea = formRef.current?.querySelector<HTMLTextAreaElement>('[name="pasted"]')
    if (textarea) textarea.value = SAMPLE_CSV
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold">CSV 格式说明</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              必填列:<code className="rounded bg-muted px-1 py-0.5 text-xs">dog_breed</code>、{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">dog_age</code>、{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">symptom</code>、{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">self_check_content</code>。可选列:{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">display_order</code>、{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">is_active</code>。
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-1.5 bg-transparent" onClick={downloadTemplate}>
                <Download className="h-3.5 w-3.5" /> 下载模板
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={loadSample}>
                载入示例数据
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <label htmlFor="file" className="text-sm font-medium">
            上传 CSV 文件
          </label>
          <p className="mt-1 text-xs text-muted-foreground">或在下方直接粘贴内容。</p>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-secondary/80"
          />
        </div>

        <div>
          <label htmlFor="pasted" className="text-sm font-medium">
            或粘贴 CSV 内容
          </label>
          <Textarea
            id="pasted"
            name="pasted"
            rows={10}
            className="mt-2 font-mono text-xs"
            placeholder="dog_breed,dog_age,symptom,self_check_content,display_order,is_active&#10;Golden Retriever,adult,..."
          />
        </div>
      </div>

      {state?.ok ? (
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-primary">已成功导入 {state.inserted} 条案例。</p>
            {state.errors && state.errors.length > 0 ? (
              <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                {state.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            ) : null}
            <Link
              href="/admin/featured-disease-cases"
              className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
            >
              查看全部案例 →
            </Link>
          </div>
        </div>
      ) : null}

      {state && !state.ok ? (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">{state.message}</p>
            {state.errors && state.errors.length > 0 ? (
              <ul className="mt-2 list-disc pl-5 text-xs text-destructive/80">
                {state.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={isPending} className="gap-1.5">
          <Upload className="h-4 w-4" />
          {isPending ? "导入中..." : "开始导入"}
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useActionState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { bulkImportMedications, type BulkImportState } from "@/app/admin/medications/actions"

const TEMPLATE_HEADER = "name,indications,applicable_pets,usage_method,dosage,precautions,category,is_active"
const TEMPLATE_SAMPLE = `${TEMPLATE_HEADER}
Amoxicillin,"Broad-spectrum antibiotic for bacterial infections.","Dogs, Cats","Oral, with or without food.","10-20 mg per kg every 12 hours","Avoid in penicillin-allergic pets. Complete the full course.",normal,true
Aspirin,"Pain relief and anti-inflammatory.","Dogs (with caution); not cats","Oral, with food.","5-10 mg per kg every 12 hours, short term","High GI ulcer risk. Never give to cats.",caution,true
Ibuprofen,"Human NSAID pain reliever.",NONE — toxic to all pets,DO NOT ADMINISTER,No safe dose,Severe GI ulceration and kidney failure. Lethal in small amounts.,forbidden,true`

function downloadTemplate() {
  const blob = new Blob([`${TEMPLATE_HEADER}\n`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "medications-template.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export function BulkImportMedicationsForm() {
  const [state, formAction, pending] = useActionState<BulkImportState, FormData>(bulkImportMedications, null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function loadSample() {
    if (textareaRef.current) textareaRef.current.value = TEMPLATE_SAMPLE
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
          下载 CSV 模板
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={loadSample}>
          载入示例数据
        </Button>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="file">上传 CSV 或 Excel 文件</FieldLabel>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
          <FieldDescription>
            支持 .csv、.xlsx、.xls。第一行为表头。英文表头(name、indications、applicable_pets、
            usage_method、dosage、precautions、category)与中文表头(药品名称、主治功能、适用宠物、用法、
            用量、使用注意事项、属性)均可识别。分类列可填 normal/caution/forbidden 或
            常规/慎用/禁用(例如&ldquo;宠物禁用药物&rdquo;)。
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="pasted">或粘贴 CSV 内容</FieldLabel>
          <Textarea
            id="pasted"
            name="pasted"
            ref={textareaRef}
            rows={10}
            placeholder={TEMPLATE_HEADER}
            className="font-mono text-xs"
          />
        </Field>
      </FieldGroup>

      {state ? (
        <div
          className={
            state.ok
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {state.ok ? (
            <>
              <p className="font-semibold">已成功导入 {state.imported} 条药品。</p>
              {state.errors?.length ? (
                <ul className="mt-1 list-disc pl-5 text-xs">
                  {state.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <>
              <p className="font-semibold">{state.message}</p>
              {state.errors?.length ? (
                <ul className="mt-1 list-disc pl-5 text-xs">
                  {state.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button asChild type="button" variant="outline">
          <Link href="/admin/medications">完成</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "导入中..." : "开始导入"}
        </Button>
      </div>
    </form>
  )
}

"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import type { Medication } from "@/lib/medications"
import type { MedicationFormState } from "@/app/admin/medications/actions"

type Props = {
  action: (prev: MedicationFormState, formData: FormData) => Promise<MedicationFormState>
  medication?: Medication
  submitLabel: string
}

export function MedicationForm({ action, medication, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<MedicationFormState, FormData>(action, null)

  return (
    <form action={formAction} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">药品名称</FieldLabel>
          <Input id="name" name="name" required defaultValue={medication?.name ?? ""} placeholder="例如:阿莫西林" />
        </Field>

        <Field>
          <FieldLabel htmlFor="category">分类</FieldLabel>
          <select
            id="category"
            name="category"
            defaultValue={medication?.category ?? "normal"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="normal">常规 — 兽医认可可使用</option>
            <option value="caution">慎用 — 需在兽医指导下使用</option>
            <option value="forbidden">禁用 — 严禁给宠物使用</option>
          </select>
          <FieldDescription>该分类决定该药品在前台页面的展示位置。</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="indications">主治功能</FieldLabel>
          <Textarea
            id="indications"
            name="indications"
            required
            rows={3}
            defaultValue={medication?.indications ?? ""}
            placeholder="该药品主要用于治疗什么?"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="applicable_pets">适用宠物</FieldLabel>
          <Input
            id="applicable_pets"
            name="applicable_pets"
            required
            defaultValue={medication?.applicable_pets ?? ""}
            placeholder="例如:犬、猫"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="usage_method">用法</FieldLabel>
          <Textarea
            id="usage_method"
            name="usage_method"
            required
            rows={2}
            defaultValue={medication?.usage_method ?? ""}
            placeholder="如何给药?"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="dosage">用量</FieldLabel>
          <Textarea
            id="dosage"
            name="dosage"
            required
            rows={2}
            defaultValue={medication?.dosage ?? ""}
            placeholder="例如:每公斤体重 10-20 mg, 每 12 小时一次"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="precautions">使用注意事项</FieldLabel>
          <Textarea
            id="precautions"
            name="precautions"
            required
            rows={3}
            defaultValue={medication?.precautions ?? ""}
            placeholder="副作用、禁忌、警示信息"
          />
        </Field>

        <Field orientation="horizontal">
          <Switch id="is_active" name="is_active" defaultChecked={medication?.is_active ?? true} />
          <FieldLabel htmlFor="is_active">在前台页面显示</FieldLabel>
        </Field>
      </FieldGroup>

      {state && !state.ok ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/medications">取消</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}

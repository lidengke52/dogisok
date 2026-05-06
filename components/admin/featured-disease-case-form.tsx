"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  createDiseaseCase,
  updateDiseaseCase,
  type DiseaseCaseFormState,
} from "@/app/admin/featured-disease-cases/actions"

type Initial = {
  id?: string
  dog_breed?: string
  dog_age?: string
  symptom?: string
  self_check_content?: string
  display_order?: number
  is_active?: boolean
}

export function FeaturedDiseaseCaseForm({ initial }: { initial?: Initial }) {
  const router = useRouter()
  const isEdit = Boolean(initial?.id)

  const action = isEdit
    ? (state: DiseaseCaseFormState, formData: FormData) =>
        updateDiseaseCase(initial!.id!, state, formData)
    : createDiseaseCase

  const [state, formAction, isPending] = useActionState<DiseaseCaseFormState, FormData>(action, null)

  return (
    <form action={formAction} className="space-y-6">
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="dog_breed">犬种</FieldLabel>
            <Input
              id="dog_breed"
              name="dog_breed"
              required
              defaultValue={initial?.dog_breed ?? ""}
              placeholder="例如:金毛"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="dog_age">生命阶段</FieldLabel>
            <Input
              id="dog_age"
              name="dog_age"
              required
              defaultValue={initial?.dog_age ?? ""}
              placeholder="幼犬 / 成犬 / 老年犬"
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="symptom">症状描述</FieldLabel>
          <Textarea
            id="symptom"
            name="symptom"
            required
            rows={3}
            defaultValue={initial?.symptom ?? ""}
            placeholder="例如:频繁抓耳朵、甩头,耳道有酵母味。"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="self_check_content">自查内容</FieldLabel>
          <Textarea
            id="self_check_content"
            name="self_check_content"
            required
            rows={8}
            defaultValue={initial?.self_check_content ?? ""}
            placeholder="可能原因... 紧急程度... 居家护理... 需要就医的红色警报..."
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="display_order">显示顺序</FieldLabel>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={initial?.display_order ?? 0}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">数字小的优先展示。</p>
          </Field>
          <div className="flex items-end">
            <Label className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <span className="flex flex-col">
                <span className="text-sm font-medium">显示中</span>
                <span className="text-xs text-muted-foreground">在自查页可见。</span>
              </span>
              <Switch name="is_active" defaultChecked={initial?.is_active ?? true} />
            </Label>
          </div>
        </div>
      </FieldGroup>

      {state && !state.ok ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.message ?? "操作出错,请重试。"}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          取消
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : isEdit ? "保存修改" : "创建案例"}
        </Button>
      </div>
    </form>
  )
}

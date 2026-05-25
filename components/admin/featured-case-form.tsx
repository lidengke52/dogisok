"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  createFeaturedCase,
  updateFeaturedCase,
  type FeaturedCaseFormState,
} from "@/app/admin/featured-cases/actions"

type FeaturedCase = {
  id: string
  dog_breed: string
  dog_age: string
  symptom: string
  ai_answer: string
  display_order: number
  is_active: boolean
}

const initialState: FeaturedCaseFormState = {}

export function FeaturedCaseForm({ caseItem }: { caseItem?: FeaturedCase }) {
  const isEdit = !!caseItem
  const action = isEdit ? updateFeaturedCase.bind(null, caseItem!.id) : createFeaturedCase
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dog_breed">犬种 *</Label>
          <Input
            id="dog_breed"
            name="dog_breed"
            placeholder="例如:金毛"
            defaultValue={caseItem?.dog_breed ?? ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dog_age">生命阶段 *</Label>
          <Input
            id="dog_age"
            name="dog_age"
            placeholder="例如:幼犬 / 成犬 / 老年犬"
            defaultValue={caseItem?.dog_age ?? ""}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptom">症状 / 问题 *</Label>
        <Textarea
          id="symptom"
          name="symptom"
          rows={3}
          placeholder="描述主人咨询的内容"
          defaultValue={caseItem?.symptom ?? ""}
          required
        />
        <p className="text-xs text-muted-foreground">
          作为案例卡片的标题展示。文本过长会自动折叠并显示&ldquo;展开&rdquo;按钮。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai_answer">AI 回答 *</Label>
        <Textarea
          id="ai_answer"
          name="ai_answer"
          rows={8}
          placeholder="Dr. Max 针对该案例给出的完整回复"
          defaultValue={caseItem?.ai_answer ?? ""}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="display_order">显示顺序</Label>
          <Input
            id="display_order"
            name="display_order"
            type="number"
            placeholder="0"
            defaultValue={caseItem?.display_order ?? 0}
          />
          <p className="text-xs text-muted-foreground">数字小的优先展示。</p>
        </div>

        <div className="flex items-center gap-3 pt-7">
          <Switch
            id="is_active"
            name="is_active"
            defaultChecked={caseItem?.is_active ?? true}
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            在问诊页可见
          </Label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/featured-cases">取消</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中..." : isEdit ? "保存修改" : "创建案例"}
        </Button>
      </div>
    </form>
  )
}

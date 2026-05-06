"use client"

import { useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Pencil } from "lucide-react"

type Props = {
  name: string
  defaultValue?: string
  rows?: number
}

export function MarkdownEditor({ name, defaultValue = "", rows = 20 }: Props) {
  const [value, setValue] = useState(defaultValue)
  const [mode, setMode] = useState<"edit" | "preview">("edit")

  const chars = useMemo(() => value.length, [value])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-md border border-border bg-background p-0.5">
          <Button
            type="button"
            size="sm"
            variant={mode === "edit" ? "default" : "ghost"}
            className="h-7 gap-1.5"
            onClick={() => setMode("edit")}
          >
            <Pencil className="h-3.5 w-3.5" /> 编辑
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "preview" ? "default" : "ghost"}
            className="h-7 gap-1.5"
            onClick={() => setMode("preview")}
          >
            <Eye className="h-3.5 w-3.5" /> 预览
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">{chars} 字</span>
      </div>

      {mode === "edit" ? (
        <Textarea
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={rows}
          placeholder="使用 Markdown 撰写。标题(##)、列表(-)、加粗(**文本**)、链接([文本](URL))..."
          className="font-mono text-sm leading-relaxed"
          required
        />
      ) : (
        <>
          <div className="min-h-[400px] rounded-md border border-border bg-secondary/30 p-6">
            {value ? (
              <article className="prose-custom max-w-none text-sm leading-relaxed">
                <ReactMarkdown>{value}</ReactMarkdown>
              </article>
            ) : (
              <p className="text-sm text-muted-foreground">暂无内容可预览。</p>
            )}
          </div>
          <input type="hidden" name={name} value={value} />
        </>
      )}
    </div>
  )
}

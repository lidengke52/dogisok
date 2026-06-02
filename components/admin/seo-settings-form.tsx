"use client"

import { useActionState } from "react"
import { AlertCircle, CheckCircle2, ExternalLink, Search, BarChart3, Globe, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveSeoSettings } from "@/app/admin/seo/actions"
import type { SiteSettings } from "@/lib/site-settings"

type Props = { initial: SiteSettings }

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border pb-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function SeoSettingsForm({ initial }: Props) {
  const [state, action, pending] = useActionState(saveSeoSettings, null)

  return (
    <form action={action} className="space-y-8">
      {/* 保存反馈 */}
      {state?.success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          SEO 配置已保存，全站设置将在下次页面构建后生效。
        </div>
      )}
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* ─── 基础 SEO ─── */}
      <section className="space-y-5 rounded-xl border border-border bg-card p-6">
        <SectionHeader
          icon={Search}
          title="基础 SEO"
          description="影响搜索引擎结果页（SERP）中展示的标题和描述"
        />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="site_title">网站标题 (Title)</Label>
            <Input
              id="site_title"
              name="site_title"
              defaultValue={initial.site_title}
              placeholder="Dog is OK — Professional Dog Care Knowledge"
              maxLength={70}
            />
            <p className="text-xs text-muted-foreground">建议 50–70 个字符，显示在浏览器标签页和搜索结果中</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="site_description">网站描述 (Meta Description)</Label>
            <Textarea
              id="site_description"
              name="site_description"
              defaultValue={initial.site_description}
              placeholder="Health, Behavior, Nutrition & more..."
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">建议 120–160 个字符，显示在搜索结果摘要中</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="site_keywords">关键词 (Keywords)</Label>
            <Input
              id="site_keywords"
              name="site_keywords"
              defaultValue={initial.site_keywords}
              placeholder="dog care, dog health, dog nutrition"
            />
            <p className="text-xs text-muted-foreground">用英文逗号分隔，现代搜索引擎参考价值有限但仍建议填写</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="canonical_url">Canonical 域名</Label>
            <Input
              id="canonical_url"
              name="canonical_url"
              defaultValue={initial.canonical_url}
              placeholder="https://www.dogisok.net"
            />
            <p className="text-xs text-muted-foreground">用于告知搜索引擎网站的权威 URL，防止重复内容问题</p>
          </div>
        </div>
      </section>

      {/* ─── 社交分享 ─── */}
      <section className="space-y-5 rounded-xl border border-border bg-card p-6">
        <SectionHeader
          icon={Globe}
          title="社交分享图（Open Graph）"
          description="分享到 Facebook、Twitter、微信时显示的预览图片"
        />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="og_image">OG 图片 URL</Label>
            <Input
              id="og_image"
              name="og_image"
              defaultValue={initial.og_image}
              placeholder="https://www.dogisok.net/og-image.jpg"
            />
            <p className="text-xs text-muted-foreground">推荐尺寸 1200×630px，支持 JPG / PNG</p>
          </div>
        </div>
      </section>

      {/* ─── 爬虫控制 ─── */}
      <section className="space-y-5 rounded-xl border border-border bg-card p-6">
        <SectionHeader
          icon={Bot}
          title="爬虫与索引控制"
          description="控制搜索引擎蜘蛛是否可以抓取和收录网站"
        />
        <div className="space-y-3">
          <Label>搜索引擎索引</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="robots_index"
                value="true"
                defaultChecked={initial.robots_index !== "false"}
                className="h-4 w-4 accent-primary"
              />
              <span>允许索引（推荐）</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="robots_index"
                value="false"
                defaultChecked={initial.robots_index === "false"}
                className="h-4 w-4 accent-primary"
              />
              <span>禁止索引（noindex）</span>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">禁止索引会将网站从所有搜索引擎结果中移除，请谨慎操作</p>
        </div>
      </section>

      {/* ─── Google Analytics ─── */}
      <section className="space-y-5 rounded-xl border border-border bg-card p-6">
        <SectionHeader
          icon={BarChart3}
          title="Google Analytics 4"
          description="填入测量 ID 后，GA 统计代码将自动注入全站所有页面"
        />

        <div className="space-y-1.5">
          <Label htmlFor="ga_measurement_id">GA 测量 ID</Label>
          <Input
            id="ga_measurement_id"
            name="ga_measurement_id"
            defaultValue={initial.ga_measurement_id}
            placeholder="G-XXXXXXXXXX"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            格式为{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">G-XXXXXXXXXX</code>。
            留空则不加载 GA 统计代码。
          </p>
        </div>

        {/* GA 配置步骤说明 */}
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">如何获取 GA 测量 ID？</p>
          <ol className="mt-2 space-y-1.5 text-muted-foreground list-decimal list-inside">
            <li>
              前往{" "}
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-primary underline-offset-4 hover:underline"
              >
                analytics.google.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>点击左下角「管理」→「创建」→「媒体资源」</li>
            <li>填写网站名称和 URL，选择「网站」类型</li>
            <li>创建完成后，进入「数据流」→ 点击对应的数据流</li>
            <li>复制页面顶部的「测量 ID」（格式为 G-XXXXXXXXXX）</li>
            <li>粘贴到上方输入框并点击「保存配置」</li>
          </ol>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "保存中..." : "保存配置"}
        </Button>
      </div>
    </form>
  )
}

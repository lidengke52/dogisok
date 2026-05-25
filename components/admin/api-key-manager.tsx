"use client"

import { useState, useTransition } from "react"
import { Key, Plus, Trash2, Ban, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { actionCreateApiKey, actionRevokeApiKey, actionDeleteApiKey } from "@/app/admin/seo/api-key-actions"

type ApiKey = {
  id: string
  name: string
  key_prefix: string
  allowed_origins: string[]
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [newRawKey, setNewRawKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [origins, setOrigins] = useState("pawsareok.com")
  const [error, setError] = useState<string | null>(null)

  const handleCreate = () => {
    if (!name.trim()) { setError("请填写名称"); return }
    setError(null)
    const fd = new FormData()
    fd.set("name", name)
    fd.set("allowed_origins", origins)
    startTransition(async () => {
      try {
        const result = await actionCreateApiKey(fd)
        setNewRawKey(result.rawKey)
        setName("")
        // 刷新列表
        window.location.reload()
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  const handleCopy = async () => {
    if (!newRawKey) return
    await navigator.clipboard.writeText(newRawKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRevoke = (id: string) => {
    startTransition(async () => {
      await actionRevokeApiKey(id)
      setKeys((prev) => prev.map((k) => k.id === id ? { ...k, is_active: false } : k))
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await actionDeleteApiKey(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Key className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">API Key 管理</h3>
          <p className="text-sm text-muted-foreground">
            为第三方合作伙伴（如 pawsareok.com）生成 API Key 以访问文章数据
          </p>
        </div>
      </div>

      {/* 查看文档链接 */}
      <a
        href="/api-docs"
        target="_blank"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        查看 API 文档
      </a>

      {/* 新建 Key 表单 */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <p className="text-sm font-medium">生成新的 API Key</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">名称</label>
            <Input
              placeholder="例：pawsareok production"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">允许来源（逗号分隔）</label>
            <Input
              placeholder="pawsareok.com, example.com"
              value={origins}
              onChange={(e) => setOrigins(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button onClick={handleCreate} disabled={isPending} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          生成 API Key
        </Button>
      </div>

      {/* 新生成的 Key（只显示一次） */}
      {newRawKey && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30 space-y-3">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            请立即复制此 API Key — 之后将无法再次查看！
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded bg-white/80 px-3 py-2 font-mono text-xs dark:bg-black/30">
              {newRawKey}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Key 列表 */}
      <div className="space-y-2">
        {keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无 API Key，点击上方生成</p>
        ) : (
          keys.map((k) => (
            <div
              key={k.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-sm">{k.name}</span>
                  <Badge variant={k.is_active ? "default" : "secondary"}>
                    {k.is_active ? "Active" : "Revoked"}
                  </Badge>
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {k.key_prefix}•••••••••••••••••••
                </p>
                {k.allowed_origins.length > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Origins: {k.allowed_origins.join(", ")}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Created: {new Date(k.created_at).toLocaleDateString()}
                  {k.last_used_at && ` · Last used: ${new Date(k.last_used_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {k.is_active && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevoke(k.id)}
                    disabled={isPending}
                    className="gap-1.5 text-amber-600 hover:text-amber-700"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    撤销
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(k.id)}
                  disabled={isPending}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

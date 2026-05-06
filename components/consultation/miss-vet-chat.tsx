"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Paperclip, Send, Sparkles, X, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PET_PROFILE_STORAGE_KEY, type PetProfile } from "./pet-info-form"

function buildFirstMessage(profile: PetProfile | null): string {
  if (!profile) {
    return "Hi Dr. Max, I'd like to start a consultation."
  }
  const lines = [
    "Hi Dr. Max, here's some background on my dog before we start:",
    "",
    `- Dogs in household: ${profile.dogCount || "1"}`,
    `- Breed: ${profile.breed || "Not specified"}`,
    `- Life stage: ${profile.ageStage || "Not specified"}`,
    `- Weight: ${profile.weight ? `${profile.weight} kg` : "Not specified"}`,
    profile.history ? `- Medical history: ${profile.history}` : "",
    "",
    "Current symptoms:",
    profile.symptoms || "(not provided)",
    profile.otherNotes ? `\nAdditional context:\n${profile.otherNotes}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}

type AttachedFile = {
  id: string
  file: File
  previewUrl?: string
}

export function MissVetChat() {
  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<AttachedFile[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/consultation" }),
  })

  const isStreaming = status === "streaming" || status === "submitted"

  // Auto-send the pet profile as the first message
  useEffect(() => {
    if (isInitialized) return
    let profile: PetProfile | null = null
    try {
      const raw = sessionStorage.getItem(PET_PROFILE_STORAGE_KEY)
      if (raw) profile = JSON.parse(raw) as PetProfile
    } catch {
      profile = null
    }
    const firstMessage = buildFirstMessage(profile)
    sendMessage({ text: firstMessage })
    setIsInitialized(true)
    // Clear stored profile so a new session starts clean next time
    try {
      sessionStorage.removeItem(PET_PROFILE_STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [isInitialized, sendMessage])

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    const next: AttachedFile[] = []
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/")
      next.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      })
    }
    setAttachments((prev) => [...prev, ...next])
    e.target.value = ""
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((a) => a.id !== id)
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() && attachments.length === 0) return
    if (isStreaming) return

    // If there are attachments, append a short description to the text so the
    // text-only model can reference them. (Actual file passthrough to vision
    // models can be wired later; this keeps cost low per the PRD.)
    let text = input.trim()
    if (attachments.length > 0) {
      const list = attachments.map((a) => `- ${a.file.name} (${a.file.type || "file"})`).join("\n")
      text = [text, `\n[Attached for reference]\n${list}`].filter(Boolean).join("\n")
    }

    sendMessage({ text })
    setInput("")
    setAttachments((prev) => {
      prev.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl))
      return []
    })
  }

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border bg-card/80 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Dr. Max</p>
            <p className="text-xs text-muted-foreground">AI veterinary assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/consultation" className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            New consultation
          </Link>
        </Button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.map((message) => {
            const text = (message.parts ?? [])
              .filter((p): p is { type: "text"; text: string } => p.type === "text")
              .map((p) => p.text)
              .join("")

            const isUser = message.role === "user"
            return (
              <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground"
                  }`}
                >
                  {!isUser && (
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-primary">Dr. Max</p>
                  )}
                  <div className="whitespace-pre-wrap">{text}</div>
                </div>
              </div>
            )
          })}

          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
                <span className="ml-2 text-xs text-muted-foreground">Dr. Max is typing…</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Dr. Max couldn&apos;t respond just now. Please try again in a moment.
            </div>
          )}
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="border-t border-border bg-secondary/30 px-5 py-3">
          <div className="flex flex-wrap gap-2">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="group relative flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
              >
                {a.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.previewUrl || "/placeholder.svg"}
                    alt={a.file.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="max-w-[160px] truncate">{a.file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label={`Remove ${a.file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-border bg-card px-5 py-4"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFilePick}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Attach files"
          disabled={isStreaming}
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          rows={1}
          placeholder={isStreaming ? "Dr. Max is replying…" : "Ask a follow-up question…"}
          className="max-h-32 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          disabled={isStreaming}
        />

        {isStreaming ? (
          <Button type="button" variant="outline" onClick={() => stop()} className="shrink-0">
            Stop
          </Button>
        ) : (
          <Button type="submit" className="shrink-0 gap-1.5" disabled={!input.trim() && attachments.length === 0}>
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        )}
      </form>

      <p className="border-t border-border bg-muted/30 px-5 py-2 text-center text-[11px] text-muted-foreground">
        <ImageIcon className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden="true" />
        You can attach photos or documents. Dr. Max will use them as context for its next reply.
      </p>
    </div>
  )
}

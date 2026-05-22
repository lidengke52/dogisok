"use client"

import { useState } from "react"
import { Facebook, Twitter, Instagram, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ArticleShareButtonsProps {
  slug: string
  title: string
}

export function ArticleShareButtons({ slug, title }: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const url = `https://dogisok.com/articles/${slug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("[v0] Failed to copy link:", err)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-2 text-xs text-muted-foreground">Share</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-[#1877F2]"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-[#1DA1F2]"
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-[#E4405F]"
        aria-label="Follow on Instagram"
        title="Follow us on Instagram"
      >
        <Instagram className="h-4 w-4" />
      </a>
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopyLink}
        aria-label={copied ? "Link copied!" : "Copy link"}
        title={copied ? "Link copied!" : "Copy link to article"}
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}

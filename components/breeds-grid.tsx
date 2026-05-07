'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Breed } from '@/lib/breeds'

const ITEMS_PER_PAGE = 9

const sizeLabel = {
  Small: 'Small',
  Medium: 'Medium',
  Large: 'Large',
} as const

interface BreedsGridProps {
  breeds: Breed[]
}

export function BreedsGrid({ breeds }: BreedsGridProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  
  const displayedBreeds = breeds.slice(0, displayCount)
  const hasMore = displayCount < breeds.length

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, breeds.length))
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedBreeds.map((breed) => (
          <Link
            key={breed.slug}
            href={`/breeds/${breed.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
              <Image
                src={breed.image || '/placeholder.svg'}
                alt={breed.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
                  {sizeLabel[breed.size as keyof typeof sizeLabel]}
                </span>
                <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
                  {breed.group_name}
                </span>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">{breed.name}</h2>
                {breed.cn_name ? (
                  <span className="text-sm text-muted-foreground">· {breed.cn_name}</span>
                ) : null}
              </div>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{breed.summary}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {breed.temperament.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{breed.lifespan}</span>
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  了解更多
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="gap-2"
          >
            加载更多
          </Button>
        </div>
      )}

      {displayedBreeds.length === 0 && (
        <p className="text-sm text-muted-foreground">No breeds published yet.</p>
      )}
    </div>
  )
}

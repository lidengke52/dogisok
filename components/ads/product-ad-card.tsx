import Link from "next/link"
import { ExternalLink, ShoppingBag } from "lucide-react"
import type { ProductAd } from "@/lib/product-ads"

type Props = {
  ad: ProductAd
  variant?: "wide" | "compact"
}

export function ProductAdCard({ ad, variant = "wide" }: Props) {
  const isWide = variant === "wide"

  return (
    <aside aria-label="Sponsored product" className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <Link
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group flex flex-col items-stretch overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-accent/40 hover:shadow-md md:flex-row"
      >
        <div className="relative h-56 w-full shrink-0 bg-secondary sm:h-64 md:h-auto md:w-56">
          {ad.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ad.image_url || "/placeholder.svg"} alt={ad.title} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
            Sponsored
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2 p-5 md:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Recommended product</p>
          <h3 className="text-balance text-lg font-semibold leading-snug text-foreground md:text-xl">{ad.title}</h3>
          {ad.description ? (
            <p className={`text-pretty text-sm leading-relaxed text-muted-foreground ${isWide ? "" : "line-clamp-2"}`}>
              {ad.description}
            </p>
          ) : null}
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-accent group-hover:underline">
            Shop now <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </aside>
  )
}

export function ProductAdSlot({ ads }: { ads: ProductAd[] }) {
  if (!ads.length) return null
  return (
    <section className="py-8 md:py-10">
      <ProductAdCard ad={ads[0]} />
    </section>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import type { ProductClaim } from "@/lib/products"

export function ClaimScrollbar() {
  const [claims, setClaims] = useState<ProductClaim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentClaims = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("product_claims")
          .select("*, products(*)")
          .order("claimed_at", { ascending: false })
          .limit(10)

        if (!error && data) {
          setClaims(data as ProductClaim[])
        }
      } catch {
        // Silent fail for scrollbar
      } finally {
        setLoading(false)
      }
    }

    fetchRecentClaims()
  }, [])

  if (loading || claims.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5 py-4">
      <div className="flex animate-scroll space-x-6 px-4">
        {/* Show twice for continuous scroll effect */}
        {[...claims, ...claims].map((claim, idx) => (
          <div key={idx} className="flex shrink-0 items-center gap-3 rounded-lg bg-white/50 px-4 py-2 backdrop-blur">
            {claim.product?.image_url && (
              <div className="relative h-10 w-10 overflow-hidden rounded">
                <Image
                  src={claim.product.image_url}
                  alt={claim.product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="text-xs">
              <p className="font-medium text-primary">{claim.product?.name}</p>
              <p className="text-muted-foreground">Just claimed</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import type { ProductClaim } from "@/lib/products"

// Mock data for demo mode
const MOCK_CLAIMS: ProductClaim[] = [
  {
    id: "1",
    user_id: "user1",
    product_id: "prod1",
    claimed_at: new Date().toISOString(),
    product: {
      id: "prod1",
      name: "Premium Dog Food",
      description: "Healthy nutrition for your dog",
      price: 29.99,
      image_url: "https://images.unsplash.com/photo-1568152950566-c1bf43f54d95?w=100&h=100&fit=crop",
      category: "Food",
      stock: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "2",
    user_id: "user2",
    product_id: "prod2",
    claimed_at: new Date().toISOString(),
    product: {
      id: "prod2",
      name: "Dog Toy Set",
      description: "Interactive toys for playtime",
      price: 19.99,
      image_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop",
      category: "Toys",
      stock: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "3",
    user_id: "user3",
    product_id: "prod3",
    claimed_at: new Date().toISOString(),
    product: {
      id: "prod3",
      name: "Dog Bed Deluxe",
      description: "Comfortable and cozy pet bed",
      price: 59.99,
      image_url: "https://images.unsplash.com/photo-1544865331-87461c976748?w=100&h=100&fit=crop",
      category: "Bedding",
      stock: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "4",
    user_id: "user4",
    product_id: "prod4",
    claimed_at: new Date().toISOString(),
    product: {
      id: "prod4",
      name: "Grooming Kit",
      description: "Professional grooming tools",
      price: 39.99,
      image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100&h=100&fit=crop",
      category: "Grooming",
      stock: 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "5",
    user_id: "user5",
    product_id: "prod5",
    claimed_at: new Date().toISOString(),
    product: {
      id: "prod5",
      name: "Dog Collar",
      description: "Stylish and comfortable collar",
      price: 14.99,
      image_url: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=100&h=100&fit=crop",
      category: "Accessories",
      stock: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
]

export function ClaimScrollbar() {
  const [claims, setClaims] = useState<ProductClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    // Check if demo mode is enabled
    const isDemoMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "true"
    setIsDemo(isDemoMode)

    const fetchRecentClaims = async () => {
      try {
        // Use mock data if demo mode is enabled
        if (isDemoMode) {
          setClaims(MOCK_CLAIMS)
          setLoading(false)
          return
        }

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
      {isDemo && (
        <div className="mb-2 px-4 text-xs text-amber-600 bg-amber-50 py-2 rounded">
          Demo Mode: Showing mock product claims data. Remove ?demo=true from URL to show real data.
        </div>
      )}
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

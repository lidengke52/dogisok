"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/products"
import { Loader2, Check } from "lucide-react"

interface ProductClaimFormProps {
  userId: string
}

export function ProductClaimForm({ userId }: ProductClaimFormProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Fetch products via browser supabase client (avoids pulling server-only code into the client bundle)
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("products")
      .select("*")
      .order("order_index", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching products:", error)
          setLoading(false)
          return
        }
        const prods = (data as Product[]) || []
        setProducts(prods)
        if (prods.length > 0) {
          setSelected(prods[0].id)
        }
        setLoading(false)
      })
  }, [])

  const handleClaim = async () => {
    if (!selected) return

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("product_claims").insert({
        user_id: userId,
        product_id: selected,
      })

      if (error) {
        console.error("Claim error:", error)
        alert("Failed to claim product. Please try again.")
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/account")
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error("Error:", err)
      alert("An error occurred. Please try again.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading products...</div>
  }

  if (success) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-6 py-8 text-center space-y-3">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary p-3">
            <Check className="h-6 w-6 text-white" />
          </div>
        </div>
        <p className="font-semibold">Product claimed successfully!</p>
        <p className="text-sm text-muted-foreground">
          Your claim has been recorded. You&apos;ll be redirected to your account shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Select a product:</label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelected(product.id)}
              className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                selected === product.id
                  ? "border-primary bg-primary/5"
                  : "border-secondary hover:border-primary/50 bg-secondary"
              }`}
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-3 text-left">
                <p className="font-medium text-sm line-clamp-2">{product.name}</p>
              </div>
              {selected === product.id && (
                <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        size="lg"
        onClick={handleClaim}
        disabled={!selected || submitting}
        className="w-full"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming...
          </>
        ) : (
          "Confirm claim"
        )}
      </Button>
    </div>
  )
}

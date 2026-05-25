import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getProductById, getProducts } from "@/lib/products"
import { ArrowLeft, Check, ImageIcon } from "lucide-react"
import { ProductGallery } from "@/components/products/product-gallery"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  const cover = product.images?.[0] ?? product.image_url

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: cover ? [{ url: cover }] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  const allProducts = await getProducts()
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 2)

  // 兼容老数据：images 为空时退回到 image_url
  const gallery: string[] = product.images?.length
    ? product.images
    : product.image_url
      ? [product.image_url]
      : []

  // 卖点：管理后台填写，未填写则使用兜底文案
  const features: string[] = product.features?.length
    ? product.features
    : [
        "Premium quality formula designed for optimal pet health",
        "No artificial additives or harmful chemicals",
        "Trusted by veterinarians and pet owners worldwide",
      ]

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          {/* Breadcrumb */}
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Product */}
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {/* Gallery */}
            {gallery.length > 0 ? (
              <ProductGallery images={gallery} alt={product.name} />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <ImageIcon className="h-10 w-10" aria-hidden />
                <span className="sr-only">No image</span>
              </div>
            )}

            {/* Details */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>
                <p className="text-lg text-muted-foreground">{product.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <p className="font-medium">Key benefits:</p>
                <ul className="space-y-2">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm break-words overflow-hidden">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Button size="lg" asChild>
                <Link href="/account">Claim this product</Link>
              </Button>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 space-y-6 border-t pt-12">
              <h2 className="text-2xl font-bold">More free products</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedProducts.map((relatedProduct) => {
                  const cover = relatedProduct.images?.[0] ?? relatedProduct.image_url
                  return (
                    <Link
                      key={relatedProduct.id}
                      href={`/products/${relatedProduct.id}`}
                      className="group overflow-hidden rounded-lg bg-secondary transition-shadow hover:shadow-lg"
                    >
                      <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted p-4">
                        {cover && (
                          <Image
                            src={cover}
                            alt={relatedProduct.name}
                            width={300}
                            height={300}
                            className="h-full w-full object-contain transition-transform group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{relatedProduct.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {relatedProduct.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

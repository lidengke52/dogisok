import Link from "next/link"
import Image from "next/image"
import { getProducts } from "@/lib/products"

export async function ProductShowcase() {
  // 限制首页最多显示 6 个赠送产品
  const products = await getProducts(6)

  return (
    <section className="py-12 md:py-16">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Free Gift
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Free Product to Claim</h2>
          <p className="text-muted-foreground">Invite 20 friends to register and unlock your free premium product</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative overflow-hidden rounded-xl bg-secondary transition-all hover:shadow-lg"
            >
              <div className="aspect-video overflow-hidden bg-muted">
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="mt-3 inline-flex items-center text-xs font-medium text-primary group-hover:underline">
                  View details
                  <span className="ml-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/lib/products"

export async function ProductShowcaseMini() {
  // 限制个人主页最多显示 6 个可领取的赠送产品
  const products = await getProducts(6)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Available free products</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group relative overflow-hidden rounded-lg bg-secondary transition-shadow hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="h-full w-full object-contain transition-transform group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-medium line-clamp-2">{product.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

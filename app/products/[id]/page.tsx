import { getProductById } from "@/lib/products"
import { notFound } from "next/navigation"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Suspense } from "react"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Extract the id from params to avoid the warning
  const { id } = params
  
  const product = await getProductById(id)

  if (!product || !product.visible) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <ProductImageGallery images={product.images} name={product.name} />

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold mt-2">${product.price.toFixed(2)}</p>

          <div className="mt-4 prose max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="mt-8">
            <Button size="lg" className="w-full" asChild>
              <Link href={`/buy-now/${product.id}`}>Buy Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


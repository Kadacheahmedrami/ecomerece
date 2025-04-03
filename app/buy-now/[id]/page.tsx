import { getProductById } from "@/lib/products"
import { notFound } from "next/navigation"
import Image from "next/image"
import { PurchaseForm } from "@/components/purchase-form"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Check } from "lucide-react"

interface BuyNowPageProps {
  params: {
    id: string
  }
}

export default async function BuyNowPage({ params }: BuyNowPageProps) {
  const id = await Promise.resolve(params.id)
  
  const product = await getProductById(id)

  if (!product) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Buy Now</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-muted-foreground">{product.description}</p>
            <p className="text-2xl font-bold mt-2">${product.price.toFixed(2)}</p>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-medium">Product Details</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Category: {product.category}</span>
                </li>
                {product.stock > 0 ? (
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>In Stock ({product.stock} available)</span>
                  </li>
                ) : (
                  <li className="flex items-center gap-2 text-sm text-red-500">
                    <span>Out of Stock</span>
                  </li>
                )}
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Fast Shipping Available</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Direct from Manufacturer</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <PurchaseForm product={product} />
        </div>
      </div>
    </div>
  )
} 
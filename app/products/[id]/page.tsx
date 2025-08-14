"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AddToCartButton } from "@/components/add-to-cart-button"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (params.id) {
      setLoading(true)
      fetch(`/api/products/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch product")
          return res.json()
        })
        .then((data) => {
          if (!data.visible) router.push("/404")
          setProduct(data)
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [params.id, router])

  // Format price in English and append "DA"
  const formatDZD = (price: number | undefined | null) => {
    const num = typeof price === "number" && !isNaN(price) ? price : 0
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)} DA`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="container mx-auto  px-4 py-8">
      <div className="grid  md:grid-cols-2 gap-8">
        {/* Left Side - Main Image */}
        <ProductImageGallery
          images={product.images}
          name={product.name}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />

        {/* Right Side - Info + Buy Now + Thumbnails */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold mt-2">{formatDZD(product.price)}</p>

          <div className="mt-4 prose max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="mt-8 space-y-3">
            <AddToCartButton product={product} variant="outline" size="lg" className="w-full" />
            <Button size="lg" className="w-full" asChild>
              <Link href={`/buy-now/${product.id}`}>Buy Now</Link>
            </Button>
          </div>

          {/* Thumbnails under the button */}
          <div className="flex gap-3 overflow-x-auto pb-2 mt-4 scrollbar-hide">
            {product.images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border transition-transform",
                  selectedImage === i ? "ring-2 ring-primary scale-105" : "hover:scale-105",
                )}
              >
                <Image src={img || "/placeholder.svg"} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

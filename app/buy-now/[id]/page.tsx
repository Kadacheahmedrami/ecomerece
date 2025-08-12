'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { PurchaseForm } from "@/components/purchase-form"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Check, Loader2 } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  images: string[]
  visible: boolean
  createdAt: Date
  updatedAt: Date
}

interface BuyNowPageProps {
  params: {
    id: string
  }
}

export default function BuyNowPage({ params }: BuyNowPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (params.id) {
      setLoading(true)
      
      fetch(`/api/products/${params.id}`)
        .then(response => {
          if (!response.ok) {
            if (response.status === 404) {
              router.push('/404')
              return Promise.reject(new Error('Product not found'))
            }
            return Promise.reject(new Error(`Failed to fetch product: ${response.status}`))
          }
          return response.json()
        })
        .then(productData => {
          setProduct(productData)
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to load product')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">

      
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
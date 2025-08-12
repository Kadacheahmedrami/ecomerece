"use client"

import type { Product } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

// Extend Product type to include optional comparePrice
type ExtendedProduct = Product & {
  comparePrice?: number;
}

interface ProductCardProps {
  productId?: string;
  limit?: number;
  category?: string;
  search?: string;
}

export function ProductCard({ productId, limit = 12, category, search }: ProductCardProps) {
  const [products, setProducts] = useState<ExtendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        let url = `/api/products?limit=${limit}`
        
        if (productId) {
          url = `/api/products/${productId}`
        } else {
          if (category) {
            url += `&category=${encodeURIComponent(category)}`
          }
          if (search) {
            url += `&search=${encodeURIComponent(search)}`
          }
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        
        // Handle both single product and array of products
        if (productId) {
          setProducts([data])
        } else {
          setProducts(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [productId, limit, category, search])

  if (loading) {
    return <ProductCardSkeleton />
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading products: {error}</div>
  }

  if (products.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        {search ? `No products found for "${search}"` : "No products found"}
      </div>
    )
  }

  if (productId) {
    return <SingleProductCard product={products[0]} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <SingleProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function SingleProductCard({ product }: { product: ExtendedProduct }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const isNewProduct = new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const isOnSale = product.comparePrice && product.comparePrice > product.price

  // Safely handle images array
  const imageUrl = product.images?.[0] || "/placeholder.svg"

  return (
    <div 
      className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-64 w-full bg-muted/20">
          <Image 
            src={imageError ? "/placeholder.svg" : imageUrl}
            alt={product.name} 
            fill 
            className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            priority={true}
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjFmMSIvPjwvc3ZnPg=="
            onError={() => setImageError(true)}
          />
          
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {isNewProduct && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">New</Badge>
            )}
            {isOnSale && product.comparePrice && (
              <Badge variant="default" className="bg-red-600 hover:bg-red-700">
                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% off
              </Badge>
            )}
          </div>
        </div>
      </Link>
      
      <div className="p-4 bg-white dark:bg-gray-950">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-medium text-lg truncate group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-1 mt-1">{product.description}</p>
        </Link>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
            {isOnSale && product.comparePrice && (
              <p className="text-sm text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</p>
            )}
          </div>
          
          <Button size="sm" variant="default" asChild>
            <Link href={`/products/${product.id}`} prefetch={true}>View Product</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="group relative overflow-hidden rounded-lg bg-muted/20 animate-pulse">
          <div className="h-64 w-full bg-muted/40" />
          <div className="p-4 bg-white dark:bg-gray-950">
            <div className="h-6 bg-muted/40 rounded mb-2" />
            <div className="h-4 bg-muted/30 rounded mb-3 w-3/4" />
            <div className="flex items-center justify-between">
              <div className="h-6 bg-muted/40 rounded w-20" />
              <div className="h-8 bg-muted/40 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
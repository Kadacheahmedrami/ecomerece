"use client"

import type { Product } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

// Extend Product type to include optional comparePrice
type ExtendedProduct = Product & {
  comparePrice?: number;
}

export function ProductCard({ product }: { product: ExtendedProduct }) {
  const [isHovered, setIsHovered] = useState(false)
  
  const isNewProduct = new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const isOnSale = product.comparePrice && product.comparePrice > product.price

  return (
    <div 
      className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-64 w-full bg-muted/20">
          <Image 
            src={product.images[0] || "/placeholder.svg"} 
            alt={product.name} 
            fill 
            className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            priority={true}
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjFmMSIvPjwvc3ZnPg=="
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
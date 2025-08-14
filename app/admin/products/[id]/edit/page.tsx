'use client'

import { AdminProductForm } from "@/components/admin/admin-product-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import type { Product } from "@prisma/client"

export default function EditProductPage() {
  const params = useParams()
  const id = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function fetchProduct() {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/products/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found')
            return
          }
          throw new Error(`Failed to fetch product: ${response.status}`)
        }

        const productData = await response.json()
        setProduct(productData)
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="h-8 w-8">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground mt-1">Make changes to the product details</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div>Loading product...</div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="h-8 w-8">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground mt-1">Product not found</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-lg font-medium">Product not found</p>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/products">Back to Products</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-8 w-8">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground mt-1">Make changes to the product details</p>
        </div>
      </div>
      <AdminProductForm product={product} />
    </div>
  )
}
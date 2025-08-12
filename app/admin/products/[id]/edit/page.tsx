import { AdminProductForm } from "@/components/admin/admin-product-form"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import type { Product } from "@prisma/client"

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache configuration for server-side fetching
      cache: 'no-store', // Always fetch fresh data for admin pages
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch product: ${response.status}`)
    }

    const product = await response.json()
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  // Make sure to await the params object before accessing its properties
  const { id } = await params
  
  // Fetch the product with the id using the API endpoint
  const product = await getProduct(id)

  if (!product) {
    notFound()
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
      <Suspense fallback={<div>Loading product...</div>}>
        <AdminProductForm product={product} />
      </Suspense>
    </div>
  )
}
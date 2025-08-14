"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminProductsTable } from "@/components/admin/admin-products-table"
import { AdminProductFilters } from "@/components/admin/admin-product-filters"
import { Plus, Loader2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import type { Product } from "@prisma/client"

interface ProductWithCount extends Product {
  _count?: {
    orders: number
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface ProductsData {
  products: ProductWithCount[]
  pagination: PaginationData
}

export default function AdminProductsPage() {
  const [data, setData] = useState<ProductsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  // Extract search parameters
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
  const search = searchParams.get('search') || undefined
  const category = searchParams.get('category') || undefined
  const status = searchParams.get('status') || undefined
  const visible = status === "visible" ? "true" : status === "hidden" ? "false" : undefined

  // Fetch products function
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      if (page) params.set('page', page.toString())
      params.set('limit', '10')
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (visible) params.set('visible', visible)

      const response = await fetch(`/api/admin/products?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch products (${response.status})`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error loading products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Fetch products when search parameters change
  useEffect(() => {
    fetchProducts()
  }, [page, search, category, visible])

  // Retry function
  const handleRetry = () => {
    fetchProducts()
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground mt-1">Loading products...</p>
          </div>
          <Button asChild className="gap-1">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              Add New Product
            </Link>
          </Button>
        </div>

        <AdminProductFilters />

        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your product inventory</p>
          </div>
          <Button asChild className="gap-1">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              Add New Product
            </Link>
          </Button>
        </div>

        <AdminProductFilters />

        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">{error || 'Failed to load products'}</p>
            <Button onClick={handleRetry} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory ({data.pagination.total} total)
          </p>
        </div>
        <Button asChild className="gap-1">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

      <AdminProductFilters />

      <AdminProductsTable 
        products={data.products} 
        pagination={data.pagination}
        onRefresh={fetchProducts}
      />
    </div>
  )
}
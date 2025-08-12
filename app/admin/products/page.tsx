import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminProductsTable } from "@/components/admin/admin-products-table"
import { AdminProductFilters } from "@/components/admin/admin-product-filters"
import { Plus } from "lucide-react"

async function getProducts(params: {
  page?: number
  limit?: number
  search?: string
  category?: string
  visible?: string
}) {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.search) searchParams.set('search', params.search)
  if (params.category) searchParams.set('category', params.category)
  if (params.visible) searchParams.set('visible', params.visible)

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/products?${searchParams}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }

  return response.json()
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const page = params?.page && typeof params.page === "string" 
    ? parseInt(params.page) 
    : 1

  const search = params?.search && typeof params.search === "string" 
    ? params.search 
    : undefined

  const category = params?.category && typeof params.category === "string" 
    ? params.category 
    : undefined
    
  const status = params?.status && typeof params.status === "string" 
    ? params.status 
    : undefined

  const visible = status === "visible" ? "true" : status === "hidden" ? "false" : undefined

  try {
    const data = await getProducts({
      page,
      limit: 10,
      search,
      category,
      visible,
    })

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
          />
        </div>

    )
  } catch (error) {
    console.error('Error loading products:', error)
    
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
            <div className="text-center">
              <p className="text-muted-foreground">Failed to load products</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
     
    )
  }
}
import { Button } from "@/components/ui/button"
import { getProducts } from "@/lib/products"
import Link from "next/link"
import { AdminProductsTable } from "@/components/admin/admin-products-table"
import { AdminProductFilters } from "@/components/admin/admin-product-filters"
import { AdminShell } from "@/components/admin/admin-shell"
import {  Plus } from "lucide-react"

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const category = searchParams?.category && typeof searchParams.category === "string" 
    ? searchParams.category 
    : undefined;
    
  const status = searchParams?.status && typeof searchParams.status === "string" 
    ? searchParams.status 
    : undefined;

  const products = await getProducts({
    category,
    visible: status === "visible" ? true : status === "hidden" ? false : undefined,
    take: 100,
  })

  return (
    <AdminShell>
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

        <AdminProductsTable products={products} />
      </div>
    </AdminShell>
  )
}


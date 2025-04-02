import { AdminProductForm } from "@/components/admin/admin-product-form"
import { getProductById } from "@/lib/products"
import { notFound } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  // Make sure to await the params object before accessing its properties
  const { id } = params
  
  // Fetch the product with the id
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <AdminShell>
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
    </AdminShell>
  )
}


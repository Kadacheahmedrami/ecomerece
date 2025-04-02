import { AdminProductForm } from "@/components/admin/admin-product-form"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewProductPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild className="h-8 w-8">
                <Link href="/admin/products">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            </div>
            <p className="text-muted-foreground mt-1">Create a new product for your store</p>
          </div>
        </div>
        <AdminProductForm />
      </div>
    </AdminShell>
  )
}


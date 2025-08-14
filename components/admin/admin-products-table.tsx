"use client"

import { useState } from "react"
import type { Product } from "@prisma/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreHorizontal, Trash, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"

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

interface AdminProductsTableProps {
  products: ProductWithCount[]
  pagination: PaginationData
  onRefresh?: () => void
}

export function AdminProductsTable({ products, pagination, onRefresh }: AdminProductsTableProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<ProductWithCount | null>(null)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const handleDelete = async () => {
    if (!productToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete product (${response.status})`)
      }
      
      const result = await response.json()
      
      toast({
        title: "Product deleted",
        description: result.message || "The product has been deleted successfully.",
      })
      
      // Use onRefresh instead of router.refresh()
      onRefresh?.()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error deleting the product.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  const handleToggleVisibility = async (productId: string, currentVisibility: boolean) => {
    setIsUpdatingVisibility(productId)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visible: !currentVisibility
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update product visibility (${response.status})`)
      }
      
      const result = await response.json()
      
      toast({
        title: "Product updated",
        description: `Product is now ${!currentVisibility ? 'visible' : 'hidden'}.`,
      })
      
      // Use onRefresh instead of router.refresh()
      onRefresh?.()
    } catch (error) {
      console.error("Error updating product visibility:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error updating the product.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingVisibility(null)
    }
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `?${params.toString()}`
  }

  const PaginationControls = () => {
    if (pagination.pages <= 1) return null

    const currentPage = pagination.page
    const totalPages = pagination.pages
    const startItem = (currentPage - 1) * pagination.limit + 1
    const endItem = Math.min(currentPage * pagination.limit, pagination.total)

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {pagination.total} products
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={currentPage <= 1}
          >
            <Link href={createPageUrl(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          </Button>
          
          <div className="flex items-center space-x-1">
            {/* Show first page */}
            {currentPage > 3 && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={createPageUrl(1)}>1</Link>
                </Button>
                {currentPage > 4 && <span className="px-2">...</span>}
              </>
            )}
            
            {/* Show pages around current */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              if (page <= totalPages) {
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link href={createPageUrl(page)}>{page}</Link>
                  </Button>
                )
              }
              return null
            })}
            
            {/* Show last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                <Button variant="outline" size="sm" asChild>
                  <Link href={createPageUrl(totalPages)}>{totalPages}</Link>
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={currentPage >= totalPages}
          >
            <Link href={createPageUrl(currentPage + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative h-10 w-10">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                      sizes="40px"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="max-w-[200px] truncate">
                    {product.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category}</Badge>
                </TableCell>
                <TableCell className="font-mono">{product.price.toFixed(2)} DA</TableCell>
                <TableCell>
                  <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {product._count?.orders || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={product.visible ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleToggleVisibility(product.id, product.visible)}
                  >
                    {isUpdatingVisibility === product.id ? (
                      "Updating..."
                    ) : (
                      <>
                        {product.visible ? (
                          <>
                            <Eye className="mr-1 h-3 w-3" />
                            Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1 h-3 w-3" />
                            Hidden
                          </>
                        )}
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleVisibility(product.id, product.visible)}
                        disabled={isUpdatingVisibility === product.id}
                      >
                        {product.visible ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Hide Product
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Show Product
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setProductToDelete(product)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-2xl">📦</div>
                    <div>No products found</div>
                    <div className="text-sm">
                      <Link href="/admin/products/new" className="text-primary hover:underline">
                        Create your first product
                      </Link>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls />

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{productToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowDownAZ, ArrowUpAZ, MoreHorizontal, FileText, ChevronLeft, ChevronRight, Eye, User, Package, Calendar, DollarSign } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { OrderStatus, DeliveryType } from "@prisma/client"
import { useRouter, useSearchParams } from "next/navigation"

interface Order {
  id: string
  customerName: string
  customerEmail: string
  city: string
  phone: string
  deliveryType: DeliveryType
  status: OrderStatus
  quantity: number
  productId: string
  product: {
    id: string
    name: string
    images: string[]
  }
  productPrice: number
  deliveryFee: number
  total: number
  subtotal: number
  itemCount: number
  createdAt: Date
  updatedAt: Date
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface AdminOrdersTableProps {
  orders: Order[]
  pagination?: Pagination
  limit?: number
}

type SortField = 'date' | 'total' | 'items'
type SortDirection = 'asc' | 'desc'

export function AdminOrdersTable({ orders, pagination, limit }: AdminOrdersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const sortedOrders = [...orders].sort((a, b) => {
    let comparison = 0
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'total':
        comparison = a.total - b.total
        break
      case 'items':
        comparison = a.quantity - b.quantity
        break
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const displayOrders = limit ? sortedOrders.slice(0, limit) : sortedOrders

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] min-w-[100px]">Order ID</TableHead>
                <TableHead className="w-[180px] min-w-[180px]">Customer</TableHead>
                <TableHead className="w-[120px] min-w-[120px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => toggleSort('date')} 
                    className="h-auto p-0 font-medium hover:text-primary"
                  >
                    <span className="flex items-center gap-1">
                      Date
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <ArrowUpAZ className="h-3 w-3" /> : <ArrowDownAZ className="h-3 w-3" />
                      )}
                    </span>
                  </Button>
                </TableHead>
                <TableHead className="w-[80px] min-w-[80px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => toggleSort('items')} 
                    className="h-auto p-0 font-medium hover:text-primary"
                  >
                    <span className="flex items-center gap-1">
                      Qty
                      {sortField === 'items' && (
                        sortDirection === 'asc' ? <ArrowUpAZ className="h-3 w-3" /> : <ArrowDownAZ className="h-3 w-3" />
                      )}
                    </span>
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead className="w-[100px] min-w-[100px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => toggleSort('total')} 
                    className="h-auto p-0 font-medium hover:text-primary"
                  >
                    <span className="flex items-center gap-1">
                      Total
                      {sortField === 'total' && (
                        sortDirection === 'asc' ? <ArrowUpAZ className="h-3 w-3" /> : <ArrowDownAZ className="h-3 w-3" />
                      )}
                    </span>
                  </Button>
                </TableHead>
                <TableHead className="w-[100px] min-w-[100px]">Status</TableHead>
                <TableHead className="w-[60px] min-w-[60px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium truncate max-w-[160px]">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">{order.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-center">{order.quantity}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <Badge variant={order.deliveryType === 'HOME_DELIVERY' ? 'default' : 'outline'} className="truncate max-w-[180px]">
                              {order.product.name.length > 20 
                                ? `${order.product.name.slice(0, 20)}...` 
                                : order.product.name}
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p>Product: {order.product.name}</p>
                            <p>Price: {formatCurrency(order.productPrice)}</p>
                            <p>Delivery Type: {order.deliveryType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Pickup'}</p>
                            <p>Delivery Fee: {formatCurrency(order.deliveryFee)}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium whitespace-nowrap">{formatCurrency(order.total)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p>Subtotal: {formatCurrency(order.subtotal)}</p>
                            <p>+ Delivery: {formatCurrency(order.deliveryFee)}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {displayOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        <div className="space-y-3">
          {/* Sort Controls for Tablet */}
          <div className="flex items-center gap-2 pb-4 border-b">
            <span className="text-sm font-medium">Sort by:</span>
            <Button 
              variant={sortField === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSort('date')}
              className="flex items-center gap-1"
            >
              <Calendar className="h-3 w-3" />
              Date
              {sortField === 'date' && (
                sortDirection === 'asc' ? <ArrowUpAZ className="h-3 w-3" /> : <ArrowDownAZ className="h-3 w-3" />
              )}
            </Button>
            <Button 
              variant={sortField === 'total' ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSort('total')}
              className="flex items-center gap-1"
            >
              <DollarSign className="h-3 w-3" />
              Total
              {sortField === 'total' && (
                sortDirection === 'asc' ? <ArrowUpAZ className="h-3 w-3" /> : <ArrowDownAZ className="h-3 w-3" />
              )}
            </Button>
            <Button 
              variant={sortField === 'items' ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSort('items')}
              className="flex items-center gap-1"
            >
              <Package className="h-3 w-3" />
              Qty
              {sortField === 'items' && (
                sortDirection === 'asc' ? <ArrowUpAZ className="h-3 w-3" /> : <ArrowDownAZ className="h-3 w-3" />
              )}
            </Button>
          </div>

          {displayOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <div className="font-medium">#{order.id.slice(-6)}</div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="font-medium truncate">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground truncate">{order.customerEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="text-sm">{formatDate(order.createdAt)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Product</div>
                  <Badge variant={order.deliveryType === 'HOME_DELIVERY' ? 'default' : 'outline'} className="max-w-full truncate">
                    {order.product.name.length > 25 
                      ? `${order.product.name.slice(0, 25)}...` 
                      : order.product.name}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Qty: {order.quantity}</div>
                  <div className="font-medium text-lg">{formatCurrency(order.total)}</div>
                </div>
              </div>
            </div>
          ))}

          {displayOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              No orders found
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {/* Sort Controls for Mobile */}
          <div className="space-y-2 pb-4 border-b">
            <div className="text-sm font-medium">Sort by:</div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={sortField === 'date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('date')}
                className="flex items-center gap-1 text-xs"
              >
                <Calendar className="h-3 w-3" />
                Date
                {sortField === 'date' && (
                  sortDirection === 'asc' ? <ArrowUpAZ className="h-2 w-2" /> : <ArrowDownAZ className="h-2 w-2" />
                )}
              </Button>
              <Button 
                variant={sortField === 'total' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('total')}
                className="flex items-center gap-1 text-xs"
              >
                <DollarSign className="h-3 w-3" />
                Total
                {sortField === 'total' && (
                  sortDirection === 'asc' ? <ArrowUpAZ className="h-2 w-2" /> : <ArrowDownAZ className="h-2 w-2" />
                )}
              </Button>
              <Button 
                variant={sortField === 'items' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('items')}
                className="flex items-center gap-1 text-xs"
              >
                <Package className="h-3 w-3" />
                Qty
                {sortField === 'items' && (
                  sortDirection === 'asc' ? <ArrowUpAZ className="h-2 w-2" /> : <ArrowDownAZ className="h-2 w-2" />
                )}
              </Button>
            </div>
          </div>

          {displayOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-3 space-y-3 bg-card">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm">#{order.id.slice(-6)}</div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span className="text-xs">View</span>
                  </Link>
                </Button>
              </div>

              {/* Customer Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <div className="font-medium text-sm truncate flex-1">{order.customerName}</div>
                </div>
                <div className="text-xs text-muted-foreground truncate pl-5">
                  {order.customerEmail}
                </div>
              </div>

              {/* Product & Price */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Package className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Badge variant={order.deliveryType === 'HOME_DELIVERY' ? 'default' : 'outline'} className="text-xs max-w-full truncate">
                      {order.product.name.length > 30 
                        ? `${order.product.name.slice(0, 30)}...` 
                        : order.product.name}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pl-5">
                  <div className="text-xs text-muted-foreground">
                    Qty: {order.quantity} • {formatDate(order.createdAt)}
                  </div>
                  <div className="font-semibold">{formatCurrency(order.total)}</div>
                </div>
              </div>
            </div>
          ))}

          {displayOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              No orders found
            </div>
          )}
        </div>
      </div>

      {/* Responsive Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            <span className="hidden sm:inline">Showing </span>
            {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} 
            <span className="hidden sm:inline"> of </span>
            <span className="sm:hidden">/</span>
            {pagination.total}
            <span className="hidden sm:inline"> orders</span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1 px-2 sm:px-3"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline text-xs sm:text-sm">Prev</span>
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(window.innerWidth < 640 ? 3 : 5, pagination.pages) }, (_, i) => {
                let pageNum
                const maxPages = window.innerWidth < 640 ? 3 : 5
                if (pagination.pages <= maxPages) {
                  pageNum = i + 1
                } else if (pagination.page <= Math.ceil(maxPages / 2)) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.pages - Math.floor(maxPages / 2)) {
                  pageNum = pagination.pages - maxPages + 1 + i
                } else {
                  pageNum = pagination.page - Math.floor(maxPages / 2) + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="flex items-center gap-1 px-2 sm:px-3"
            >
              <span className="hidden xs:inline text-xs sm:text-sm">Next</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default"

  switch (status) {
    case "PENDING":
      variant = "secondary"
      break
    case "PROCESSING":
      variant = "default"
      break
    case "SHIPPED":
      variant = "outline"
      break
    case "DELIVERED":
      variant = "default"
      break
    case "CANCELLED":
      variant = "destructive"
      break
  }

  return <Badge variant={variant} className="text-xs">{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>
}
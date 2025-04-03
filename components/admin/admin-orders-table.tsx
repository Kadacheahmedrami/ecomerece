"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowDownAZ, ArrowUpAZ, MoreHorizontal, FileText } from "lucide-react"
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

interface AdminOrdersTableProps {
  orders: Order[]
  limit?: number
}

type SortField = 'date' | 'total' | 'items'
type SortDirection = 'asc' | 'desc'

export function AdminOrdersTable({ orders, limit }: AdminOrdersTableProps) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead onClick={() => toggleSort('date')} className="cursor-pointer hover:text-primary flex items-center gap-1">
            Date
            {sortField === 'date' && (
              sortDirection === 'asc' ? <ArrowUpAZ className="h-3 w-3" /> : <ArrowDownAZ className="h-3 w-3" />
            )}
          </TableHead>
          <TableHead onClick={() => toggleSort('items')} className="cursor-pointer hover:text-primary flex items-center gap-1">
            Quantity
            {sortField === 'items' && (
              sortDirection === 'asc' ? <ArrowUpAZ className="h-3 w-3" /> : <ArrowDownAZ className="h-3 w-3" />
            )}
          </TableHead>
          <TableHead>Product</TableHead>
          <TableHead onClick={() => toggleSort('total')} className="cursor-pointer hover:text-primary flex items-center gap-1">
            Total
            {sortField === 'total' && (
              sortDirection === 'asc' ? <ArrowUpAZ className="h-3 w-3" /> : <ArrowDownAZ className="h-3 w-3" />
            )}
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{order.customerName}</span>
                <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
              </div>
            </TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell>{order.quantity}</TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center">
                      <Badge variant={order.deliveryType === 'HOME_DELIVERY' ? 'default' : 'outline'}>
                        {order.product.name.length > 15 
                          ? `${order.product.name.slice(0, 15)}...` 
                          : order.product.name}
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Product: {order.product.name}</p>
                    <p>Price: {formatCurrency(order.productPrice)}</p>
                    <p>Delivery Type: {order.deliveryType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Pickup'}</p>
                    <p>Delivery Fee: {formatCurrency(order.deliveryFee)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{formatCurrency(order.total)}</span>
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
                  <Button variant="ghost" size="icon">
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

  return <Badge variant={variant}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>
}


"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface Order {
  id: string
  customerName: string
  customerEmail: string
  total: number
  status: string
  createdAt: Date
}

interface AdminOrdersTableProps {
  orders: Order[]
  limit?: number
}

export function AdminOrdersTable({ orders, limit }: AdminOrdersTableProps) {
  const displayOrders = limit ? orders.slice(0, limit) : orders

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell>${order.total.toFixed(2)}</TableCell>
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
                    <Link href={`/admin/orders/${order.id}`}>View Details</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {displayOrders.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              No orders found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
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


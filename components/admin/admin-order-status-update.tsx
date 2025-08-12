"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Product } from "@prisma/client"

// Define OrderStatus enum to match your existing types
type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

interface Order {
  id: string
  status: OrderStatus
  customerName: string
  customerEmail: string
  phone: string
  city: string
  deliveryType: string
  quantity: number
  productPrice: number
  subtotal: number
  deliveryFee: number
  total: number
  createdAt: string
  product: Product
}

interface AdminOrderStatusUpdateProps {
  order: Order
  onOrderUpdate?: () => void // Optional callback to refresh order data
}

export function AdminOrderStatusUpdate({ order, onOrderUpdate }: AdminOrderStatusUpdateProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async () => {
    if (status === order.status) return

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      toast({
        title: "Status updated",
        description: "The order status has been updated successfully.",
      })

      // Call the callback to refresh order data if provided
      if (onOrderUpdate) {
        onOrderUpdate()
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "There was an error updating the order status.",
        variant: "destructive",
      })
      // Reset status to original value on error
      setStatus(order.status)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-1.5">
        <label
          htmlFor="status"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Order Status
        </label>
        <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleUpdate} disabled={status === order.status || isUpdating}>
        {isUpdating ? "Updating..." : "Update Status"}
      </Button>
    </div>
  )
}
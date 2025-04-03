"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateOrderStatusAction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { OrderStatus } from "@prisma/client"

interface Order {
  id: string
  status: OrderStatus
}

interface AdminOrderStatusUpdateProps {
  order: Order
}

export function AdminOrderStatusUpdate({ order }: AdminOrderStatusUpdateProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleUpdate = async () => {
    if (status === order.status) return

    setIsUpdating(true)

    try {
      await updateOrderStatusAction(order.id, status as OrderStatus)
      toast({
        title: "Status updated",
        description: "The order status has been updated successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "There was an error updating the order status.",
        variant: "destructive",
      })
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


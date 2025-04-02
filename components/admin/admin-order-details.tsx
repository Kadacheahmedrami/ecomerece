import { formatDate, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  status: string
  total: number
  createdAt: Date
  updatedAt: Date
}

interface AdminOrderDetailsProps {
  order: Order
}

export function AdminOrderDetails({ order }: AdminOrderDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Order ID</p>
          <p>#{order.id.slice(-6)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <div className="mt-1">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Date Placed</p>
          <p>{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
          <p>{formatDate(order.updatedAt)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
          <p className="font-medium">{formatCurrency(order.total)}</p>
        </div>
      </div>
    </div>
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


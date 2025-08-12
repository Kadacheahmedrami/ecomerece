import { formatDate, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Use the same types as in your page component
type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  visible: boolean
  createdAt: Date
  updatedAt: Date
}

interface Order {
  id: string
  status: OrderStatus
  customerName: string
  customerEmail: string
  phone: string
  city: string
  deliveryType: string // Changed from DeliveryType to string to match your page
  quantity: number
  productPrice: number
  subtotal: number
  deliveryFee: number
  total: number
  createdAt: string // Changed from Date to string to match your page
  updatedAt: string // Added this field and made it string to match your page
  product: Product
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
          <p>{formatDate(new Date(order.createdAt))}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
          <p>{formatDate(new Date(order.updatedAt))}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Quantity</p>
          <p>{order.quantity} {order.quantity === 1 ? 'item' : 'items'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Delivery Type</p>
          <p>{order.deliveryType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Local Agency Pickup'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Subtotal</p>
          <p>{formatCurrency(order.subtotal)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Delivery Fee</p>
          <p>{formatCurrency(order.deliveryFee)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
          <p className="font-medium">{formatCurrency(order.total)}</p>
        </div>
      </div>
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

  return <Badge variant={variant}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>
}
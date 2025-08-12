import { Product } from "@prisma/client"

// Define OrderStatus enum to match your existing types
type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

// Define DeliveryType enum to match your existing types
type DeliveryType = 'HOME_DELIVERY' | 'AGENCY_PICKUP'

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

interface AdminOrderCustomerProps {
  order: Order
}

export function AdminOrderCustomer({ order }: AdminOrderCustomerProps) {
  // Helper function to format delivery type display
  const formatDeliveryType = (deliveryType: string) => {
    switch (deliveryType) {
      case 'HOME_DELIVERY':
        return 'Home Delivery'
      case 'AGENCY_PICKUP':
        return 'Local Agency Pickup'
      default:
        return deliveryType
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
        <p>{order.customerName}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Email</p>
        <p>{order.customerEmail}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Phone</p>
        <p>{order.phone}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Delivery Information</p>
        <p>City: {order.city}</p>
        <p>Delivery Type: {formatDeliveryType(order.deliveryType)}</p>
      </div>
    </div>
  )
}
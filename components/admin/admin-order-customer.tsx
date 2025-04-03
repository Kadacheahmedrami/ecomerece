import { DeliveryType } from "@prisma/client"

interface Order {
  customerName: string
  customerEmail: string
  city: string
  phone: string
  deliveryType: DeliveryType
}

interface AdminOrderCustomerProps {
  order: Order
}

export function AdminOrderCustomer({ order }: AdminOrderCustomerProps) {
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
        <p>Delivery Type: {order.deliveryType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Local Agency Pickup'}</p>
      </div>
    </div>
  )
}


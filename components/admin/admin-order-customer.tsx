interface Order {
  customerName: string
  customerEmail: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
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
        <p className="text-sm font-medium text-muted-foreground">Shipping Address</p>
        <p>{order.address}</p>
        <p>{`${order.city}, ${order.state} ${order.zipCode}`}</p>
        <p>{order.country}</p>
      </div>
    </div>
  )
}


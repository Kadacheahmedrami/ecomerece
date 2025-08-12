import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
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

interface AdminOrderItemsProps {
  order: Order
}

export function AdminOrderItems({ order }: AdminOrderItemsProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Product</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <div className="relative h-10 w-10">
                <Image
                  src={order.product.images?.[0] || "/placeholder.svg"}
                  alt={order.product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            </TableCell>
            <TableCell className="font-medium">{order.product.name}</TableCell>
            <TableCell className="text-right">{order.quantity}</TableCell>
            <TableCell className="text-right">{formatCurrency(order.productPrice)}</TableCell>
            <TableCell className="text-right">{formatCurrency(order.productPrice * order.quantity)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-medium">
              Subtotal
            </TableCell>
            <TableCell className="text-right">{formatCurrency(order.subtotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-medium">
              Delivery Fee
            </TableCell>
            <TableCell className="text-right">{formatCurrency(order.deliveryFee)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-medium">
              Total
            </TableCell>
            <TableCell className="text-right font-bold">{formatCurrency(order.total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
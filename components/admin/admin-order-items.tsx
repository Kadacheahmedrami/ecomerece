import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    images: string[]
  }
}

interface Order {
  items: OrderItem[]
  total: number
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
          {order.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="relative h-10 w-10">
                  <Image
                    src={item.product.images[0] || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{item.product.name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
            </TableRow>
          ))}
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


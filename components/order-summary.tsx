import type { Product } from "@prisma/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface OrderSummaryProps {
  product?: Product | null
  quantity?: number
}

export function OrderSummary({ product, quantity = 1 }: OrderSummaryProps) {
  // In a real app, you'd get cart items from state/context if no product is provided
  const items = product ? [{ product, quantity }] : []

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-start space-x-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                  <Image
                    src={item.product.images[0] || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Your cart is empty</p>
        )}

        <div className="space-y-1.5 pt-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-4 font-medium">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={items.length === 0}>
          Proceed to Payment
        </Button>
      </CardFooter>
    </Card>
  )
}


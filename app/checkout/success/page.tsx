import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId: string }
}) {
  const orderId = searchParams.orderId

  if (!orderId) {
    redirect("/")
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) {
    redirect("/")
  }

  return (
    <div className="container mx-auto my-auto max-w-3xl py-8 space-y-8">
      <Card>
        <CardHeader className="text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">Order Details</h3>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <p className="text-muted-foreground">Order ID:</p>
              <p>{order.id}</p>
              <p className="text-muted-foreground">Status:</p>
              <p className="capitalize">{order.status.toLowerCase()}</p>
              <p className="text-muted-foreground">Total Amount:</p>
              <p>${order.total.toFixed(2)}</p>
            </div>
          </div>

          <Separator />

          {/* Shipping Information */}
          <div className="space-y-2">
            <h3 className="font-semibold">Shipping Information</h3>
            <div className="text-sm space-y-1">
              <p>{order.customerName}</p>
              <p>{order.address}</p>
              <p>
                {order.city}, {order.state} {order.zipCode}
              </p>
              <p>{order.country}</p>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-2">
            <h3 className="font-semibold">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{item.product.name}</span>
                    <span className="text-muted-foreground">
                      × {item.quantity}
                    </span>
                  </div>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 text-center">
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
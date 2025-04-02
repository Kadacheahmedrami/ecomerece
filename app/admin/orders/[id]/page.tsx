import { getOrderById } from "@/lib/orders"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminOrderDetails } from "@/components/admin/admin-order-details"
import { AdminOrderStatusUpdate } from "@/components/admin/admin-order-status-update"
import { AdminOrderItems } from "@/components/admin/admin-order-items"
import { AdminOrderCustomer } from "@/components/admin/admin-order-customer"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AdminOrderPageProps {
  params: {
    id: string
  }
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  // Extract the id from params to avoid the warning
  const { id } = params
  
  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild className="h-8 w-8">
                <Link href="/admin/orders">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(-6)}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminOrderDetails order={order} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminOrderCustomer order={order} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminOrderItems order={order} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminOrderStatusUpdate order={order} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}


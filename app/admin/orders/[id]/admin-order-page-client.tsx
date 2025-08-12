'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminOrderDetails } from "@/components/admin/admin-order-details"
import { AdminOrderStatusUpdate } from "@/components/admin/admin-order-status-update"
import { AdminOrderItems } from "@/components/admin/admin-order-items"
import { AdminOrderCustomer } from "@/components/admin/admin-order-customer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Define OrderStatus enum to match your existing types
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
  deliveryType: string
  quantity: number
  productPrice: number
  subtotal: number
  deliveryFee: number
  total: number
  createdAt: string
  updatedAt: string
  product: Product
}

interface AdminOrderPageClientProps {
  initialOrder: Order
  orderId: string
}

export function AdminOrderPageClient({ initialOrder, orderId }: AdminOrderPageClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder)

  // Function to refresh order data after updates
  const refreshOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      if (response.ok) {
        const orderData = await response.json()
        
        // Process the refreshed order data the same way
        const processedOrder: Order = {
          ...orderData,
          updatedAt: orderData.updatedAt || orderData.createdAt,
          product: {
            ...orderData.product,
            description: orderData.product.description || '',
            images: orderData.product.images || [],
            category: orderData.product.category || '',
            stock: orderData.product.stock || 0,
            visible: orderData.product.visible !== undefined ? orderData.product.visible : true,
            createdAt: orderData.product.createdAt ? new Date(orderData.product.createdAt) : new Date(),
            updatedAt: orderData.product.updatedAt ? new Date(orderData.product.updatedAt) : new Date(),
          }
        }
        
        setOrder(processedOrder)
      }
    } catch (err) {
      console.error('Error refreshing order:', err)
    }
  }

  return (

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild className="h-8 w-8">
                <Link href="/admin/orders">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">
                Order #{order.id.slice(-6)}
              </h1>
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
            <AdminOrderStatusUpdate 
              order={order} 
              onOrderUpdate={refreshOrder}
            />
          </CardContent>
        </Card>
      </div>
  
  )
}
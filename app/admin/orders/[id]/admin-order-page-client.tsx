'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminOrderDetails } from "@/components/admin/admin-order-details"
import { AdminOrderStatusUpdate } from "@/components/admin/admin-order-status-update"
import { AdminOrderItems } from "@/components/admin/admin-order-items"
import { AdminOrderCustomer } from "@/components/admin/admin-order-customer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

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
  orderId: string
}

// Helper function to ensure numeric values
function ensureNumber(value: any, defaultValue: number = 0): number {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value)
  return isNaN(num) ? defaultValue : num
}

export function AdminOrderPageClient({ orderId }: AdminOrderPageClientProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch order data
  const fetchOrder = async (id: string): Promise<Order | null> => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch order')
      }

      const orderData = await response.json()
      
      // Process the order data with proper types and defaults
      const processedOrder: Order = {
        ...orderData,
        // Ensure all numeric fields are properly converted and have defaults
        quantity: ensureNumber(orderData.quantity, 1),
        productPrice: ensureNumber(orderData.productPrice, 0),
        subtotal: ensureNumber(orderData.subtotal, 0),
        deliveryFee: ensureNumber(orderData.deliveryFee, 0),
        total: ensureNumber(orderData.total, 0),
        updatedAt: orderData.updatedAt || orderData.createdAt,
        product: {
          ...orderData.product,
          price: ensureNumber(orderData.product?.price, 0),
          stock: ensureNumber(orderData.product?.stock, 0),
          description: orderData.product?.description || '',
          images: orderData.product?.images || [],
          category: orderData.product?.category || '',
          visible: orderData.product?.visible !== undefined ? orderData.product.visible : true,
          createdAt: orderData.product?.createdAt ? new Date(orderData.product.createdAt) : new Date(),
          updatedAt: orderData.product?.updatedAt ? new Date(orderData.product.updatedAt) : new Date(),
        }
      }
      
      return processedOrder
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  }

  // Function to refresh order data after updates
  const refreshOrder = async () => {
    try {
      const orderData = await fetchOrder(orderId)
      setOrder(orderData)
    } catch (err) {
      console.error('Error refreshing order:', err)
      setError('Failed to refresh order data')
    }
  }

  // Load initial order data
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        const orderData = await fetchOrder(orderId)
        
        if (!orderData) {
          // Order not found - redirect to 404
          notFound()
          return
        }
        
        setOrder(orderData)
      } catch (err) {
        console.error('Error loading order:', err)
        setError('Failed to load order data')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading order...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Order not found (shouldn't reach here due to notFound() call)
  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Order not found</p>
          <Button asChild className="mt-4">
            <Link href="/admin/orders">
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>
    )
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
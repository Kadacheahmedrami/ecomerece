'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import Image from "next/image"

interface Order {
  id: string
  customerName: string
  customerEmail: string
  phone: string
  city: string
  deliveryType: 'HOME_DELIVERY' | 'LOCAL_AGENCY_PICKUP'
  subtotal: number
  deliveryFee: number
  total: number
  quantity: number
  productPrice: number
  product: {
    id: string
    name: string
    images: string[]
  }
  createdAt: Date
  updatedAt: Date
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (!orderId) {
      router.push('/404')
      return
    }

    setLoading(true)
    
    fetch(`/api/orders/${orderId}`)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/404')
            return Promise.reject(new Error('Order not found'))
          }
          return Promise.reject(new Error(`Failed to fetch order: ${response.status}`))
        }
        return response.json()
      })
      .then(orderData => {
        setOrder(orderData)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [orderId, router])

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been confirmed and will be shipped soon.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Order #{order.id.slice(-6)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Delivery Fee:</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total:</span>
                <span className="font-bold">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
            <CardDescription>
              {order.deliveryType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Local Agency Pickup'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.phone}</p>
              <p>City: {order.city}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Order Item ({order.quantity})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image
                src={order.product.images[0] || "/placeholder.svg"}
                alt={order.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{order.product.name}</h3>
              <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
              <p className="text-sm">Price: {formatCurrency(order.productPrice)}</p>
            </div>
            <div className="text-right font-medium">
              {formatCurrency(order.productPrice * order.quantity)}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
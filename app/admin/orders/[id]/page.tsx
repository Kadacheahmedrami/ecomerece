import { notFound } from 'next/navigation'
import { AdminOrderPageClient } from './admin-order-page-client'

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

async function getOrder(id: string): Promise<Order | null> {
  try {
    // In a real app, you'd fetch from your database directly here
    // For now, we'll make an internal API call or database query
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/admin/orders/${id}`, {
      cache: 'no-store', // Always fetch fresh data
    })
    
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
    
    return processedOrder
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

interface AdminOrderPageProps {
  params: {
    id: string
  }
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const order = await getOrder(params.id)

  if (!order) {
    notFound()
  }

  return <AdminOrderPageClient initialOrder={order} orderId={params.id} />
}
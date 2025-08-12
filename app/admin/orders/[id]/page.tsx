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

// Helper function to ensure numeric values
function ensureNumber(value: any, defaultValue: number = 0): number {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value)
  return isNaN(num) ? defaultValue : num
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
    return null
  }
}

interface AdminOrderPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return <AdminOrderPageClient initialOrder={order} orderId={id} />
}
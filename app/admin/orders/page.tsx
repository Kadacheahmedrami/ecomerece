'use client'

import { AdminOrdersTable } from "@/components/admin/admin-orders-table"
import { AdminOrderFilters } from "@/components/admin/admin-order-filters"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { OrderStatus } from "@prisma/client"

interface OrdersData {
  orders: any[]
  pagination: any
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<OrdersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        
        const status = searchParams.get('status')
        const page = searchParams.get('page')
        const limit = searchParams.get('limit')
        const search = searchParams.get('search')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        // Type-safe way to handle the status parameter
        let statusFilter: OrderStatus | undefined = undefined
        if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
          statusFilter = status as OrderStatus
          params.set('status', statusFilter)
        }
        
        if (page) params.set('page', page)
        if (limit) params.set('limit', limit)
        if (search) params.set('search', search)
        if (startDate) params.set('startDate', startDate)
        if (endDate) params.set('endDate', endDate)

        const response = await fetch(`/api/admin/orders?${params.toString()}`, {
          cache: 'no-store'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        const ordersData = await response.json()
        setData(ordersData)
      } catch (error) {
        console.error('Error fetching orders:', error)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [searchParams]) // Re-fetch when search params change

  // Handle loading state
  if (loading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        <AdminOrderFilters />
        <div className="mt-6 flex items-center justify-center p-8">
          <div>Loading orders...</div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        <AdminOrderFilters />
        <div className="mt-6 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600">Error loading orders</p>
            <p className="text-muted-foreground">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle no data state
  if (!data) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        <AdminOrderFilters />
        <div className="mt-6 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-muted-foreground">There are no orders to display.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      <AdminOrderFilters />
      <div className="mt-6">
        <AdminOrdersTable 
          orders={data.orders} 
          pagination={data.pagination}
        />
      </div>
    </div>
  )
}
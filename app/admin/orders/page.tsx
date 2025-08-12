import { AdminOrdersTable } from "@/components/admin/admin-orders-table"
import { AdminOrderFilters } from "@/components/admin/admin-order-filters"

import { OrderStatus } from "@prisma/client"

interface AdminOrdersPageProps {
  searchParams: {
    status?: string
    page?: string
    limit?: string
    search?: string
    startDate?: string
    endDate?: string
  }
}

async function getOrders(searchParams: AdminOrdersPageProps['searchParams']) {
  const params = new URLSearchParams()
  
  if (searchParams.status) params.set('status', searchParams.status)
  if (searchParams.page) params.set('page', searchParams.page)
  if (searchParams.limit) params.set('limit', searchParams.limit)
  if (searchParams.search) params.set('search', searchParams.search)
  if (searchParams.startDate) params.set('startDate', searchParams.startDate)
  if (searchParams.endDate) params.set('endDate', searchParams.endDate)

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/orders?${params.toString()}`, {
    cache: 'no-store' // Always fetch fresh data for admin pages
  })

  if (!response.ok) {
    throw new Error('Failed to fetch orders')
  }

  return response.json()
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  // Type-safe way to handle the status parameter
  let statusFilter: OrderStatus | undefined = undefined;
  if (searchParams.status && Object.values(OrderStatus).includes(searchParams.status as OrderStatus)) {
    statusFilter = searchParams.status as OrderStatus;
  }

  const data = await getOrders({
    ...searchParams,
    status: statusFilter
  })

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
import { getOrders } from "@/lib/orders"
import { AdminOrdersTable } from "@/components/admin/admin-orders-table"
import { AdminOrderFilters } from "@/components/admin/admin-order-filters"
import { AdminShell } from "@/components/admin/admin-shell"
import { OrderStatus } from "@prisma/client"

interface AdminOrdersPageProps {
  searchParams: {
    status?: string
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  // Type-safe way to handle the status parameter
  let statusFilter: OrderStatus | undefined = undefined;
  if (searchParams.status && Object.values(OrderStatus).includes(searchParams.status as OrderStatus)) {
    statusFilter = searchParams.status as OrderStatus;
  }

  const orders = await getOrders({
    status: statusFilter
  })

  return (
    <AdminShell>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        <AdminOrderFilters />
        <div className="mt-6">
          <AdminOrdersTable orders={orders} />
        </div>
      </div>
    </AdminShell>
  )
}


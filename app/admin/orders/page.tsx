import { getOrders } from "@/lib/orders"
import { AdminOrdersTable } from "@/components/admin/admin-orders-table"
import { AdminOrderFilters } from "@/components/admin/admin-order-filters"
import { AdminShell } from "@/components/admin/admin-shell"
import { ShoppingCart } from "lucide-react"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined

  const orders = await getOrders({
    status: status as any,
  })

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">View and manage customer orders</p>
        </div>

        <AdminOrderFilters />

        <AdminOrdersTable orders={orders} />
      </div>
    </AdminShell>
  )
}


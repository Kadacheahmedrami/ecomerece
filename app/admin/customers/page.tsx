import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/admin/columns"
import {prisma} from "@/lib/prisma"



async function getCustomers() {
  const customers = await prisma.order.findMany({
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      phone: true,
      city: true,
      deliveryType: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return customers;
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
   <div >
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
      </div>
      <DataTable columns={columns} data={customers} searchKey="customerEmail" />
    </div>
  </div>
 
  )
} 
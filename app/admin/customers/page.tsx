// pages/customers.tsx (or app/customers/page.tsx)
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/admin/columns"

// Define the CustomerColumn type to match what your columns expect
interface CustomerColumn {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  city: string;
  deliveryType: string;
  createdAt: Date;
}

interface CustomerFromAPI {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  city: string;
  deliveryType: string;
  createdAt: string;
}

async function getCustomers(): Promise<CustomerColumn[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/customers`, {
      cache: 'no-store' // Ensure fresh data on each request
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.status}`);
    }

    const data: CustomerFromAPI[] = await response.json();
    
    // Transform the data to match CustomerColumn type expectations
    const customers: CustomerColumn[] = data.map((customer) => ({
      id: customer.id,
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      phone: customer.phone,
      city: customer.city,
      deliveryType: customer.deliveryType,
      createdAt: new Date(customer.createdAt) // Convert string to Date
    }));
    
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        </div>
        <DataTable<CustomerColumn, unknown> columns={columns} data={customers} searchKey="customerEmail" />
      </div>
    </div>
  )
}

// api/admin/customers/route.ts (App Router) or api/admin/customers.ts (Pages Router)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// For App Router (app/api/admin/customers/route.ts)
export async function GET(request: NextRequest) {
  try {
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

    // Serialize dates to strings for JSON transfer
    const serializedCustomers = customers.map(customer => ({
      ...customer,
      createdAt: customer.createdAt.toISOString()
    }));

    return NextResponse.json(serializedCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}


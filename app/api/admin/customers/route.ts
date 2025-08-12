// app/api/admin/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Fetch distinct customers from orders
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
      },
      distinct: ['customerEmail'], // Get unique customers by email
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
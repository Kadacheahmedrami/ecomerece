import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth"
import { addOrderToGoogleSheet } from "@/lib/google-sheets"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Calculate item count
    const itemCount = body.items.reduce((sum: number, item: any) => sum + item.quantity, 0)

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        city: body.city,
        phone: body.phone,
        deliveryType: body.deliveryType || 'HOME_DELIVERY',
        itemCount: itemCount,
        subtotal: body.subtotal,
        deliveryFee: body.deliveryFee,
        total: body.total,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Add order to Google Sheet
    try {
      await addOrderToGoogleSheet(order)
    } catch (sheetError) {
      console.error("Error adding order to Google Sheet (non-critical):", sheetError);
      // Continue execution - this is a non-critical error
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET() {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}


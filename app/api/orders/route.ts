import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth"
import { addOrderToGoogleSheet } from "@/lib/google-sheets"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country,
        phone: body.phone,
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
      console.log("Order added to Google Sheet");
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


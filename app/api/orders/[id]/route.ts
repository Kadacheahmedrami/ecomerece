import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth"
import { updateOrderInGoogleSheet } from "@/lib/google-sheets"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Extract id from params - Next.js 15 params are now a Promise
    const { id } = await params;
    
    const order = await prisma.order.findUnique({
      where: {
        id: id,
      },
      include: {
        product: true, // Include the product details
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Extract id from params - Next.js 15 params are now a Promise
    const { id } = await params;
    
    const body = await request.json()

    const order = await prisma.order.update({
      where: {
        id: id
      },
      data: {
        status: body.status
      },
      include: {
        product: true, // Include the product details
      },
    })

    try {
      await updateOrderInGoogleSheet(order)
    } catch (sheetError) {
      console.error("Error updating Google Sheet (non-critical):", sheetError)
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
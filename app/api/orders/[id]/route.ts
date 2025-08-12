// app/api/orders/[id]/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const productPrice = Number(order.productPrice)
    const quantity = Number(order.quantity)
    const deliveryFee = Number(order.deliveryFee) || 0
    const subtotal = productPrice * quantity
    const total = subtotal + deliveryFee

    return NextResponse.json({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      city: order.city,
      deliveryType: order.deliveryType,
      subtotal,
      deliveryFee,
      total,
      quantity,
      productPrice,
      product: {
        id: order.product.id,
        name: order.product.name,
        images: order.product.images
      },
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

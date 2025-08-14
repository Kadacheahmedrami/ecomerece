import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { addOrderToGoogleSheet } from "@/lib/google-sheets"

interface CartItem {
  productId: string
  quantity: number
  productPrice: number
}

interface BulkOrderRequest {
  customerName: string
  customerEmail: string
  city: string
  phone: string
  deliveryType?: "HOME_DELIVERY" | "LOCAL_AGENCY_PICKUP"
  items: CartItem[]
  deliveryFee: number
  total: number
}

// POST - Create bulk order for cart checkout
export async function POST(request: Request) {
  try {
    const body: BulkOrderRequest = await request.json()

    // Validate required fields
    if (
      !body.customerName ||
      !body.customerEmail ||
      !body.city ||
      !body.phone ||
      !body.items ||
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      body.deliveryFee === undefined ||
      body.total === undefined
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Please ensure all required fields are provided",
        },
        { status: 400 },
      )
    }

    // Validate each cart item
    for (const item of body.items) {
      if (!item.productId || !item.quantity || !item.productPrice) {
        return NextResponse.json(
          {
            error: "Invalid cart item",
            details: "Each item must have productId, quantity, and productPrice",
          },
          { status: 400 },
        )
      }
    }

    // Verify all products exist and are available
    const productIds = body.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        visible: true,
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          error: "Some products not found or unavailable",
        },
        { status: 404 },
      )
    }

    // Check stock and price consistency
    const stockErrors = []
    const priceErrors = []

    for (const item of body.items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) continue

      if (product.stock < item.quantity) {
        stockErrors.push(`${product.name}: Only ${product.stock} available`)
      }

      if (Math.abs(product.price - item.productPrice) > 0.01) {
        priceErrors.push(`${product.name}: Price has changed`)
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Insufficient stock",
          details: stockErrors,
        },
        { status: 400 },
      )
    }

    if (priceErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Price mismatch",
          details: priceErrors,
        },
        { status: 400 },
      )
    }

    // Create orders within a transaction
    const result = await prisma.$transaction(async (tx) => {
      const orders = []

      // Create separate order for each product (maintaining current schema)
      for (const item of body.items) {
        const product = products.find((p) => p.id === item.productId)!

        const order = await tx.order.create({
          data: {
            customerName: body.customerName,
            customerEmail: body.customerEmail,
            city: body.city,
            phone: body.phone,
            deliveryType: (body.deliveryType as "HOME_DELIVERY" | "LOCAL_AGENCY_PICKUP") || "HOME_DELIVERY",
            status: "PENDING",
            quantity: item.quantity,
            productId: item.productId,
            productPrice: item.productPrice,
            deliveryFee: body.deliveryFee / body.items.length, // Split delivery fee
            total: item.productPrice * item.quantity + body.deliveryFee / body.items.length,
          },
          include: {
            product: true,
          },
        })

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        orders.push(order)
      }

      return orders
    })

    // Add orders to Google Sheet (non-critical operation)
    try {
      for (const order of result) {
        await addOrderToGoogleSheet(order)
      }
    } catch (sheetError) {
      console.error("Error adding orders to Google Sheet (non-critical):", sheetError)
    }

    return NextResponse.json(
      {
        success: true,
        orders: result,
        message: `${result.length} orders created successfully`,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating bulk order:", error)

    // Handle Prisma-specific errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any

      if (prismaError.code === "P2003") {
        return NextResponse.json(
          {
            error: "One or more products not found",
          },
          { status: 404 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Failed to create orders",
        details: "Please try again later",
      },
      { status: 500 },
    )
  }
}

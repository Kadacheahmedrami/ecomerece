import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth"
import { addOrderToGoogleSheet } from "@/lib/google-sheets"

// POST - Create a new order (for the purchase form)
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.customerName || !body.customerEmail || !body.city || !body.phone ||
        !body.productId || !body.quantity || !body.productPrice ||
        body.deliveryFee === undefined || body.total === undefined) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: "Please ensure all required fields are provided"
      }, { status: 400 })
    }

    // Verify the product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: body.productId }
    })

    if (!product) {
      return NextResponse.json({ 
        error: "Product not found" 
      }, { status: 404 })
    }

    if (!product.visible) {
      return NextResponse.json({ 
        error: "Product is not available for purchase" 
      }, { status: 400 })
    }

    // Check stock availability
    if (product.stock < body.quantity) {
      return NextResponse.json({ 
        error: "Insufficient stock",
        details: `Only ${product.stock} items available`
      }, { status: 400 })
    }

    // Validate price consistency (security measure)
    if (Math.abs(product.price - body.productPrice) > 0.01) {
      return NextResponse.json({ 
        error: "Price mismatch",
        details: "Product price has changed"
      }, { status: 400 })
    }

    // Create the order within a transaction to handle stock updates
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          city: body.city,
          phone: body.phone,
          deliveryType: body.deliveryType || 'HOME_DELIVERY',
          status: body.status || 'PENDING',
          quantity: body.quantity,
          productId: body.productId,
          productPrice: body.productPrice,
          deliveryFee: body.deliveryFee,
          total: body.total,
        },
        include: {
          product: true,
        },
      })

      // Update product stock
      await tx.product.update({
        where: { id: body.productId },
        data: {
          stock: {
            decrement: body.quantity
          }
        }
      })

      return order
    })

    // Add order to Google Sheet (non-critical operation)
    try {
      await addOrderToGoogleSheet(result)
    } catch (sheetError) {
      console.error("Error adding order to Google Sheet (non-critical):", sheetError)
      // Continue execution - this is a non-critical error
    }

    return NextResponse.json({
      success: true,
      order: result,
      message: "Order created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating order:", error)

    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      console.error("Prisma error code:", prismaError.code)

      if (prismaError.code === 'P2003') {
        return NextResponse.json({ 
          error: "Product not found" 
        }, { status: 404 })
      }
      
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ 
          error: "Order already exists" 
        }, { status: 409 })
      }
    }

    return NextResponse.json({ 
      error: "Failed to create order",
      details: "Please try again later"
    }, { status: 500 })
  }
}

// GET - Fetch orders (admin only) or specific order details
export async function GET(request: Request) {
  const url = new URL(request.url)
  const orderId = url.searchParams.get('orderId')

  // If orderId is provided, return specific order (for order confirmation)
  if (orderId) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: true,
        },
      })

      if (!order) {
        return NextResponse.json({ 
          error: "Order not found" 
        }, { status: 404 })
      }

      return NextResponse.json(order)
    } catch (error) {
      console.error("Error fetching order:", error)
      return NextResponse.json({ 
        error: "Failed to fetch order" 
      }, { status: 500 })
    }
  }

  // Otherwise, check admin access for listing all orders
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return NextResponse.json({ 
      error: "Unauthorized" 
    }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json({
      orders,
      total: orders.length
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ 
      error: "Failed to fetch orders" 
    }, { status: 500 })
  }
}

// PATCH - Update order status (admin only)
export async function PATCH(request: Request) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return NextResponse.json({ 
      error: "Unauthorized" 
    }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status" 
      }, { status: 400 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        product: true,
      },
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order status updated successfully"
    })

  } catch (error) {
    console.error("Error updating order:", error)
    
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ 
          error: "Order not found" 
        }, { status: 404 })
      }
    }

    return NextResponse.json({ 
      error: "Failed to update order" 
    }, { status: 500 })
  }
}
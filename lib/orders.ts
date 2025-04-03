import { prisma } from "./prisma"
import type { OrderStatus, DeliveryType } from "@prisma/client"

/**
 * Interface representing the Order model from the Prisma schema
 * 
 * model Order {
 *   id            String       @id @default(cuid())
 *   customerName  String
 *   customerEmail String
 *   city          String       // Algerian city
 *   phone         String
 *   deliveryType  DeliveryType @default(HOME_DELIVERY)
 *   status        OrderStatus  @default(PENDING)
 *   quantity      Int          // Quantity of product ordered
 *   productId     String
 *   product       Product      @relation(fields: [productId], references: [id])
 *   productPrice  Float        // Price of product at time of order
 *   deliveryFee   Float        // Fee based on selected city
 *   total         Float        // (productPrice * quantity) + deliveryFee
 *   createdAt     DateTime     @default(now())
 *   updatedAt     DateTime     @updatedAt
 * }
 */

// Type for the order with product information
export interface OrderWithProduct {
  id: string
  customerName: string
  customerEmail: string
  city: string
  phone: string
  deliveryType: DeliveryType
  status: OrderStatus
  quantity: number
  productId: string
  product: {
    id: string
    name: string
    images: string[]
    price: number
  }
  productPrice: number
  deliveryFee: number
  total: number
  createdAt: Date
  updatedAt: Date
}

// Interface for AdminOrdersTable component
export interface OrderForTable {
  id: string
  customerName: string
  customerEmail: string
  city: string
  phone: string
  deliveryType: DeliveryType
  status: OrderStatus
  subtotal: number
  itemCount: number
  deliveryFee: number
  total: number
  createdAt: Date
  updatedAt: Date
}

interface GetOrdersOptions {
  take?: number
  skip?: number
  status?: OrderStatus
}

export async function getOrders(options: GetOrdersOptions = {}) {
  const { take, skip, status } = options

  const where = {
    ...(status ? { status } : {}),
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take,
    skip,
    include: {
      product: true
    },
  })

  // Transform orders to match the format expected by the UI
  return orders.map(order => {
    const subtotal = order.productPrice * order.quantity;
    
    return {
      ...order,
      // Add calculated fields
      subtotal,
      itemCount: order.quantity,
    };
  });
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      product: true
    },
  })

  if (!order) return null;

  // Transform order to include calculated fields
  return {
    ...order,
    subtotal: order.productPrice * order.quantity,
    itemCount: order.quantity
  };
}
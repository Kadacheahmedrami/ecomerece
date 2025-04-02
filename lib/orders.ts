import { prisma } from "./prisma"
import type { OrderStatus } from "@prisma/client"

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
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  return orders
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  return order
}


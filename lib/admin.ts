import { prisma } from "./prisma"
import type { User } from "next-auth"

export async function getOrderStats() {
  const totalOrders = await prisma.order.count()

  const pendingOrders = await prisma.order.count({
    where: {
      status: "PENDING",
    },
  })

  const revenue = await prisma.order.aggregate({
    _sum: {
      total: true,
    },
  })

  return {
    totalOrders,
    pendingOrders,
    revenue: revenue._sum.total || 0,
  }
}

export async function getProductStats() {
  const totalProducts = await prisma.product.count()

  const outOfStock = await prisma.product.count({
    where: {
      stock: 0,
    },
  })

  return {
    totalProducts,
    outOfStock,
  }
}

export async function getRecentOrders(limit = 5) {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  })

  return orders
}

// Add this function for the search functionality
export async function searchAdmin(query: string) {
  // If query is empty, return empty results
  if (!query || query.trim() === '') {
    return {
      products: [],
      orders: [],
      users: []
    }
  }

  // Search products
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  // Search orders
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { customerName: { contains: query, mode: 'insensitive' } },
        { customerEmail: { contains: query, mode: 'insensitive' } },
        { id: { contains: query } },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  // Search users
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: {
      name: 'asc',
    },
  })

  return {
    products,
    orders,
    users
  }
}


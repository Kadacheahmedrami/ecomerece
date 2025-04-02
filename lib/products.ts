import { prisma } from "./prisma"
import { Prisma } from "@prisma/client"

interface GetProductsOptions {
  take?: number
  skip?: number
  category?: string
  sort?: "price_asc" | "price_desc" | "newest"
  visible?: boolean
  search?: string
}

export async function getProducts(options: GetProductsOptions = {}) {
  const { take, skip, category, sort, visible, search } = options

  // Build the where clause
  let whereClause: Prisma.ProductWhereInput = {}
  
  if (category) {
    whereClause.category = category
  }
  
  if (visible !== undefined) {
    whereClause.visible = visible
  }
  
  if (search) {
    whereClause.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive' as Prisma.QueryMode
        }
      },
      {
        description: {
          contains: search,
          mode: 'insensitive' as Prisma.QueryMode
        }
      }
    ]
  }

  // Build the orderBy clause
  let orderByClause: Prisma.ProductOrderByWithRelationInput = {}
  
  if (sort === "price_asc") {
    orderByClause.price = 'asc'
  } else if (sort === "price_desc") {
    orderByClause.price = 'desc'
  } else {
    // Default to newest
    orderByClause.createdAt = 'desc'
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderByClause,
    take,
    skip,
  })

  return products
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  })

  return product
}


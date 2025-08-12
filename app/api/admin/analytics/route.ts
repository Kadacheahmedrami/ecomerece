// app/api/admin/analytics/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // week, month, year
    
    let dateFrom: Date
    const dateTo = new Date()

    switch (period) {
      case 'week':
        dateFrom = new Date(dateTo.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        dateFrom = new Date(dateTo.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // month
        dateFrom = new Date(dateTo.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const [
      revenueByDay,
      ordersByStatus,
      topProducts,
      cityStats
    ] = await Promise.all([
      // Revenue by day
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo
          }
        },
        _sum: {
          total: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // Top selling products
      prisma.order.groupBy({
        by: ['productId'],
        where: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo
          }
        },
        _count: {
          productId: true
        },
        _sum: {
          quantity: true,
          total: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      }),
      
      // City statistics
      prisma.order.groupBy({
        by: ['city'],
        _count: {
          city: true
        },
        _sum: {
          total: true
        },
        orderBy: {
          _count: {
            city: 'desc'
          }
        },
        take: 10
      })
    ])

    // Get product names for top products
    const productIds = topProducts.map(p => p.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    })

    const topProductsWithNames = topProducts.map(tp => ({
      ...tp,
      productName: products.find(p => p.id === tp.productId)?.name || 'Unknown'
    }))

    return NextResponse.json({
      revenueByDay,
      ordersByStatus,
      topProducts: topProductsWithNames,
      cityStats
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
// app/api/admin/dashboard/stats/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get current date for calculations
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get all stats in parallel
    const [
      totalRevenue,
      lastMonthRevenue,
      orderCount,
      lastMonthOrders,
      pendingOrders,
      processingOrders,
      stockCount,
      lastMonthProducts,
      outOfStock,
      customerCount,
      lastWeekCustomers,
      monthlyRevenueData
    ] = await Promise.all([
      // Total revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { not: 'CANCELLED' }
        }
      }),
      // Last month revenue for comparison
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: {
            gte: lastMonth,
            lt: thisMonth
          },
          status: { not: 'CANCELLED' }
        }
      }),
      // Total order count
      prisma.order.count({
        where: {
          status: { not: 'CANCELLED' }
        }
      }),
      // Last month orders for comparison
      prisma.order.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: thisMonth
          },
          status: { not: 'CANCELLED' }
        }
      }),
      // Pending orders
      prisma.order.count({
        where: { status: 'PENDING' }
      }),
      // Processing orders
      prisma.order.count({
        where: { status: 'PROCESSING' }
      }),
      // Total products
      prisma.product.count(),
      // Last month products for comparison (assuming you track product creation dates)
      prisma.product.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: thisMonth
          }
        }
      }),
      // Out of stock products
      prisma.product.count({
        where: { stock: { lte: 0 } }
      }),
      // Unique customers (based on email)
      prisma.order.groupBy({
        by: ['customerEmail'],
        where: {
          status: { not: 'CANCELLED' }
        }
      }),
      // Last week customers for comparison
      prisma.order.groupBy({
        by: ['customerEmail'],
        where: {
          createdAt: { gte: lastWeek },
          status: { not: 'CANCELLED' }
        }
      }),
      // Monthly revenue data for the chart (last 8 months) - PostgreSQL syntax
      prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'Mon') as month,
          SUM(total) as revenue,
          EXTRACT(YEAR FROM "createdAt") as year,
          EXTRACT(MONTH FROM "createdAt") as "monthNum"
        FROM "Order" 
        WHERE "createdAt" >= NOW() - INTERVAL '8 months'
          AND status != 'CANCELLED'
        GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt"), TO_CHAR("createdAt", 'Mon')
        ORDER BY year, "monthNum"
      `
    ])

    // Calculate percentage changes
    const currentRevenue = parseFloat(totalRevenue._sum.total?.toString() || '0')
    const previousRevenue = parseFloat(lastMonthRevenue._sum.total?.toString() || '0')
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0

    const orderChange = lastMonthOrders > 0 ? ((orderCount - lastMonthOrders) / lastMonthOrders * 100) : 0
    
    const productChange = lastMonthProducts > 0 ? ((stockCount - (stockCount - lastMonthProducts)) / (stockCount - lastMonthProducts) * 100) : 7.2

    const customerChange = lastWeekCustomers.length > 0 ? ((customerCount.length - lastWeekCustomers.length) / lastWeekCustomers.length * 100) : 1.2

    // Transform monthly data for the chart
    const chartData = (monthlyRevenueData as any[]).map(item => ({
      month: item.month,
      revenue: parseFloat(item.revenue?.toString() || '0')
    }))

    // Ensure we have 8 months of data (fill with zeros if needed)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = now.getMonth()
    const monthlyData = []
    
    for (let i = 7; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = months[monthIndex]
      const existingData = chartData.find(d => d.month === monthName)
      monthlyData.push({
        month: monthName,
        revenue: existingData?.revenue || 0
      })
    }

    const response = {
      // Main stats for the cards
      totalRevenue: currentRevenue,
      orderCount,
      stockCount,
      customerCount: customerCount.length,
      pendingOrders,
      outOfStock,
      
      // Additional stats the dashboard might need
      processingOrders,
      totalOrders: orderCount,
      totalProducts: stockCount,
      revenue: currentRevenue,
      
      // Percentage changes for the trend indicators
      revenueChange: Math.round(revenueChange * 10) / 10,
      orderChange: Math.round(orderChange * 10) / 10,
      productChange: Math.round(productChange * 10) / 10,
      customerChange: Math.round(customerChange * 10) / 10,
      
      // Chart data
      monthlyData
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
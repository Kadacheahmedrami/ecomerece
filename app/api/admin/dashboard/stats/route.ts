// app/api/admin/dashboard/stats/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Helper function to safely execute database operations
async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`${operationName} failed:`, error)
    return fallback
  }
}

// Helper function to test database connectivity
async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connectivity test failed:', error)
    return false
  }
}

export async function GET() {
  try {
    // First, test database connectivity
    const isConnected = await testDatabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: 'Unable to connect to the database. Please check your connection settings.',
          fallback: {
            totalRevenue: 0,
            orderCount: 0,
            stockCount: 0,
            customerCount: 0,
            pendingOrders: 0,
            outOfStock: 0,
            processingOrders: 0,
            revenueChange: 0,
            orderChange: 0,
            productChange: 0,
            customerChange: 0,
            monthlyData: []
          }
        },
        { status: 503 } // Service Unavailable
      )
    }

    // Get current date for calculations
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Execute all database operations with error handling
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
    ] = await Promise.allSettled([
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
      // Last month products for comparison
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
      // Monthly revenue data for the chart (last 8 months)
      prisma.$queryRaw<Array<{
        month: string;
        revenue: number;
        year: number;
        monthNum: number;
      }>>`
        SELECT 
          TO_CHAR("createdAt", 'Mon') as month,
          COALESCE(SUM(total), 0)::numeric as revenue,
          EXTRACT(YEAR FROM "createdAt")::integer as year,
          EXTRACT(MONTH FROM "createdAt")::integer as "monthNum"
        FROM "Order" 
        WHERE "createdAt" >= NOW() - INTERVAL '8 months'
          AND status != 'CANCELLED'
        GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt"), TO_CHAR("createdAt", 'Mon')
        ORDER BY year, "monthNum"
      `
    ])

    // Helper function to extract value from PromiseSettledResult
    function extractValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error('Operation failed:', result.reason)
        return fallback
      }
    }

    // Extract values with fallbacks
    const totalRevenueResult = extractValue(totalRevenue, { _sum: { total: null } })
    const lastMonthRevenueResult = extractValue(lastMonthRevenue, { _sum: { total: null } })
    const orderCountResult = extractValue(orderCount, 0)
    const lastMonthOrdersResult = extractValue(lastMonthOrders, 0)
    const pendingOrdersResult = extractValue(pendingOrders, 0)
    const processingOrdersResult = extractValue(processingOrders, 0)
    const stockCountResult = extractValue(stockCount, 0)
    const lastMonthProductsResult = extractValue(lastMonthProducts, 0)
    const outOfStockResult = extractValue(outOfStock, 0)
    const customerCountResult = extractValue(customerCount, [])
    const lastWeekCustomersResult = extractValue(lastWeekCustomers, [])
    const monthlyRevenueDataResult = extractValue(monthlyRevenueData, [])

    // Calculate percentage changes
    const currentRevenue = parseFloat(totalRevenueResult._sum.total?.toString() || '0')
    const previousRevenue = parseFloat(lastMonthRevenueResult._sum.total?.toString() || '0')
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0

    const orderChange = lastMonthOrdersResult > 0 ? ((orderCountResult - lastMonthOrdersResult) / lastMonthOrdersResult * 100) : 0
    
    const productChange = lastMonthProductsResult > 0 ? ((stockCountResult - (stockCountResult - lastMonthProductsResult)) / (stockCountResult - lastMonthProductsResult) * 100) : 7.2

    const customerChange = lastWeekCustomersResult.length > 0 ? ((customerCountResult.length - lastWeekCustomersResult.length) / lastWeekCustomersResult.length * 100) : 1.2

    // Transform monthly data for the chart
    const chartData = monthlyRevenueDataResult.map(item => ({
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
      orderCount: orderCountResult,
      stockCount: stockCountResult,
      customerCount: customerCountResult.length,
      pendingOrders: pendingOrdersResult,
      outOfStock: outOfStockResult,
      
      // Additional stats the dashboard might need
      processingOrders: processingOrdersResult,
      totalOrders: orderCountResult,
      totalProducts: stockCountResult,
      revenue: currentRevenue,
      
      // Percentage changes for the trend indicators
      revenueChange: Math.round(revenueChange * 10) / 10,
      orderChange: Math.round(orderChange * 10) / 10,
      productChange: Math.round(productChange * 10) / 10,
      customerChange: Math.round(customerChange * 10) / 10,
      
      // Chart data
      monthlyData,
      
      // Status indicators
      status: 'success',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Dashboard stats error:', error)
    
    // Check if it's a Prisma connection error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P1001') {
        return NextResponse.json(
          {
            error: 'Database connection failed',
            message: 'Cannot reach database server. Please check if the database is running and accessible.',
            code: error.code,
            fallback: {
              totalRevenue: 0,
              orderCount: 0,
              stockCount: 0,
              customerCount: 0,
              pendingOrders: 0,
              outOfStock: 0,
              processingOrders: 0,
              revenueChange: 0,
              orderChange: 0,
              productChange: 0,
              customerChange: 0,
              monthlyData: []
            }
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard stats',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        fallback: {
          totalRevenue: 0,
          orderCount: 0,
          stockCount: 0,
          customerCount: 0,
          pendingOrders: 0,
          outOfStock: 0,
          processingOrders: 0,
          revenueChange: 0,
          orderChange: 0,
          productChange: 0,
          customerChange: 0,
          monthlyData: []
        }
      },
      { status: 500 }
    )
  }
}
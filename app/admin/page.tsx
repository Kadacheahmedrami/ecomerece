import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { getOrderStats, getProductStats } from "@/lib/admin"
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  BarChart3,
  CircleEllipsis,
  CreditCard
} from "lucide-react"
import { AdminOrdersTable } from "@/components/admin/admin-orders-table"
import { AdminStatsChart } from "@/components/admin/admin-stats-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getRecentOrders } from "@/lib/admin"
import { cn } from "@/lib/utils"
import { AdminShell } from "@/components/admin/admin-shell"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "Admin Dashboard",
  description: "Overview of your store"
}

async function getStats() {
  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      total: true
    }
  });

  const stockCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const customerCount = await prisma.order.groupBy({
    by: ['customerEmail'],
  });

  return {
    totalRevenue: totalRevenue._sum.total || 0,
    stockCount,
    orderCount,
    customerCount: customerCount.length,
  }
}

export default async function AdminDashboard() {
  const { totalOrders, pendingOrders, revenue } = await getOrderStats()
  const { totalProducts, outOfStock } = await getProductStats()
  const recentOrders = await getRecentOrders(10)
  const stats = await getStats()

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of your store.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/products/new" className="gap-1">
                <Package className="h-4 w-4" />
                Add Product
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/products" className="gap-1">
                <BarChart3 className="h-4 w-4" />
                View Reports
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="rounded-full bg-green-100 p-1">
                <DollarSign className="h-4 w-4 text-green-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <div className="mt-1 flex items-center text-xs">
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                <span className="font-medium text-green-600">+20.1%</span>
                <span className="ml-1 text-muted-foreground">from last month</span>
              </div>
            </CardContent>
            <div className={cn(
              "h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500"
            )} />
          </Card>

          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <div className="rounded-full bg-blue-100 p-1">
                <ShoppingCart className="h-4 w-4 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orderCount}</div>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                  <span className="font-medium text-green-600">+12.4%</span>
                  <span className="ml-1 text-muted-foreground">more orders</span>
                </div>
                {pendingOrders > 0 && (
                  <div className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    {pendingOrders} pending
                  </div>
                )}
              </div>
            </CardContent>
            <div className={cn(
              "h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500"
            )} />
          </Card>

          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <div className="rounded-full bg-purple-100 p-1">
                <Package className="h-4 w-4 text-purple-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stockCount}</div>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                  <span className="font-medium text-green-600">+7.2%</span>
                  <span className="ml-1 text-muted-foreground">more products</span>
                </div>
                {outOfStock > 0 && (
                  <div className="flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {outOfStock} out of stock
                  </div>
                )}
              </div>
            </CardContent>
            <div className={cn(
              "h-1 w-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
            )} />
          </Card>

          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <div className="rounded-full bg-orange-100 p-1">
                <Users className="h-4 w-4 text-orange-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customerCount}</div>
              <div className="mt-1 flex items-center text-xs">
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                <span className="font-medium text-green-600">+1.2%</span>
                <span className="ml-1 text-muted-foreground">from last week</span>
              </div>
            </CardContent>
            <div className={cn(
              "h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500"
            )} />
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="overview" className="text-sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Sales Overview
            </TabsTrigger>
            <TabsTrigger value="recent-orders" className="text-sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Recent Orders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>Monthly revenue for the current year</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <CircleEllipsis className="h-4 w-4 mr-2" />
                    Options
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[350px]">
                  <AdminStatsChart />
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/10 px-6 py-3">
                <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
                    <span>Revenue</span>
                  </div>
                  <div>Total: ${stats.totalRevenue.toFixed(2)}</div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="recent-orders" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Your store's most recent orders</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/orders">
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AdminOrdersTable orders={recentOrders} limit={10} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  )
}


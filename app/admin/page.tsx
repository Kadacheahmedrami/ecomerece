"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  ArrowUpRight,
  AlertCircle,
  BarChart3,
  CircleEllipsis,
  MapPin,
  Loader2,
} from "lucide-react"

interface Order {
  id: string
  customerName: string
  customerEmail: string
  total: number
  status: "completed" | "pending" | "processing"
  date: string
  items: number
}

interface ChartData {
  month: string
  revenue: number
}

interface DashboardStats {
  totalRevenue: number
  revenueGrowth?: number
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  outOfStock: number
  totalCustomers: number
  processingOrders?: number
  chartData?: ChartData[]
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
  >
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
)

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 pb-4 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold text-gray-900 dark:text-gray-100 text-sm ${className}`}>{children}</h3>
)

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{children}</p>
)

const CardFooter = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-800 ${className}`}>{children}</div>
)

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  disabled,
}: {
  children: React.ReactNode
  variant?: "default" | "outline"
  size?: "default" | "sm"
  className?: string
  onClick?: () => void
  disabled?: boolean
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "border border-white/20 backdrop-blur-md bg-black hover:bg-white/20 text-gray-900 dark:text-gray-100 shadow border border-white/30",
  }
  const sizes = {
    default: "h-8 sm:h-10 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base",
    sm: "h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm",
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
)

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-32 mb-3" />
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </CardContent>
  </Card>
)

const ChartSkeleton = () => (
  <div className="h-[250px] sm:h-[300px] lg:h-[350px] flex items-end justify-between p-2 sm:p-4 space-x-1 sm:space-x-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex flex-col items-center space-y-1 sm:space-y-2 flex-1">
        <Skeleton className="w-full rounded-t-sm" style={{ height: `${Math.random() * 100 + 50}px` }} />
        <Skeleton className="h-3 w-8" />
      </div>
    ))}
  </div>
)

const TableSkeleton = () => (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <div className="inline-block min-w-full align-middle">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-white/20">
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
              <Skeleton className="h-4 w-12" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="border-b border-white/10">
              <td className="py-2 sm:py-3 px-2 sm:px-4">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4">
                <Skeleton className="h-6 w-20 rounded-full" />
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                <Skeleton className="h-4 w-20" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const Tabs = ({
  children,
  defaultValue,
  activeTab,
  onTabChange,
}: {
  children: React.ReactNode
  defaultValue: string
  activeTab: string
  onTabChange: (value: string) => void
}) => {
  return (
    <div className="w-full">
      <div className="inline-flex h-8 sm:h-9 items-center justify-center rounded-lg backdrop-blur-md bg-gray-100/20 dark:bg-gray-700/20 p-1 text-gray-600 dark:text-gray-400 border border-white/20 w-full sm:w-auto">
        <button
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${
            activeTab === "overview"
              ? "backdrop-blur-md bg-black dark:bg-black-800/30 text-black-900 dark:text-black-100 shadow border border-white/30"
              : "text-black-600 dark:text-black-400 hover:text-black-900 dark:hover:text-black-100"
          }`}
          onClick={() => onTabChange("overview")}
        >
          <BarChart3 className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
          <span className="hidden sm:inline">Sales Overview</span>
          <span className="sm:hidden">Overview</span>
        </button>
        <button
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${
            activeTab === "recent-orders"
              ? "backdrop-blur-md bg-black dark:bg-black-800/30 text-black-900 dark:text-black-100 shadow border border-white/30"
              : "text-black-600 dark:text-black-400 hover:text-black-900 dark:hover:text-black-100"
          }`}
          onClick={() => onTabChange("recent-orders")}
        >
          <ShoppingCart className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
          <span className="hidden sm:inline">Recent Orders</span>
          <span className="sm:hidden">Orders</span>
        </button>
      </div>

      <div className="mt-4 sm:mt-6">{children}</div>
    </div>
  )
}

const SimpleChart = ({ data }: { data: ChartData[] }) => {
  const maxValue = Math.max(...data.map((d) => d.revenue))

  return (
    <div className="h-[250px] sm:h-[300px] lg:h-[350px] flex items-end justify-between p-2 sm:p-4 space-x-1 sm:space-x-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center space-y-1 sm:space-y-2 flex-1">
          <div
            className="w-full backdrop-blur-md bg-gray-100/20 dark:bg-gray-700/20 rounded-t-sm relative border border-white/20"
            style={{ height: "200px" }}
          >
            <div
              className="bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-sm absolute bottom-0 w-full transition-all duration-500 ease-out"
              style={{ height: `${maxValue > 0 ? (item.revenue / maxValue) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium text-center">
            {item.month.length > 3 ? item.month.slice(0, 3) : item.month}
          </span>
        </div>
      ))}
    </div>
  )
}

const OrdersTable = ({ orders }: { orders: Order[] }) => (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <div className="inline-block min-w-full align-middle">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-white/20">
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
              Order ID
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
              Customer
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
              Total
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
              Status
            </th>
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm hidden sm:table-cell">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-white/10 hover:backdrop-blur-md hover:bg-black transition-colors"
            >
              <td className="py-2 sm:py-3 px-2 sm:px-4">
                <span className="font-mono text-[10px] sm:text-sm text-gray-900 dark:text-gray-100">
                  {order.id.length > 8 ? `${order.id.slice(0, 8)}...` : order.id}
                </span>
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                    {order.customerName}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none">
                    {order.customerEmail}
                  </div>
                </div>
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4">
                <span className="font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                  ${order.total.toFixed(2)}
                </span>
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4">
                <span
                  className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium backdrop-blur-md border ${
                    order.status === "completed"
                      ? "bg-green-100/30 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200/30"
                      : order.status === "pending"
                        ? "bg-yellow-100/30 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200/30"
                        : "bg-blue-100/30 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/30"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                {order.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const OverviewTab = ({ stats, loading }: { stats: DashboardStats | null; loading: boolean }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled={loading}>
            <CircleEllipsis className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            Options
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <ChartSkeleton />
        ) : stats?.chartData ? (
          <SimpleChart data={stats.chartData} />
        ) : (
          <div className="flex items-center justify-center p-4 h-[250px] sm:h-[300px]">
            <span className="text-gray-600 dark:text-gray-400 text-sm">No chart data available</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-gray-200 dark:border-gray-800 backdrop-blur-md bg-black">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2 sm:gap-0">
          <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="h-2 sm:h-3 w-2 sm:w-3 rounded-full bg-blue-600 mr-2"></div>
            <span>Revenue</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {loading ? <Skeleton className="h-4 w-20" /> : `Total: $${stats?.totalRevenue?.toLocaleString() || "0"}`}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

const RecentOrdersTab = ({ orders, loading }: { orders: Order[]; loading: boolean }) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your store's most recent orders</CardDescription>
        </div>
        <Button variant="outline" size="sm" disabled={loading}>
          View All
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <TableSkeleton />
      ) : orders.length > 0 ? (
        <OrdersTable orders={orders} />
      ) : (
        <div className="text-center py-6 sm:py-8">
          <ShoppingCart className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No orders</h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">No orders have been placed yet.</p>
        </div>
      )}
    </CardContent>
  </Card>
)

const StatCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  borderColor,
  badge,
}: {
  title: string
  value: string | number
  change: string
  changeLabel: string
  icon: any
  borderColor: string
  badge?: { text: string; color: string }
}) => (
  <div className={`bg-black border border-gray-800 rounded-lg p-6 relative overflow-hidden`}>
    {/* Colored bottom border */}
    <div className={`absolute bottom-0 left-0 right-0 h-1 ${borderColor}`}></div>

    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div
        className={`rounded-full p-2 ${
          title === "Total Revenue"
            ? "bg-green-900/30"
            : title === "Orders"
              ? "bg-blue-900/30"
              : title === "Products"
                ? "bg-purple-900/30"
                : "bg-orange-900/30"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            title === "Total Revenue"
              ? "text-green-400"
              : title === "Orders"
                ? "text-blue-400"
                : title === "Products"
                  ? "text-purple-400"
                  : "text-orange-400"
          }`}
        />
      </div>
    </div>

    <div className="text-3xl font-bold text-white mb-3">{value}</div>

    <div className="flex items-center justify-between">
      <div className="flex items-center text-sm">
        <ArrowUpRight className="mr-1 h-4 w-4 text-green-400" />
        <span className="font-medium text-green-400">{change}</span>
        <span className="ml-2 text-gray-400">{changeLabel}</span>
      </div>
      {badge && <div className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.text}</div>}
    </div>
  </div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard")
      if (!response.ok) throw new Error("Failed to fetch dashboard data")
      const data = await response.json()

      // Update stats with the new data structure
      setStats({
        totalRevenue: data.stats.totalRevenue,
        revenueGrowth: data.stats.revenueGrowth,
        totalOrders: data.stats.totalOrders,
        pendingOrders: data.stats.pendingOrders,
        totalProducts: data.stats.totalProducts,
        outOfStock: data.stats.outOfStock,
        totalCustomers: data.stats.totalCustomers,
        processingOrders: data.stats.processingOrders,
        chartData: data.chartData,
      })

      // Update orders with the new data structure
      setOrders(data.recentOrders)
    } catch (err) {
      setError("Failed to load dashboard data")
      console.error("Dashboard fetch error:", err)
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      setError(null)

      try {
        await fetchDashboardData()
      } catch (err) {
        console.error("Dashboard load error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const refreshData = async () => {
    setLoading(true)
    await fetchDashboardData()
    setLoading(false)
  }

  if (error) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-3 sm:space-y-4">
          <AlertCircle className="h-6 sm:h-8 w-6 sm:w-8 text-red-500" />
          <span className="text-red-600 dark:text-red-400 text-sm sm:text-base text-center">{error}</span>
          <Button onClick={refreshData} variant="outline">
            {loading ? (
              <Loader2 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{loading ? "Refreshing..." : "Refresh Data"}</span>
            <span className="sm:hidden">{loading ? "..." : "Refresh"}</span>
          </Button>
          <Button variant="outline" size="sm">
            <Package className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex bg-transparent">
            <MapPin className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            Manage Cities
          </Button>
          <Button size="sm">
            <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">View Reports</span>
            <span className="sm:hidden">Reports</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Welcome back! Here's an overview of your store performance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            {loading ? (
              <Loader2 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{loading ? "Refreshing..." : "Refresh Data"}</span>
            <span className="sm:hidden">{loading ? "..." : "Refresh"}</span>
          </Button>
          <Button variant="outline" size="sm">
            <Package className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex bg-transparent">
            <MapPin className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            Manage Cities
          </Button>
          <Button size="sm">
            <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">View Reports</span>
            <span className="sm:hidden">Reports</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            {/* Total Revenue */}
            <StatCard
              title="Total Revenue"
              value={`$${stats?.totalRevenue?.toLocaleString() || "0"}`}
              change={`+${stats?.revenueGrowth || 0}%`}
              changeLabel="from last month"
              icon={DollarSign}
              borderColor="bg-green-500"
            />

            {/* Orders */}
            <StatCard
              title="Orders"
              value={stats?.totalOrders || 0}
              change={`+${stats?.pendingOrders || 0}%`}
              changeLabel="more orders"
              icon={ShoppingCart}
              borderColor="bg-blue-500"
              badge={{
                text: `${stats?.pendingOrders || 1} pending`,
                color: "bg-yellow-900/30 text-yellow-400 border border-yellow-800",
              }}
            />

            {/* Products */}
            <StatCard
              title="Products"
              value={stats?.totalProducts || 0}
              change={`+${stats?.outOfStock || 7.2}%`}
              changeLabel="more products"
              icon={Package}
              borderColor="bg-purple-500"
              badge={{
                text: `${stats?.outOfStock || 0} out`,
                color: "bg-red-900/30 text-red-400 border border-red-800",
              }}
            />

            {/* Total Customers */}
            <StatCard
              title="Total Customers"
              value={stats?.totalCustomers || 1}
              change={`+${stats?.processingOrders || 0}%`}
              changeLabel="from last week"
              icon={Users}
              borderColor="bg-orange-500"
            />
          </>
        )}
      </div>

      {/* Tabs Section */}
      <div className="space-y-4 sm:space-y-6">
        <Tabs defaultValue="overview" activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "overview" && <OverviewTab stats={stats} loading={loading} />}
          {activeTab === "recent-orders" && <RecentOrdersTab orders={orders} loading={loading} />}
        </Tabs>
      </div>
    </div>
  )
}

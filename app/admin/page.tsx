"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
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
  orderCount: number
  stockCount: number
  customerCount: number
  pendingOrders: number
  outOfStock: number
  processingOrders?: number
  revenueChange?: number
  orderChange?: number
  productChange?: number
  customerChange?: number
  monthlyData?: ChartData[]
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`backdrop-blur-lg bg-black border border-white/20 rounded-lg shadow-lg ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-4 sm:px-6 py-3 sm:py-4 ${className}`}>{children}</div>
)

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-4 sm:px-6 pb-3 sm:pb-4 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base ${className}`}>{children}</h3>
)

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{children}</p>
)

const CardFooter = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-4 sm:px-6 py-2 sm:py-3 ${className}`}>{children}</div>
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

const OverviewTab = ({ stats }: { stats: DashboardStats | null }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <CircleEllipsis className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            Options
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {stats?.monthlyData ? (
          <SimpleChart data={stats.monthlyData} />
        ) : (
          <div className="flex items-center justify-center p-4 h-[250px] sm:h-[300px]">
            <span className="text-gray-600 dark:text-gray-400 text-sm">No chart data available</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-white/20 backdrop-blur-md bg-black">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2 sm:gap-0">
          <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="h-2 sm:h-3 w-2 sm:w-3 rounded-full bg-blue-600 mr-2"></div>
            <span>Revenue</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Total: ${stats?.totalRevenue?.toLocaleString() || "0"}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

const RecentOrdersTab = ({ orders }: { orders: Order[] }) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your store's most recent orders</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {orders.length > 0 ? (
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError("Failed to load dashboard statistics")
      console.error("Stats fetch error:", err)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/recent-orders?limit=10")
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setOrders(data.orders || data)
    } catch (err) {
      setError("Failed to load recent orders")
      console.error("Orders fetch error:", err)
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      setError(null)

      try {
        await Promise.all([fetchStats(), fetchOrders()])
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
    await Promise.all([fetchStats(), fetchOrders()])
    setLoading(false)
  }

  // Mock data for demonstration
  useEffect(() => {
    if (!stats) {
      setTimeout(() => {
        setStats({
          totalRevenue: 45231.89,
          orderCount: 1426,
          stockCount: 342,
          customerCount: 1892,
          pendingOrders: 23,
          outOfStock: 5,
          revenueChange: 12.5,
          orderChange: 8.3,
          productChange: 4.7,
          customerChange: 15.2,
          monthlyData: [
            { month: "Jan", revenue: 12000 },
            { month: "Feb", revenue: 15000 },
            { month: "Mar", revenue: 18000 },
            { month: "Apr", revenue: 22000 },
            { month: "May", revenue: 25000 },
            { month: "Jun", revenue: 28000 },
          ]
        })
        setOrders([
          {
            id: "ORD-001",
            customerName: "John Doe",
            customerEmail: "john@example.com",
            total: 299.99,
            status: "completed",
            date: "2024-01-15",
            items: 3
          },
          {
            id: "ORD-002",
            customerName: "Jane Smith",
            customerEmail: "jane@example.com",
            total: 149.50,
            status: "pending",
            date: "2024-01-14",
            items: 2
          },
          {
            id: "ORD-003",
            customerName: "Bob Johnson",
            customerEmail: "bob@example.com",
            total: 89.99,
            status: "processing",
            date: "2024-01-13",
            items: 1
          }
        ])
        setLoading(false)
      }, 1000)
    }
  }, [stats])

  if (loading && !stats) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <Loader2 className="h-6 sm:h-8 w-6 sm:w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-3 sm:space-y-4">
          <AlertCircle className="h-6 sm:h-8 w-6 sm:w-8 text-red-500" />
          <span className="text-red-600 dark:text-red-400 text-sm sm:text-base text-center">{error}</span>
          <Button onClick={refreshData} variant="outline">
            Try Again
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
            {loading ? <Loader2 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2 animate-spin" /> : <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />}
            <span className="hidden sm:inline">{loading ? "Refreshing..." : "Refresh Data"}</span>
            <span className="sm:hidden">{loading ? "..." : "Refresh"}</span>
          </Button>
          <Button variant="outline" size="sm">
            <Package className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
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
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
        {/* Total Revenue */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <div className="rounded-full backdrop-blur-md bg-green-100/30 dark:bg-green-900/30 p-1.5 sm:p-2 border border-green-200/30">
              <DollarSign className="h-3 sm:h-4 w-3 sm:w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${stats?.totalRevenue?.toLocaleString() || "0"}
            </div>
            <div className="mt-1 flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-600 dark:text-green-400">+{stats?.revenueChange || 0}%</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400 hidden sm:inline">from last month</span>
            </div>
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
        </Card>

        {/* Orders */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Orders</CardTitle>
            <div className="rounded-full backdrop-blur-md bg-blue-100/30 dark:bg-blue-900/30 p-1.5 sm:p-2 border border-blue-200/30">
              <ShoppingCart className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.orderCount || 0}</div>
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center text-xs">
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-600 dark:text-green-400">+{stats?.orderChange || 0}%</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400 hidden lg:inline">more orders</span>
              </div>
              <div className="rounded-full backdrop-blur-md bg-yellow-100/30 dark:bg-yellow-900/30 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-yellow-800 dark:text-yellow-400 border border-yellow-200/30">
                {stats?.pendingOrders || 0} pending
              </div>
            </div>
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
        </Card>

        {/* Products */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Products</CardTitle>
            <div className="rounded-full backdrop-blur-md bg-purple-100/30 dark:bg-purple-900/30 p-1.5 sm:p-2 border border-purple-200/30">
              <Package className="h-3 sm:h-4 w-3 sm:w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.stockCount || 0}</div>
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center text-xs">
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-600 dark:text-green-400">+{stats?.productChange || 0}%</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400 hidden lg:inline">more products</span>
              </div>
              <div className="flex items-center rounded-full backdrop-blur-md bg-red-100/30 dark:bg-red-900/30 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-red-800 dark:text-red-400 border border-red-200/30">
                <AlertCircle className="mr-1 h-2 sm:h-3 w-2 sm:w-3" />
                {stats?.outOfStock || 0} out
              </div>
            </div>
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-fuchsia-500" />
        </Card>

        {/* Customers */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Customers</CardTitle>
            <div className="rounded-full backdrop-blur-md bg-orange-100/30 dark:bg-orange-900/30 p-1.5 sm:p-2 border border-orange-200/30">
              <Users className="h-3 sm:h-4 w-3 sm:w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.customerCount || 0}</div>
            <div className="mt-1 flex items-center text-xs">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-600 dark:text-green-400">+{stats?.customerChange || 0}%</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400 hidden sm:inline">from last week</span>
            </div>
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
        </Card>
      </div>

      {/* Tabs Section */}
      <div className="space-y-4 sm:space-y-6">
        <Tabs defaultValue="overview" activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "overview" ? <OverviewTab stats={stats} /> : <RecentOrdersTab orders={orders} />}
        </Tabs>
      </div>
    </div>
  )
}
// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toNumber(v: any) {
  if (v === null || v === undefined) return 0;
  return Number(v);
}

export async function GET() {
  try {
    const now = new Date();
    // start of 6 months ago (include current month => 6 buckets)
    const startSixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // run several simple prisma queries in one transaction (single connection)
    const [
      // recent orders with product info
      recentOrders,
      // all non-cancelled orders totals + status + date (used to compute totalRevenue, status counts, and monthly buckets)
      ordersNonCancelled,
      // unique customer emails (we'll dedupe in JS)
      allCustomerEmails,
      // product counts
      totalProducts,
      outOfStockCount,
      // orders for current month (simple find to sum in JS)
      currentMonthOrders,
      // orders for last month
      lastMonthOrders,
    ] = await prisma.$transaction([
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { product: { select: { name: true } } },
      }),

      // fetch minimal fields for all non-cancelled orders (careful: could be many rows)
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" } },
        select: { total: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),

      // get all customer emails (we'll uniq them)
      prisma.order.findMany({
        select: { customerEmail: true },
      }),

      // product counts
      prisma.product.count({ where: { visible: true } }),
      prisma.product.count({ where: { visible: true, stock: { lte: 0 } } }),

      // current month orders (for revenue comparison)
      prisma.order.findMany({
        where: {
          createdAt: { gte: currentMonthStart, lt: nextMonthStart },
          status: { not: "CANCELLED" },
        },
        select: { total: true },
      }),

      // last month orders
      prisma.order.findMany({
        where: {
          createdAt: { gte: lastMonthStart, lt: currentMonthStart },
          status: { not: "CANCELLED" },
        },
        select: { total: true },
      }),
    ]);

    // total revenue (sum totals)
    const totalRevenue = ordersNonCancelled.reduce((acc, o) => acc + toNumber(o.total), 0);

    // order status counts (from non-cancelled orders)
    const statusCounts = ordersNonCancelled.reduce<Record<string, number>>((acc, o) => {
      const s = o.status ?? "UNKNOWN";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    // monthly revenue for last 6 months (use ordersNonCancelled to compute buckets)
    const chartData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthName = d.toLocaleDateString("en", { month: "short" });
      // sum ordersNonCancelled that have same year/month
      const revenue = ordersNonCancelled
        .filter((o) => {
          const od = new Date(o.createdAt);
          return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
        })
        .reduce((a, b) => a + toNumber(b.total), 0);

      const ordersCount = ordersNonCancelled.filter((o) => {
        const od = new Date(o.createdAt);
        return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
      }).length;

      return { month: monthName, revenue, orders: ordersCount };
    });

    // revenue growth (current vs last month)
    const currMonthTotal = currentMonthOrders.reduce((s, o) => s + toNumber(o.total), 0);
    const lastMonthTotal = lastMonthOrders.reduce((s, o) => s + toNumber(o.total), 0);
    const revenueGrowth = lastMonthTotal > 0 ? ((currMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // unique customers
    const customerSet = new Set(allCustomerEmails.map((c) => c.customerEmail).filter(Boolean));
    const totalCustomers = customerSet.size;

    // format recent orders
    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      customer: order.customerName,
      email: order.customerEmail,
      city: order.city,
      product: order.product?.name ?? null,
      quantity: order.quantity,
      total: toNumber(order.total),
      status: order.status,
      date: order.createdAt.toISOString(),
    }));

    const stats = {
      totalRevenue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      totalOrders: ordersNonCancelled.length,
      pendingOrders: statusCounts.PENDING ?? 0,
      totalProducts,
      outOfStock: outOfStockCount,
      totalCustomers,
      processingOrders: statusCounts.PROCESSING ?? 0,
    };

    return NextResponse.json({ stats, chartData, recentOrders: formattedRecentOrders });
  } catch (error: any) {
    console.error("Dashboard simple-prisma error:", error?.message ?? error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data. See server logs for details." },
      { status: 500 },
    );
  }
}

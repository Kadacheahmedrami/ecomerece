"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data - in a real app, this would come from your API
const data = [
  { name: "Jan", revenue: 4000, orders: 24 },
  { name: "Feb", revenue: 3000, orders: 18 },
  { name: "Mar", revenue: 5000, orders: 30 },
  { name: "Apr", revenue: 2780, orders: 16 },
  { name: "May", revenue: 1890, orders: 11 },
  { name: "Jun", revenue: 2390, orders: 14 },
  { name: "Jul", revenue: 3490, orders: 21 },
]

export function AdminStatsChart() {
  return (
    <ChartContainer
      config={{
        revenue: {
          label: "Revenue",
          color: "hsl(var(--chart-1))",
        },
        orders: {
          label: "Orders",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="var(--color-revenue)" />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-orders)" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" activeDot={{ r: 8 }} />
          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="var(--color-orders)" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


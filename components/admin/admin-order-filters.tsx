"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AdminOrderFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const status = searchParams.get("status") || ""

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set("status", value)
    } else {
      params.delete("status")
    }
    router.push(`/admin/orders?${params.toString()}`)
  }

  const handleReset = () => {
    router.push("/admin/orders")
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="SHIPPED">Shipped</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleReset}>
        Reset Filters
      </Button>
    </div>
  )
}


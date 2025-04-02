"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AdminProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const category = searchParams.get("category") || ""
  const status = searchParams.get("status") || ""

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("category", value)
    } else {
      params.delete("category")
    }
    router.push(`/admin/products?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("status", value)
    } else {
      params.delete("status")
    }
    router.push(`/admin/products?${params.toString()}`)
  }

  const handleReset = () => {
    router.push("/admin/products")
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Clothing">Clothing</SelectItem>
          <SelectItem value="Accessories">Accessories</SelectItem>
          <SelectItem value="Electronics">Electronics</SelectItem>
          <SelectItem value="Home">Home</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="visible">Visible</SelectItem>
          <SelectItem value="hidden">Hidden</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleReset}>
        Reset Filters
      </Button>
    </div>
  )
}


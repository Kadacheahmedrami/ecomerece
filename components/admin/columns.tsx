"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDate } from "@/lib/utils"

export type CustomerColumn = {
  id: string
  customerName: string
  customerEmail: string
  phone: string
  city: string
  deliveryType: string
  createdAt: Date
}

export const columns: ColumnDef<CustomerColumn>[] = [
  {
    accessorKey: "customerName",
    header: "Name",
  },
  {
    accessorKey: "customerEmail",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "deliveryType",
    header: "Delivery Type",
    cell: ({ row }) => {
      const deliveryType = row.getValue("deliveryType") as string
      return deliveryType === "HOME_DELIVERY" ? "Home Delivery" : "Local Agency Pickup"
    }
  },
  {
    accessorKey: "createdAt",
    header: "First Order",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
] 
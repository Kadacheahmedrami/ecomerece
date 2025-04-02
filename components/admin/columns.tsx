"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDate } from "@/lib/utils"

export type CustomerColumn = {
  id: string
  customerName: string
  customerEmail: string
  phone: string
  address: string
  city: string
  country: string
  zipCode: string
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
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "zipCode",
    header: "Zip Code",
  },
  {
    accessorKey: "createdAt",
    header: "First Order",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
] 
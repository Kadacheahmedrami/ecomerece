import type React from "react"
import { checkAdminAccess } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {children}
    </div>
  )
}


"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Toaster } from "@/components/ui/toaster"

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 pt-0 md:ml-64 overflow-x-hidden">
          <div className="mx-auto max-w-7xl w-full py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
} 
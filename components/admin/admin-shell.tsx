"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Toaster } from "@/components/ui/toaster"

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <>
      <AdminSidebar />

      <div className="flex flex-col  mx-auto min-h-screen">
    
 
      
    <main className="flex-1 p-4  md:p-6 pt-0 md:ml-64 overflow-x-hidden">
      <div className="mx-auto  w-full ">
        {children}
      </div>
    </main>

    <Toaster />

  </div>
  
    </>
 
  )
} 
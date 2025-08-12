import type React from "react"
import type { Metadata } from "next"
import { checkAdminAccess } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { getServerSession } from "next-auth/next"


export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s - Admin | ModernShop"
  },
  description: "Admin dashboard for managing ModernShop e-commerce platform",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  }
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  try {
    const session = await getServerSession()
    
    // First check if user is logged in
    if (!session?.user) {
      redirect("/api/auth/signin?callbackUrl=/admin")
    }

    // Then check admin access
    const isAdmin = await checkAdminAccess()
    
    if (!isAdmin) {
      // Return 404 instead of redirect to avoid revealing admin routes
      notFound()
    }

    return (
      <AdminShell>
        {children}
        
      </AdminShell>
    )
  } catch (error) {
    console.error("Admin layout error:", error)
    // Fallback to 404 on any error
    notFound()
  }
}
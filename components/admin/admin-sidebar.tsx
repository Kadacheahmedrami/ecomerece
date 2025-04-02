"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, Settings, Users, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      href: "/admin/products",
      label: "Products",
      icon: Package,
      active: pathname.includes("/admin/products"),
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ShoppingCart,
      active: pathname.includes("/admin/orders"),
    },
    {
      href: "/admin/customers",
      label: "Customers",
      icon: Users,
      active: pathname.includes("/admin/customers"),
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.includes("/admin/settings"),
    },
  ]

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-background border-r overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  route.active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                <route.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t p-4">
          <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}


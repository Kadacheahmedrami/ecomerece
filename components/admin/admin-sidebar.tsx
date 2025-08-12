"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, Settings, Users, LogOut, MapPin } from "lucide-react"
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
      badge: "24",
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ShoppingCart,
      active: pathname.includes("/admin/orders"),
      badge: "3",
    },
    {
      href: "/admin/customers",
      label: "Customers",
      icon: Users,
      active: pathname.includes("/admin/customers"),
    },
    {
      href: "/admin/cities",
      label: "Cities",
      icon: MapPin,
      active: pathname.includes("/admin/cities"),
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.includes("/admin/settings"),
    },
  ]

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16 md:z-40">
      <div className="flex flex-col flex-grow bg-background border-r overflow-y-auto">
        {/* Header section with proper spacing */}
        <div className="flex items-center flex-shrink-0 px-4 py-5 border-b">
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
        
        {/* Navigation section */}
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out",
                  route.active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm",
                )}
              >
                <div className="flex items-center min-w-0">
                  <route.icon className="mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="truncate">{route.label}</span>
                </div>
                {route.badge && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full transition-colors duration-200 ml-2",
                      route.active 
                        ? "bg-primary-foreground text-primary" 
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {route.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Footer section with logout */}
        <div className="flex-shrink-0 border-t p-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive group"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn, signOut } from "next-auth/react"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Menu,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  Users,
  Settings,
  ShoppingBag,
  ChevronDown,
  Crown,
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import Image from "next/image"

// Extend session user type to include isAdmin
type ExtendedUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
}

interface HeaderProps {
  session?: Session | null
  isadmin?: boolean
}

export default function Header({ session, isadmin }: HeaderProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  
  // Cast user to extended type and check admin status
  const user = session?.user as ExtendedUser | undefined
  const isUserAdmin = isadmin || user?.isAdmin
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-shadow duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-background'}`}>
      <div className="flex h-16 mx-auto items-center">
        <div className="flex items-center mx-4 justify-between w-full">
          {/* Left section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center  group">
              <div className="  transition-transform group-hover:scale-105">
                <Image 
                  src="/logo.svg" 
                  alt="Shop ELBHJA Logo" 
                  width={160} 
                  height={160}
                
                />
              </div>
              <div className="flex relative right-10 flex-col">
                <span className="text-3xl italic font-black tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hover:from-primary/80 hover:to-primary transition-all duration-300">
                  Shop ELBHJA
                </span>
              </div>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 px-3 py-2 rounded-xl hover:bg-muted/80 transition-all duration-200 group border border-transparent hover:border-border/50"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 ring-2 ring-background shadow-sm">
                          <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xs">
                            {user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:flex flex-col items-start min-w-0">
                          <span className="text-sm font-medium truncate max-w-24">
                            {user?.name?.split(' ')[0] || 'User'}
                          </span>
                          {isUserAdmin && (
                            <div className="flex items-center gap-1">
                              <Crown className="h-3 w-3 text-amber-500" />
                              <span className="text-xs text-amber-600 font-medium">Admin</span>
                            </div>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors group-data-[state=open]:rotate-180 transition-transform duration-200" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-64 p-2" 
                    align="end" 
                    sideOffset={8}
                    forceMount
                  >
                    {/* User Profile Header */}
                    <div className="p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                          <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                            {user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          {isUserAdmin && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                              <span className="text-xs text-amber-600 dark:text-amber-500 font-medium">Administrator</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Admin menu items */}
                    {isUserAdmin && (
                      <>
                        <div className="px-2 py-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Admin Panel
                          </p>
                        </div>
                        <div className="space-y-1 mb-2">
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href="/admin" className="flex items-center py-2">
                              <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                                <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-medium">Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href="/admin/orders" className="flex items-center py-2">
                              <div className="h-8 w-8 rounded-md bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                                <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              </div>
                              <span className="font-medium">Orders</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href="/admin/products" className="flex items-center py-2">
                              <div className="h-8 w-8 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="font-medium">Products</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href="/admin/customers" className="flex items-center py-2">
                              <div className="h-8 w-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <span className="font-medium">Customers</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href="/admin/settings" className="flex items-center py-2">
                              <div className="h-8 w-8 rounded-md bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center mr-3">
                                <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </div>
                              <span className="font-medium">Settings</span>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    <DropdownMenuItem 
                      onClick={() => signOut()} 
                      className="rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10 py-2"
                    >
                      <div className="h-8 w-8 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                        <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="font-medium">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button 
                variant="default" 
                onClick={() => signIn("google")} 
                className="hidden md:flex rounded-xl px-6 py-2 font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                Sign In
              </Button>
            )}

            {/* Mobile menu - moved to far right */}
            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96 p-0 flex flex-col">
                  {/* Header */}
                  <div className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl overflow-hidden">
                        <Image 
                          src="/logo.svg" 
                          alt="Shop ELBHJA Logo" 
                          width={40} 
                          height={40}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="font-black text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Shop ELBHJA</h2>
                        <p className="text-xs text-muted-foreground">Admin Portal</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Content */}
                  <div className="flex-1 overflow-y-auto">
                    {session ? (
                      <>
                        {/* User Profile Section */}
                        <div className="p-6 pb-4">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                              <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {user?.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{user?.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                              {isUserAdmin && (
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                  <span className="text-xs text-green-600 font-medium">Admin</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Admin Navigation */}
                        {isUserAdmin && (
                          <div className="px-6 pb-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                              Admin Panel
                            </h3>
                            <nav className="space-y-1">
                              <SheetClose asChild>
                                <Link 
                                  href="/admin/dashboard"
                                  className={`flex items-center text-sm font-medium rounded-xl py-3 px-3 transition-all duration-200 hover:bg-primary/10 hover:text-primary group ${
                                    pathname === '/admin/dashboard' ? 'bg-primary/10 text-primary' : 'text-foreground/70'
                                  }`}
                                >
                                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                    <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <span>Dashboard</span>
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link 
                                  href="/admin/orders"
                                  className={`flex items-center text-sm font-medium rounded-xl py-3 px-3 transition-all duration-200 hover:bg-primary/10 hover:text-primary group ${
                                    pathname === '/admin/orders' ? 'bg-primary/10 text-primary' : 'text-foreground/70'
                                  }`}
                                >
                                  <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                                    <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                  </div>
                                  <span>Orders</span>
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link 
                                  href="/admin/products"
                                  className={`flex items-center text-sm font-medium rounded-xl py-3 px-3 transition-all duration-200 hover:bg-primary/10 hover:text-primary group ${
                                    pathname === '/admin/products' ? 'bg-primary/10 text-primary' : 'text-foreground/70'
                                  }`}
                                >
                                  <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                    <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  </div>
                                  <span>Products</span>
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link 
                                  href="/admin/customers"
                                  className={`flex items-center text-sm font-medium rounded-xl py-3 px-3 transition-all duration-200 hover:bg-primary/10 hover:text-primary group ${
                                    pathname === '/admin/customers' ? 'bg-primary/10 text-primary' : 'text-foreground/70'
                                  }`}
                                >
                                  <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <span>Customers</span>
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link 
                                  href="/admin/settings"
                                  className={`flex items-center text-sm font-medium rounded-xl py-3 px-3 transition-all duration-200 hover:bg-primary/10 hover:text-primary group ${
                                    pathname === '/admin/settings' ? 'bg-primary/10 text-primary' : 'text-foreground/70'
                                  }`}
                                >
                                  <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-900/50 transition-colors">
                                    <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <span>Settings</span>
                                </Link>
                              </SheetClose>
                            </nav>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-6">
                        <div className="text-center py-8">
                          <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold mb-2">Welcome to Shop ELBHJA</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Sign in to access your admin panel and manage your store.
                          </p>
                          <SheetClose asChild>
                            <Button className="w-full" onClick={() => signIn("google")}>
                              Sign In with Google
                            </Button>
                          </SheetClose>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {session && (
                    <div className="border-t p-6 mt-auto">
                      <SheetClose asChild>
                        <button 
                          onClick={() => signOut()}
                          className="flex items-center justify-center w-full text-sm font-medium rounded-xl py-3 px-4 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive text-muted-foreground group"
                        >
                          <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                            <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span>Sign Out</span>
                        </button>
                      </SheetClose>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
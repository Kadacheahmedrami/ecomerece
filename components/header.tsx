"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Package,
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

// Extend session user type to include isAdmin
type ExtendedUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
}

// Define the type for route objects
type Route = {
  href: string;
  label: string;
  active: boolean;
}

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  
  // Cast user to extended type
  const user = session?.user as ExtendedUser | undefined
  
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
  
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "")
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchQuery) {
      params.set("search", searchQuery)
    } else {
      params.delete("search")
    }
    
    router.push(`/?${params.toString()}`)
    setShowMobileSearch(false)
  }

 

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-shadow duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-background'}`}>
      <div className="container flex h-16 mx-auto items-center">
        <div className="flex items-center justify-between w-full">
          {/* Left section */}
          <div className="flex items-center">
            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 sm:w-80 pt-12">
                  <nav className="flex flex-col gap-4">
              
                    {user?.isAdmin && (
                      <SheetClose asChild>
                        <Link 
                          href="/admin"
                          className="flex items-center text-sm font-medium rounded-md py-2 px-3 transition-colors hover:bg-muted text-muted-foreground"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </SheetClose>
                    )}
                  </nav>
                  
                  <div className="mt-6 border-t pt-6">
                    {session ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{user?.name}</span>
                            <span className="text-xs text-muted-foreground">{user?.email}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <SheetClose asChild>
                            <Link 
                              href="/account"
                              className="flex items-center w-full text-sm font-medium rounded-md py-2 px-3 transition-colors hover:bg-muted text-muted-foreground"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Account
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link 
                              href="/orders"
                              className="flex items-center w-full text-sm font-medium rounded-md py-2 px-3 transition-colors hover:bg-muted text-muted-foreground"
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Orders
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <button 
                              onClick={() => signOut()}
                              className="flex items-center w-full text-sm font-medium rounded-md py-2 px-3 transition-colors hover:bg-muted text-muted-foreground"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Log out
                            </button>
                          </SheetClose>
                        </div>
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Button className="w-full" onClick={() => signIn("google")}>
                          Sign In
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/" className="font-bold text-xl">
              <span className="text-primary">Modern</span>Shop
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {showMobileSearch ? (
              <div className="absolute inset-0 z-50 flex items-center px-4 bg-background md:hidden">
                <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
                  <Input 
                    type="search" 
                    placeholder="Search products..." 
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <Button type="submit" size="icon" variant="ghost">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setShowMobileSearch(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            ) : (
              <>
                <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search products..." 
                    className="w-full bg-background pl-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileSearch(true)}>
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </>
            )}

            {session ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                        <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user?.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account">Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button variant="default" onClick={() => signIn("google")} className="hidden md:flex">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


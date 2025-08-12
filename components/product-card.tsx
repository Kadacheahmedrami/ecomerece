"use client"

import type { Product } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Search, X, SlidersHorizontal } from "lucide-react"

// Extend Product type to include optional comparePrice
type ExtendedProduct = Product & {
  comparePrice?: number;
}

interface ProductCardProps {
  productId?: string;
  limit?: number;
  category?: string;
  search?: string;
  showSearch?: boolean; // New prop to control search display
}

// Category options - you can modify these based on your product categories
const categories = [
  "Electronics",
  "Clothing", 
  "Home & Garden",
  "Books",
  "Sports",
  "Beauty",
  "Toys",
  "Automotive"
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
]

// Format price in English and append "DA"
const formatDZD = (price: number): string => {
  if (typeof price !== "number" || isNaN(price)) return `0.00 DA`
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)} DA`
}

export function ProductCard({ productId, limit = 12, category, search, showSearch = false }: ProductCardProps) {
  const [products, setProducts] = useState<ExtendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search state
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState(search || "")
  const [selectedCategory, setSelectedCategory] = useState(category || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "")
  const [showFilters, setShowFilters] = useState(Boolean(category || searchParams.get("sort")))

  const hasActiveFilters = searchQuery || selectedCategory || sortBy

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        let url = `/api/products?limit=${limit}`
        
        if (productId) {
          url = `/api/products/${productId}`
        } else {
          if (selectedCategory) {
            url += `&category=${encodeURIComponent(selectedCategory)}`
          }
          if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`
          }
          if (sortBy) {
            url += `&sort=${encodeURIComponent(sortBy)}`
          }
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        
        // Handle both single product and array of products
        if (productId) {
          setProducts([data])
        } else {
          setProducts(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [productId, limit, selectedCategory, searchQuery, sortBy])

  const updateURL = (newSearch?: string, newCategory?: string, newSort?: string) => {
    const params = new URLSearchParams()
    
    const finalSearch = newSearch !== undefined ? newSearch : searchQuery
    const finalCategory = newCategory !== undefined ? newCategory : selectedCategory
    const finalSort = newSort !== undefined ? newSort : sortBy
    
    if (finalSearch?.trim()) {
      params.set("search", finalSearch.trim())
    }
    
    if (finalCategory) {
      params.set("category", finalCategory)
    }
    
    if (finalSort) {
      params.set("sort", finalSort)
    }

    const queryString = params.toString()
    startTransition(() => {
      router.push(`/${queryString ? `?${queryString}` : ''}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL()
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    updateURL(undefined, value, undefined)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    updateURL(undefined, undefined, value)
  }

  const clearAll = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSortBy("")
    startTransition(() => {
      router.push("/")
    })
  }

  const clearFilter = (filterType: "search" | "category" | "sort") => {
    if (filterType === "search") {
      setSearchQuery("")
      updateURL("", undefined, undefined)
    } else if (filterType === "category") {
      setSelectedCategory("")
      updateURL(undefined, "", undefined)
    } else if (filterType === "sort") {
      setSortBy("")
      updateURL(undefined, undefined, "")
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        {showSearch && <SearchSection />}
        <ProductCardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        {showSearch && <SearchSection />}
        <div className="text-red-500 p-4 text-center">Error loading products: {error}</div>
      </div>
    )
  }

  function SearchSection() {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 mb-8">
        {/* Main Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              disabled={isPending}
            />
          </div>
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="sr-only">Search</span>
          </Button>
        </form>

        {/* Filters Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {[searchQuery, selectedCategory, sortBy].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4">
              <div className="flex flex-wrap gap-4 justify-center items-center p-4 bg-muted/30 rounded-lg">
                <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={isPending}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={handleSortChange} disabled={isPending}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default</SelectItem>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearAll} disabled={isPending}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 justify-center">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchQuery}"
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-muted rounded" 
                  onClick={() => clearFilter("search")}
                />
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {selectedCategory}
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-muted rounded" 
                  onClick={() => clearFilter("category")}
                />
              </Badge>
            )}
            {sortBy && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Sort: {sortOptions.find(opt => opt.value === sortBy)?.label || sortBy}
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-muted rounded" 
                  onClick={() => clearFilter("sort")}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Search Results Indicator */}
        {hasActiveFilters && (
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {searchQuery && (
                <>
                  Results for <span className="text-foreground font-semibold">"{searchQuery}"</span>
                  {selectedCategory && <span className="text-foreground font-semibold"> in {selectedCategory}</span>}
                </>
              )}
              {!searchQuery && selectedCategory && (
                <>Products in <span className="text-foreground font-semibold">{selectedCategory}</span></>
              )}
            </p>
          </div>
        )}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="w-full">
        {showSearch && <SearchSection />}
        <div className="text-muted-foreground p-4 text-center">
          {searchQuery ? `No products found for "${searchQuery}"` : "No products found"}
        </div>
      </div>
    )
  }

  if (productId) {
    return <SingleProductCard product={products[0]} />
  }

  return (
    <div className="w-full">
      {showSearch && <SearchSection />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <SingleProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

function SingleProductCard({ product }: { product: ExtendedProduct }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const isNewProduct = new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const isOnSale = product.comparePrice && product.comparePrice > product.price

  // Safely handle images array
  const imageUrl = product.images?.[0] || "/placeholder.svg"

  return (
    <div 
      className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-64 w-full bg-muted/20">
          <Image 
            src={imageError ? "/placeholder.svg" : imageUrl}
            alt={product.name} 
            fill 
            className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            priority={true}
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjFmMSIvPjwvc3ZnPg=="
            onError={() => setImageError(true)}
          />
          
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {isNewProduct && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">New</Badge>
            )}
            {isOnSale && product.comparePrice && (
              <Badge variant="default" className="bg-red-600 hover:bg-red-700">
                Sale {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
              </Badge>
            )}
          </div>
        </div>
      </Link>
      
      <div className="p-4 bg-white dark:bg-gray-950">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-medium text-lg truncate group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-1 mt-1">{product.description}</p>
        </Link>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <p className="font-bold text-lg">{formatDZD(product.price)}</p>
            {isOnSale && product.comparePrice && (
              <p className="text-sm text-muted-foreground line-through">{formatDZD(product.comparePrice)}</p>
            )}
          </div>
          
          <Button size="sm" variant="default" asChild>
            <Link href={`/products/${product.id}`} prefetch={true}>View Product</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="group relative overflow-hidden rounded-lg bg-muted/20 animate-pulse">
          <div className="h-64 w-full bg-muted/40" />
          <div className="p-4 bg-white dark:bg-gray-950">
            <div className="h-6 bg-muted/40 rounded mb-2" />
            <div className="h-4 bg-muted/30 rounded mb-3 w-3/4" />
            <div className="flex items-center justify-between">
              <div className="h-6 bg-muted/40 rounded w-20" />
              <div className="h-8 bg-muted/40 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
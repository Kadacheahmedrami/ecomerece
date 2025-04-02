"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"

const categories = [
  { id: "clothing", name: "Clothing" },
  { id: "accessories", name: "Accessories" },
  { id: "electronics", name: "Electronics" },
  { id: "home", name: "Home" },
  { id: "beauty", name: "Beauty" },
  { id: "sports", name: "Sports" },
]

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const category = searchParams.get("category")
  const searchQuery = searchParams.get("search") || ""
  const minPrice = searchParams.get("minPrice") || "0"
  const maxPrice = searchParams.get("maxPrice") || "1000"
  
  const [priceRange, setPriceRange] = useState([parseInt(minPrice), parseInt(maxPrice)])
  const [search, setSearch] = useState(searchQuery)
  
  useEffect(() => {
    setSearch(searchQuery)
    setPriceRange([parseInt(minPrice || "0"), parseInt(maxPrice || "1000")])
  }, [searchQuery, minPrice, maxPrice])

  const handleCategoryChange = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (category === categoryName) {
      params.delete("category")
    } else {
      params.set("category", categoryName)
    }

    router.push(`/?${params.toString()}`)
  }
  
  const handlePriceChange = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())
    
    router.push(`/?${params.toString()}`)
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams(searchParams.toString())
    
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    
    router.push(`/?${params.toString()}`)
  }

  const handleReset = () => {
    router.push("/")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-medium">Search</h3>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2">
          Reset all
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["categories", "price"]}>
        <AccordionItem value="categories">
          <AccordionTrigger className="text-sm font-medium">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${cat.id}`}
                    checked={category === cat.name}
                    onCheckedChange={() => handleCategoryChange(cat.name)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label htmlFor={`category-${cat.id}`} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {cat.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={priceRange}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
                className="my-6"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Min</p>
                  <div className="border px-2 py-1 rounded-md">
                    <p className="text-sm">${priceRange[0]}</p>
                  </div>
                </div>
                <span className="mx-2 text-muted-foreground">-</span>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Max</p>
                  <div className="border px-2 py-1 rounded-md">
                    <p className="text-sm">${priceRange[1]}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="w-full mt-2" 
                onClick={handlePriceChange}
                variant="outline"
              >
                Apply
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}


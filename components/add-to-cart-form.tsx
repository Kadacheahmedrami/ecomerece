"use client"

import { useState } from "react"
import type { Product } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AddToCartFormProps {
  product: Product
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1)
  const { toast } = useToast()

  const handleAddToCart = () => {
    // In a real app, you'd implement cart functionality here
    // This could be using localStorage, cookies, or a server-side cart

    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
    })
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-20">
        <Input
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => setQuantity(Number.parseInt(e.target.value, 10))}
        />
      </div>
      <Button onClick={handleAddToCart} className="flex-1">
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { ShoppingCart, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    images: string[]
    stock: number
  }
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function AddToCartButton({ product, variant = "outline", size = "default", className }: AddToCartButtonProps) {
  const { addItem, state } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  // Check if product is already in cart
  const existingItem = state.items.find((item) => item.id === product.id)
  const isInCart = !!existingItem
  const canAddMore = !existingItem || existingItem.quantity < product.stock

  const handleAddToCart = () => {
    if (!canAddMore) {
      toast.error("Maximum quantity reached for this product")
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.svg",
      stock: product.stock,
    })

    setIsAdded(true)
    toast.success(`${product.name} added to cart!`)

    // Reset the success state after 2 seconds
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  if (product.stock <= 0) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        Out of Stock
      </Button>
    )
  }

  return (
    <Button variant={variant} size={size} onClick={handleAddToCart} disabled={!canAddMore} className={className}>
      {isAdded ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isInCart ? `Add More (${existingItem?.quantity} in cart)` : "Add to Cart"}
        </>
      )}
    </Button>
  )
}

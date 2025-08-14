"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"
import { CartModal } from "./cart-modal"

export function CartButton() {
  const { state } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="icon" className="relative rounded-xl" onClick={() => setIsCartOpen(true)}>
        <ShoppingCart className="h-5 w-5" />
        {state.totalItems > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {state.totalItems > 99 ? "99+" : state.totalItems}
          </Badge>
        )}
        <span className="sr-only">Shopping cart</span>
      </Button>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

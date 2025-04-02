"use client"

import type { Product } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface BuyNowButtonProps {
  product: Product
}

export function BuyNowButton({ product }: BuyNowButtonProps) {
  const router = useRouter()

  const handleBuyNow = () => {
    router.push(`/checkout?productId=${product.id}&quantity=1`)
  }

  return (
    <Button variant="outline" onClick={handleBuyNow} className="w-full">
      Buy Now
    </Button>
  )
}


"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductImageGalleryProps {
  images: string[]
  name: string
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-lg border">
        <Image src={images[selectedImage] || "/placeholder.svg"} alt={name} fill className="object-cover" priority />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border",
              selectedImage === index && "ring-2 ring-primary",
            )}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}


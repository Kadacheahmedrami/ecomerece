"use client"

import { useState } from "react"
import Image from "next/image"

interface ProductImageGalleryProps {
  images: string[]
  name: string
  selectedImage: number
  setSelectedImage: (index: number) => void
}

export function ProductImageGallery({ images, name, selectedImage }: ProductImageGalleryProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border">
      <div className="w-full h-0" style={{ paddingBottom: '80%' }}>
        <Image
          src={images[selectedImage] || '/placeholder.svg'}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
          priority
        />
      </div>
    </div>
  )
}

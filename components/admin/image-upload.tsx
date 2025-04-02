"use client"

import React, { useState, useCallback, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

interface UploadResponse {
  url?: string
  success?: boolean
  error?: string
  message?: string
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    const newImages = [...value]

    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 5MB limit.`,
            variant: "destructive",
          })
          continue;
        }

        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image.`,
            variant: "destructive",
          })
          continue;
        }

        const formData = new FormData()
        formData.append("file", file)

        console.log(`Uploading file: ${file.name}`)
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          let errorMessage = "Upload failed";
          try {
            const errorData: UploadResponse = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
          throw new Error(errorMessage);
        }

        let data: UploadResponse;
        try {
          data = await response.json();
          console.log("Upload response:", data);
        } catch (e) {
          console.error("Failed to parse response:", e);
          throw new Error("Invalid response from server");
        }
        
        if (data.url) {
          newImages.push(data.url);
          toast({
            title: "Image uploaded",
            description: "Image was uploaded successfully.",
          });
        } else {
          throw new Error(data.error || "No URL returned from server");
        }
      }

      onChange(newImages)
    } catch (error) {
      console.error("Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      setError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false)
      // Reset the input to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadFiles(e.target.files);
    }
  }

  const onRemove = (index: number) => {
    const newImages = [...value]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadFiles(files);
    }
  }, []);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image 
              src={url || "/placeholder.svg"} 
              alt={`Product image ${index + 1}`} 
              fill 
              className="object-cover" 
              onError={() => {
                // Handle image loading errors
                toast({
                  title: "Image Error",
                  description: "Failed to load image. It may have been deleted.",
                  variant: "destructive",
                });
                onRemove(index);
              }}
            />
          </div>
        ))}
        {value.length < 5 && (
          <div 
            className={`relative aspect-square rounded-md border ${isDragging ? 'border-primary border-2' : 'border-dashed'} flex flex-col items-center justify-center hover:bg-muted/30 transition cursor-pointer`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleButtonClick}
          >
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={disabled || isUploading}
              onChange={onUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center p-4 text-center">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : error ? (
                <AlertTriangle className="h-6 w-6 mb-2 text-destructive" />
              ) : (
                <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">
                {isUploading ? "Uploading..." : error ? "Upload Error" : isDragging ? "Drop images here" : "Click or drag images here"}
              </p>
              {error && <p className="text-xs text-destructive mt-1 max-w-full truncate">{error}</p>}
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Upload up to 5 images (max 5MB each). Recommended size: 1000x1000px.</p>
    </div>
  )
}


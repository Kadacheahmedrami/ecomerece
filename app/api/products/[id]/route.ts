import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Extract id from params before using it
    const { id } = params;
    
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// Interface matching the product form data
interface ProductData {
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  visible: boolean
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extract id from params before using it
    const { id } = params;
    
    console.log(`Product update API called for ID: ${id}`);
    
    // Check admin access
    const isAdmin = await checkAdminAccess()
    
    if (!isAdmin) {
      console.log("API Error: Unauthorized for product update");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Parse the request body
    const data: ProductData = await request.json()
    console.log("Updating product with data:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.name || !data.description || !data.category) {
      console.log("API Error: Missing required fields for update");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Update the product
    const product = await prisma.product.update({
      where: {
        id: id
      },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        images: data.images,
        category: data.category,
        stock: data.stock,
        visible: data.visible,
      }
    })
    
    console.log(`Product updated via API: ${product.id}`);
    
    // Revalidate paths
    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.id}`);
    revalidatePath("/products");
    
    return NextResponse.json({
      success: true,
      product,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Error updating product via API:", error);
    
    // Better error details
    let errorMessage = "Failed to update product";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Error name:", error.name);
      console.error("Error stack:", error.stack);
    }
    
    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      console.error("Prisma error code:", prismaError.code);
      console.error("Prisma error meta:", prismaError.meta);
      
      // Provide more specific error messages based on Prisma error codes
      if (prismaError.code === 'P2002') {
        errorMessage = "A product with this name already exists";
        statusCode = 409; // Conflict
      } else if (prismaError.code === 'P2025') {
        errorMessage = "Product not found";
        statusCode = 404; // Not Found
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: statusCode })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // First, get the product to get its image URLs
    const product = await prisma.product.findUnique({
      where: { id },
      select: { images: true }
    })

    if (!product) {
      return new Response('Product not found', { status: 404 })
    }

    // Delete images from Supabase storage
    for (const imageUrl of product.images) {
      try {
        console.log("===============================")
        console.log(imageUrl)
        console.log("===============================")
        // Extract filename from the URL
        const filename = imageUrl.split('/').pop()
        console.log(filename)
        
        if (!filename) {
          console.error('Could not extract filename from URL:', imageUrl)
          continue
        }

        const { error: deleteError } = await supabase
          .storage
          .from('ecommerce')
          .remove([`products/${filename}`])

        if (deleteError) {
          console.error('Error deleting image:', deleteError)
          console.error('Failed to delete:', filename)
        } else {
          console.log('Successfully deleted image:', filename)
        }
      } catch (imageError) {
        console.error('Error processing image:', imageError)
      }
    }

    // Delete OrderItems
    await prisma.orderItem.deleteMany({
      where: {
        productId: id
      }
    })

    // Delete the product
    const deletedProduct = await prisma.product.delete({
      where: {
        id: id
      }
    })

    return Response.json({
      success: true,
      message: 'Product and associated images deleted',
      deletedProduct
    })

  } catch (error) {
    console.error('Error in delete operation:', error)
    return new Response(JSON.stringify({
      error: 'Error deleting product and images',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}


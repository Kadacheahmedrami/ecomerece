import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

export async function POST(request: Request) {
  try {
    console.log("🚀 PRODUCT API: POST request received");
    
    // Check admin access
    console.log("🔒 PRODUCT API: Checking admin access");
    const isAdmin = await checkAdminAccess()
    console.log("🔒 PRODUCT API: Admin check result:", isAdmin);
    
    if (!isAdmin) {
      console.log("❌ PRODUCT API: Unauthorized - admin check failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Log the raw request for debugging
    const clone1 = request.clone();
    const bodyText = await clone1.text();
    console.log("📦 PRODUCT API: Raw request body:", bodyText);
    
    // Parse the request body from a fresh clone
    const clone2 = request.clone();
    let data: ProductData;
    try {
      data = await clone2.json();
      console.log("📋 PRODUCT API: Parsed body:", JSON.stringify(data, null, 2));
      console.log("💲 PRODUCT API: Price type:", typeof data.price, "value:", data.price);
      console.log("📦 PRODUCT API: Stock type:", typeof data.stock, "value:", data.stock);
      console.log("🖼️ PRODUCT API: Images type:", Array.isArray(data.images), "value:", data.images);
    } catch (parseError) {
      console.error("❌ PRODUCT API: Failed to parse request body:", parseError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }
    
    // Validate required fields
    console.log("✅ PRODUCT API: Validating fields");
    if (!data.name || !data.description || !data.category) {
      console.log("❌ PRODUCT API: Missing required fields");
      console.log("  - name:", data.name);
      console.log("  - description:", data.description);
      console.log("  - category:", data.category);
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Create the product
    console.log("⏳ PRODUCT API: Creating product in database");
    try {
      const product = await prisma.product.create({
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
      
      console.log(`✅ PRODUCT API: Product created with ID: ${product.id}`);
      console.log(`  Details: ${JSON.stringify(product, null, 2)}`);
      
      // Revalidate paths
      console.log("🔄 PRODUCT API: Revalidating paths");
      revalidatePath("/admin/products");
      revalidatePath("/products");
      
      return NextResponse.json({
        success: true,
        product,
        message: "Product created successfully",
      })
    } catch (dbError) {
      console.error("❌ PRODUCT API: Database error creating product:", dbError);
      if (dbError instanceof Error) {
        console.error("  - Error name:", dbError.name);
        console.error("  - Error message:", dbError.message);
        console.error("  - Error stack:", dbError.stack);
      }
      
      // Handle Prisma-specific errors
      if (dbError && typeof dbError === 'object' && 'code' in dbError) {
        const prismaError = dbError as any;
        console.error("  - Prisma error code:", prismaError.code);
        console.error("  - Prisma error meta:", prismaError.meta);
      }
      
      throw dbError; // Rethrow to be caught by outer catch
    }
  } catch (error) {
    console.error("❌ PRODUCT API: Error creating product:", error);
    
    // Better error details
    let errorMessage = "Failed to create product";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("  - Error name:", error.name);
      console.error("  - Error message:", error.message);
      console.error("  - Error stack:", error.stack);
    }
    
    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      console.error("  - Prisma error code:", prismaError.code);
      console.error("  - Prisma error meta:", prismaError.meta);
      
      // Provide more specific error messages based on Prisma error codes
      if (prismaError.code === 'P2002') {
        errorMessage = "A product with this name already exists";
        statusCode = 409; // Conflict
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: statusCode })
  }
}

export async function GET(request: Request) {
  try {
    // Parse URL parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    
    console.log("🔍 PRODUCT API: GET request with params:", {
      limit,
      category,
      search
    })

    // Build the where clause
    let whereClause: any = {
      visible: true,
    }

    // Add category filter
    if (category) {
      whereClause.category = {
        contains: category,
        mode: "insensitive"
      }
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          category: {
            contains: search,
            mode: "insensitive"
          }
        }
      ]
    }

    console.log("📋 PRODUCT API: Where clause:", JSON.stringify(whereClause, null, 2))

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    console.log(`✅ PRODUCT API: Found ${products.length} products`)

    return NextResponse.json(products)
  } catch (error) {
    console.error("❌ PRODUCT API: Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
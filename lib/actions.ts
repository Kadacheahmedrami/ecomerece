"use server"

import { prisma } from "./prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { checkAdminAccess } from "./auth"
import { addOrderToGoogleSheet, updateOrderInGoogleSheet } from "./google-sheets"
import { supabase } from "./supabase"
import { OrderStatus, DeliveryType } from "@prisma/client"

interface OrderData {
  customerName: string
  customerEmail: string
  city: string
  phone: string
  deliveryType?: DeliveryType
  items: {
    productId: string
    quantity: number
    price: number
  }[]
  subtotal: number
  deliveryFee: number
  total: number
}

export async function createOrder(data: OrderData) {
  // Only handle the first item for now - assuming single product orders
  const item = data.items[0]
  
  // Create the order with direct product relationship
  const order = await prisma.order.create({
    data: {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      city: data.city,
      phone: data.phone,
      deliveryType: data.deliveryType || 'HOME_DELIVERY',
      quantity: item.quantity,
      productId: item.productId,
      productPrice: item.price,
      deliveryFee: data.deliveryFee,
      total: data.total,
    },
    include: {
      product: true
    },
  })

  // Add order to Google Sheet
  await addOrderToGoogleSheet(order)

  return order.id
}

export async function updateProductAction(
  id: string,
  data: {
    name: string
    description: string
    price: number
    images: string[]
    category: string
    stock: number
    visible: boolean
  },
) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.product.update({
      where: {
        id,
      },
      data,
    })

    
    // More aggressive revalidation
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath(`/admin/products/${id}/edit`);
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(typeof error === 'string' ? error : 'Failed to update product');
  }
}

export async function createProductAction(data: {
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  visible: boolean
}) {
  try {
    
    const isAdmin = await checkAdminAccess()

    if (!isAdmin) {
      const error = "Unauthorized: Only admins can create products";
      console.error(error);
      throw new Error(error);
    }

    const product = await prisma.product.create({
      data,
    })

    
    // More aggressive revalidation
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    
    return { success: true, id: product.id };
  } catch (error) {
    console.error("Error creating product:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error type:", typeof error);
    }
    
    // If it's a Prisma error, log more details
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("Prisma error code:", (error as any).code);
      console.error("Prisma error meta:", (error as any).meta);
    }
    
    throw new Error(typeof error === 'string' ? error : error instanceof Error ? error.message : 'Failed to create product');
  }
}

export async function deleteProductAction(id: string) {
  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  try {
    // First, get the product to get its image URLs
    const product = await prisma.product.findUnique({
      where: { id },
      select: { images: true }
    })

    if (!product) {
      throw new Error("Product not found")
    }

    // Delete images from Supabase storage
    for (const imageUrl of product.images) {
      try {
        // Extract filename from the URL
        const filename = imageUrl.split('/').pop()
        if (!filename) {
          continue
        }

        const { error: deleteError } = await supabase
          .storage
          .from('ecommerce')
          .remove([`products/${filename}`])

        if (deleteError) {
        }
      } catch (imageError) {
      }
    }

    // Delete associated orders (optional)
    // If you want to keep order history, you might skip this step
    await prisma.order.deleteMany({
      where: {
        productId: id
      }
    })

    // Delete the product
    await prisma.product.delete({
      where: {
        id,
      },
    })
    
    
    // More aggressive revalidation
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(typeof error === 'string' ? error : 'Failed to delete product');
  }
}

export async function updateOrderStatusAction(id: string, status: OrderStatus) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  const order = await prisma.order.update({
    where: {
      id,
    },
    data: {
      status,
      updatedAt: new Date(),
    },
    include: {
      product: true
    },
  })

  // Update order in Google Sheet
  await updateOrderInGoogleSheet(order)

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${id}`)
}


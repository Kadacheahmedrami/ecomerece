import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkAdminAccess } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const city = await prisma.city.findUnique({
      where: { id }
    })
    
    if (!city) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(city)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch city" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdminAccess()
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { id } = params
    const data = await req.json()
    
    // Validate the data
    if (data.deliveryFee !== undefined && typeof data.deliveryFee !== 'number') {
      return NextResponse.json(
        { error: "Delivery fee must be a number" },
        { status: 400 }
      )
    }
    
    // Check if the city exists
    const existingCity = await prisma.city.findUnique({
      where: { id }
    })
    
    if (!existingCity) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      )
    }
    
    // Update the city
    const updatedCity = await prisma.city.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        deliveryFee: data.deliveryFee !== undefined ? data.deliveryFee : undefined
      }
    })
    
    return NextResponse.json(updatedCity)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update city" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdminAccess()
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { id } = params
    
    // Check if the city exists
    const city = await prisma.city.findUnique({
      where: { id }
    })
    
    if (!city) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      )
    }
    
    // Delete the city
    await prisma.city.delete({
      where: { id }
    })
    
    return NextResponse.json(
      { success: true, message: "City deleted successfully" }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete city" },
      { status: 500 }
    )
  }
} 
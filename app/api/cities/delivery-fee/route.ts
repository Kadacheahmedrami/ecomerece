import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cityName = searchParams.get('city')
    
    if (!cityName) {
      return NextResponse.json(
        { error: "City name is required" },
        { status: 400 }
      )
    }
    
    const city = await prisma.city.findUnique({
      where: { name: cityName }
    })
    
    if (!city) {
      return NextResponse.json(
        { deliveryFee: 10.0, note: "Default fee applied, city not found" },
        { status: 200 }
      )
    }
    
    return NextResponse.json({ deliveryFee: city.deliveryFee })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch delivery fee" },
      { status: 500 }
    )
  }
} 
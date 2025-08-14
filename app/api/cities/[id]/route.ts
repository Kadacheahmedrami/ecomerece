import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise in Next.js 15
    const { id } = await params
    
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
// app/api/admin/cities/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAccess } from '@/lib/auth'

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error('Cities fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdminAccess()
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { name, deliveryFee } = await req.json()
    
    if (!name || typeof deliveryFee !== 'number') {
      return NextResponse.json(
        { error: "Name and delivery fee are required" },
        { status: 400 }
      )
    }
    
    const city = await prisma.city.create({
      data: {
        name,
        deliveryFee
      }
    })
    
    return NextResponse.json(city)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create city" },
      { status: 500 }
    )
  }
} 
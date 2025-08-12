// app/api/admin/cities/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function POST(request: Request) {
  try {
    const { name, deliveryFee } = await request.json()

    const city = await prisma.city.create({
      data: {
        name,
        deliveryFee: parseFloat(deliveryFee)
      }
    })

    return NextResponse.json(city, { status: 201 })
  } catch (error) {
    console.error('City creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    )
  }
}
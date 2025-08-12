// app/api/admin/cities/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: { id: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const city = await prisma.city.findUnique({
      where: { id: params.id }
    })

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(city)
  } catch (error) {
    console.error('City fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch city' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { name, deliveryFee } = await request.json()

    const city = await prisma.city.update({
      where: { id: params.id },
      data: {
        name,
        deliveryFee: parseFloat(deliveryFee)
      }
    })

    return NextResponse.json(city)
  } catch (error) {
    console.error('City update error:', error)
    return NextResponse.json(
      { error: 'Failed to update city' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    // Check if city is used in orders
    const orderCount = await prisma.order.count({
      where: { city: params.id }
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete city with existing orders' },
        { status: 400 }
      )
    }

    await prisma.city.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('City deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete city' },
      { status: 500 }
    )
  }
}
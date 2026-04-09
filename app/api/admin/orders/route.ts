import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        customers: { select: { Name: true } },
        orderitems: {
          include: {
            products: { select: { Product_Name: true } },
          },
        },
      },
      orderBy: { Date_of_order: 'desc' },
      take: 500,
    })

    return NextResponse.json({ data: orders })
  } catch (error) {
    console.error('Admin orders API error:', error)
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}

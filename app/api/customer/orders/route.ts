import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const customerId = Number(request.nextUrl.searchParams.get('customerId'))

    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ error: 'Valid customerId is required' }, { status: 400 })
    }

    const orders = await prisma.orders.findMany({
      where: { CustomerNumber: customerId },
      include: {
        orderitems: {
          include: {
            products: {
              select: {
                Product_Name: true,
                SKU: true,
              },
            },
          },
        },
        delivery_log: true,
      },
      orderBy: { Date_of_order: 'desc' },
    })

    return NextResponse.json({ data: orders })
  } catch (error) {
    console.error('Customer orders API error:', error)
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}

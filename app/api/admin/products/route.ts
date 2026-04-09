import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      include: {
        _count: { select: { inventory: true, orderitems: true } },
      },
      orderBy: { CreatedAt: 'desc' },
      take: 500,
    })

    return NextResponse.json({ data: products })
  } catch (error) {
    console.error('Admin products API error:', error)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}

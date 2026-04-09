import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        products: { select: { Product_Name: true, SKU: true } },
        suppliers: { select: { CompanyName: true } },
      },
      orderBy: { UpdatedAt: 'desc' },
      take: 500,
    })

    return NextResponse.json({ data: inventory })
  } catch (error) {
    console.error('Admin inventory API error:', error)
    return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 })
  }
}

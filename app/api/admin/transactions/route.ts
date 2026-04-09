import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const transactions = await prisma.inventorytransactions.findMany({
      include: {
        inventory: {
          include: {
            products: { select: { Product_Name: true } },
            suppliers: { select: { CompanyName: true } },
          },
        },
      },
      orderBy: { TransactionDate: 'desc' },
      take: 500,
    })

    return NextResponse.json({ data: transactions })
  } catch (error) {
    console.error('Admin transactions API error:', error)
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 })
  }
}

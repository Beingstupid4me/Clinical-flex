import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supplierId = Number(request.nextUrl.searchParams.get('supplierId'))

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return NextResponse.json({ error: 'Valid supplierId is required' }, { status: 400 })
    }

    const transactions = await prisma.inventorytransactions.findMany({
      where: {
        inventory: {
          SupplierID: supplierId,
        },
        IsActive: true,
      },
      include: {
        inventory: {
          include: {
            products: {
              select: {
                Product_Name: true,
                SKU: true,
              },
            },
          },
        },
      },
      orderBy: { CreatedAt: 'desc' },
      take: 200,
    })

    return NextResponse.json({ data: transactions })
  } catch (error) {
    console.error('Supplier transactions API error:', error)
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 })
  }
}

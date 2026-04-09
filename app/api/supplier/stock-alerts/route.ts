import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supplierId = Number(request.nextUrl.searchParams.get('supplierId'))

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return NextResponse.json({ error: 'Valid supplierId is required' }, { status: 400 })
    }

    const inventoryRows = await prisma.inventory.findMany({
      where: {
        SupplierID: supplierId,
        IsActive: true,
      },
      include: {
        products: {
          select: {
            Product_Name: true,
            SKU: true,
          },
        },
      },
      orderBy: { Quantity_on_Hand: 'asc' },
    })

    const alerts = inventoryRows.filter((row) => row.Quantity_on_Hand <= (row.ReorderLevel ?? 0))

    return NextResponse.json({ data: alerts })
  } catch (error) {
    console.error('Supplier stock-alerts API error:', error)
    return NextResponse.json({ error: 'Failed to load stock alerts' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supplierId = Number(request.nextUrl.searchParams.get('supplierId'))

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return NextResponse.json({ error: 'Valid supplierId is required' }, { status: 400 })
    }

    const inventory = await prisma.inventory.findMany({
      where: {
        SupplierID: supplierId,
        IsActive: true,
      },
      include: {
        products: {
          select: {
            Product_Name: true,
            SKU: true,
            Manufacturer: true,
            Strength: true,
            DosageForm: true,
          },
        },
      },
      orderBy: { UpdatedAt: 'desc' },
    })

    return NextResponse.json({ data: inventory })
  } catch (error) {
    console.error('Supplier inventory API error:', error)
    return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 })
  }
}

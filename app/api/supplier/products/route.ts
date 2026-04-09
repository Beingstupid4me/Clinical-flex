import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      where: { IsActive: true },
      select: {
        ProductID: true,
        Product_Name: true,
        SKU: true,
        Manufacturer: true,
        Strength: true,
        DosageForm: true,
      },
      orderBy: { Product_Name: 'asc' },
    })

    return NextResponse.json({ data: products })
  } catch (error) {
    console.error('Supplier products API error:', error)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}

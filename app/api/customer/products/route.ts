import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const query = (request.nextUrl.searchParams.get('query') ?? '').trim()
    const type = request.nextUrl.searchParams.get('type') ?? 'ALL'

    const where: {
      IsActive?: boolean
      OR?: Array<{ Product_Name?: { contains: string }; SKU?: { contains: string } }>
      IsPrescriptionRequired?: boolean
    } = {
      IsActive: true,
    }

    if (query.length > 0) {
      where.OR = [
        { Product_Name: { contains: query } },
        { SKU: { contains: query } },
      ]
    }

    if (type === 'OTC') {
      where.IsPrescriptionRequired = false
    } else if (type === 'Prescription') {
      where.IsPrescriptionRequired = true
    }

    const products = await prisma.products.findMany({
      where,
      include: {
        inventory: {
          where: {
            IsActive: true,
            Quantity_on_Hand: { gt: 0 },
          },
          select: {
            Price: true,
            Quantity_on_Hand: true,
          },
        },
      },
      orderBy: { Product_Name: 'asc' },
      take: 100,
    })

    const normalized = products
      .map((product: any) => {
        const prices = product.inventory.map((i: any) => Number(i.Price))
        const totalStock = product.inventory.reduce((sum: number, row: any) => sum + row.Quantity_on_Hand, 0)

        return {
          ProductID: product.ProductID,
          Product_Name: product.Product_Name,
          SKU: product.SKU,
          Manufacturer: product.Manufacturer,
          Strength: product.Strength,
          DosageForm: product.DosageForm,
          IsPrescriptionRequired: Boolean(product.IsPrescriptionRequired),
          MinPrice: prices.length > 0 ? Math.min(...prices) : null,
          TotalStock: totalStock,
        }
      })
      .filter((product: any) => product.TotalStock > 0)

    return NextResponse.json({ data: normalized })
  } catch (error) {
    console.error('Customer products API error:', error)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}

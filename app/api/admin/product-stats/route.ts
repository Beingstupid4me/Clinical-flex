import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ProductStatsRow {
  ProductID: number
  Product_Name: string
  SKU: string | null
  AveragePrice: number
  TotalQuantity: number
  MostRecentExpiry: string | null
  UpdatedAt: string | null
}

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<ProductStatsRow[]>`
      SELECT
        p.ProductID,
        p.Product_Name,
        p.SKU,
        s.AveragePrice,
        s.TotalQuantity,
        s.MostRecentExpiry,
        s.UpdatedAt
      FROM ProductInventoryStats s
      INNER JOIN Products p ON p.ProductID = s.ProductID
      ORDER BY p.Product_Name ASC
    `

    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error('Admin product-stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to load product stats. Ensure triggers.sql has been executed on dbms_deadline.' },
      { status: 500 }
    )
  }
}

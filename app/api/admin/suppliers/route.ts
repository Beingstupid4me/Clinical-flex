import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const suppliers = await prisma.suppliers.findMany({
      include: {
        users: { select: { Email: true, IsActive: true } },
        _count: { select: { inventory: true, ratings: true } },
      },
      orderBy: { CreatedAt: 'desc' },
      take: 500,
    })

    return NextResponse.json({ data: suppliers })
  } catch (error) {
    console.error('Admin suppliers API error:', error)
    return NextResponse.json({ error: 'Failed to load suppliers' }, { status: 500 })
  }
}

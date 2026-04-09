import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.customers.findMany({
      include: {
        users: { select: { Email: true, IsActive: true } },
        _count: { select: { orders: true, prescription: true } },
      },
      orderBy: { CreatedAt: 'desc' },
      take: 500,
    })

    return NextResponse.json({ data: customers })
  } catch (error) {
    console.error('Admin customers API error:', error)
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 })
  }
}

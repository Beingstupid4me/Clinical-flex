import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const doctors = await prisma.doctors.findMany({
      include: {
        users: { select: { Email: true, IsActive: true } },
        _count: { select: { prescription: true } },
      },
      orderBy: { CreatedAt: 'desc' },
      take: 500,
    })

    return NextResponse.json({ data: doctors })
  } catch (error) {
    console.error('Admin doctors API error:', error)
    return NextResponse.json({ error: 'Failed to load doctors' }, { status: 500 })
  }
}

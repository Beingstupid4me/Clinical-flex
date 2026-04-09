import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      include: {
        customers: { select: { Name: true } },
        doctors: { select: { FirstName: true, LastName: true } },
        suppliers: { select: { CompanyName: true } },
      },
      orderBy: { CreatedAt: 'desc' },
      take: 500,
    })

    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}

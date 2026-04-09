import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const query = (request.nextUrl.searchParams.get('query') ?? '').trim()

    const where: any = { IsActive: true }
    if (query.length > 0) {
      where.OR = [
        { Name: { contains: query } },
        { users: { Email: { contains: query } } },
        { Phone: { contains: query } },
      ]
    }

    const patients = await prisma.customers.findMany({
      where,
      include: {
        users: {
          select: {
            Email: true,
          },
        },
        _count: {
          select: {
            orders: true,
            prescription: true,
          },
        },
      },
      orderBy: { Name: 'asc' },
      take: 100,
    })

    return NextResponse.json({ data: patients })
  } catch (error) {
    console.error('Doctor patients API error:', error)
    return NextResponse.json({ error: 'Failed to load patients' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId: customerIdParam } = await params
    const customerId = Number(customerIdParam)
    const body = await request.json()
    const isBanned = Boolean(body.isBanned)

    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ error: 'Valid customerId is required' }, { status: 400 })
    }

    const updated = await prisma.customers.update({
      where: { UserID: customerId },
      data: { isBanned },
      select: {
        UserID: true,
        Name: true,
        isBanned: true,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Admin update customer ban API error:', error)
    return NextResponse.json({ error: 'Failed to update customer ban status' }, { status: 500 })
  }
}

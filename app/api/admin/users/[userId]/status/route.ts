import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: userIdParam } = await params
    const userId = Number(userIdParam)
    const body = await request.json()
    const isActive = Boolean(body.isActive)

    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 })
    }

    const updated = await prisma.users.update({
      where: { UserID: userId },
      data: { IsActive: isActive },
      select: {
        UserID: true,
        Email: true,
        Role: true,
        IsActive: true,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Admin update user status API error:', error)
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }
}

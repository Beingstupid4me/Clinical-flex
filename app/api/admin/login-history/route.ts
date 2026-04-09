import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const history = await prisma.login_history.findMany({
      include: {
        users: { select: { Email: true, Role: true } },
      },
      orderBy: { DateTime_Attempt: 'desc' },
      take: 500,
    })

    return NextResponse.json({ data: history })
  } catch (error) {
    console.error('Admin login-history API error:', error)
    return NextResponse.json({ error: 'Failed to load login history' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        customers: { select: { Name: true } },
        doctors: { select: { FirstName: true, LastName: true } },
      },
      orderBy: { Date_of_Prescription: 'desc' },
      take: 500,
    })

    return NextResponse.json({ data: prescriptions })
  } catch (error) {
    console.error('Admin prescriptions API error:', error)
    return NextResponse.json({ error: 'Failed to load prescriptions' }, { status: 500 })
  }
}

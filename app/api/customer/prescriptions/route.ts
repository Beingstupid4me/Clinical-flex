import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const customerId = Number(request.nextUrl.searchParams.get('customerId'))

    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ error: 'Valid customerId is required' }, { status: 400 })
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        Patient_ID: customerId,
        IsActive: true,
      },
      include: {
        doctors: {
          select: {
            FirstName: true,
            LastName: true,
            Specialty: true,
          },
        },
      },
      orderBy: { Date_of_Prescription: 'desc' },
    })

    return NextResponse.json({ data: prescriptions })
  } catch (error) {
    console.error('Customer prescriptions API error:', error)
    return NextResponse.json({ error: 'Failed to load prescriptions' }, { status: 500 })
  }
}

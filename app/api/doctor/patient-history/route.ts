import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const patientId = Number(request.nextUrl.searchParams.get('patientId'))

    if (!Number.isFinite(patientId) || patientId <= 0) {
      return NextResponse.json({ error: 'Valid patientId is required' }, { status: 400 })
    }

    const patient = await prisma.customers.findUnique({
      where: { UserID: patientId },
      include: {
        users: {
          select: {
            Email: true,
          },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const [orders, prescriptions] = await Promise.all([
      prisma.orders.findMany({
        where: { CustomerNumber: patientId },
        include: {
          orderitems: {
            include: {
              products: {
                select: {
                  Product_Name: true,
                },
              },
            },
          },
          delivery_log: true,
        },
        orderBy: { Date_of_order: 'desc' },
      }),
      prisma.prescription.findMany({
        where: { Patient_ID: patientId },
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
      }),
    ])

    return NextResponse.json({
      data: {
        patient,
        orders,
        prescriptions,
      },
    })
  } catch (error) {
    console.error('Doctor patient-history API error:', error)
    return NextResponse.json({ error: 'Failed to load patient history' }, { status: 500 })
  }
}

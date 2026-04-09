import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const doctorId = Number(request.nextUrl.searchParams.get('doctorId'))

    if (!Number.isFinite(doctorId) || doctorId <= 0) {
      return NextResponse.json({ error: 'Valid doctorId is required' }, { status: 400 })
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        Doctor_ID: doctorId,
        IsActive: true,
      },
      include: {
        customers: {
          include: {
            users: {
              select: { Email: true },
            },
          },
        },
      },
      orderBy: { Date_of_Prescription: 'desc' },
    })

    return NextResponse.json({ data: prescriptions })
  } catch (error) {
    console.error('Doctor prescriptions API error:', error)
    return NextResponse.json({ error: 'Failed to load prescriptions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const doctorId = Number(body.doctorId)
    const patientId = Number(body.patientId)
    const refills = Number(body.refills ?? 0)

    if (!Number.isFinite(doctorId) || doctorId <= 0) {
      return NextResponse.json({ error: 'Valid doctorId is required' }, { status: 400 })
    }
    if (!Number.isFinite(patientId) || patientId <= 0) {
      return NextResponse.json({ error: 'Valid patientId is required' }, { status: 400 })
    }
    if (!body.drugName || !body.dosage || !body.expiryDate) {
      return NextResponse.json({ error: 'drugName, dosage, expiryDate are required' }, { status: 400 })
    }

    const doctor = await prisma.doctors.findUnique({ where: { UserID: doctorId } })
    const patient = await prisma.customers.findUnique({ where: { UserID: patientId } })

    if (!doctor || !doctor.IsActive) {
      return NextResponse.json({ error: 'Doctor is not active' }, { status: 403 })
    }

    if (!patient || !patient.IsActive) {
      return NextResponse.json({ error: 'Patient is not active' }, { status: 403 })
    }

    const prescription = await prisma.prescription.create({
      data: {
        Patient_ID: patientId,
        Doctor_ID: doctorId,
        Drug_Name: body.drugName,
        Dosage: body.dosage,
        ExpiryDate: new Date(body.expiryDate),
        Status: 'ACTIVE',
        RefillsRemaining: Number.isFinite(refills) ? refills : 0,
        IsActive: true,
      },
    })

    return NextResponse.json({
      message: 'Prescription created successfully',
      data: prescription,
    })
  } catch (error) {
    console.error('Doctor create prescription API error:', error)
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
  }
}

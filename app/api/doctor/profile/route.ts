import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const doctorId = Number(request.nextUrl.searchParams.get('doctorId'))

    if (!Number.isFinite(doctorId) || doctorId <= 0) {
      return NextResponse.json({ error: 'Valid doctorId is required' }, { status: 400 })
    }

    const doctor = await prisma.doctors.findUnique({
      where: { UserID: doctorId },
      include: {
        users: {
          select: {
            Email: true,
          },
        },
      },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        UserID: doctor.UserID,
        FirstName: doctor.FirstName,
        LastName: doctor.LastName,
        Specialty: doctor.Specialty,
        LicenseNumber: doctor.LicenseNumber,
        Phone: doctor.Phone,
        Email: doctor.users.Email,
      },
    })
  } catch (error) {
    console.error('Doctor profile API error:', error)
    return NextResponse.json({ error: 'Failed to load doctor profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const doctorId = Number(body.doctorId)

    if (!Number.isFinite(doctorId) || doctorId <= 0) {
      return NextResponse.json({ error: 'Valid doctorId is required' }, { status: 400 })
    }

    const updated = await prisma.doctors.update({
      where: { UserID: doctorId },
      data: {
        FirstName: body.firstName ?? undefined,
        LastName: body.lastName ?? undefined,
        Specialty: body.specialty ?? undefined,
        Phone: body.phone ?? undefined,
      },
      include: {
        users: {
          select: {
            Email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Doctor profile updated',
      data: {
        UserID: updated.UserID,
        FirstName: updated.FirstName,
        LastName: updated.LastName,
        Specialty: updated.Specialty,
        LicenseNumber: updated.LicenseNumber,
        Phone: updated.Phone,
        Email: updated.users.Email,
      },
    })
  } catch (error) {
    console.error('Doctor profile update API error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

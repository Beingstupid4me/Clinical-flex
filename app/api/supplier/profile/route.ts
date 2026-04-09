import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supplierId = Number(request.nextUrl.searchParams.get('supplierId'))

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return NextResponse.json({ error: 'Valid supplierId is required' }, { status: 400 })
    }

    const supplier = await prisma.suppliers.findUnique({
      where: { UserID: supplierId },
      include: {
        users: {
          select: {
            Email: true,
          },
        },
      },
    })

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        UserID: supplier.UserID,
        CompanyName: supplier.CompanyName,
        ContactPerson: supplier.ContactPerson,
        Phone: supplier.Phone,
        Address: supplier.Address,
        Email: supplier.users.Email,
      },
    })
  } catch (error) {
    console.error('Supplier profile API error:', error)
    return NextResponse.json({ error: 'Failed to load supplier profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supplierId = Number(body.supplierId)

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return NextResponse.json({ error: 'Valid supplierId is required' }, { status: 400 })
    }

    const updated = await prisma.suppliers.update({
      where: { UserID: supplierId },
      data: {
        CompanyName: body.companyName ?? undefined,
        ContactPerson: body.contactPerson ?? undefined,
        Phone: body.phone ?? undefined,
        Address: body.address ?? undefined,
      },
      include: {
        users: {
          select: { Email: true },
        },
      },
    })

    return NextResponse.json({
      message: 'Supplier profile updated',
      data: {
        UserID: updated.UserID,
        CompanyName: updated.CompanyName,
        ContactPerson: updated.ContactPerson,
        Phone: updated.Phone,
        Address: updated.Address,
        Email: updated.users.Email,
      },
    })
  } catch (error) {
    console.error('Supplier profile update API error:', error)
    return NextResponse.json({ error: 'Failed to update supplier profile' }, { status: 500 })
  }
}

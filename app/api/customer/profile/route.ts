import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const customerId = Number(request.nextUrl.searchParams.get('customerId'))

    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ error: 'Valid customerId is required' }, { status: 400 })
    }

    const customer = await prisma.customers.findUnique({
      where: { UserID: customerId },
      include: {
        users: {
          select: {
            Email: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        UserID: customer.UserID,
        Name: customer.Name,
        Email: customer.users.Email,
        Phone: customer.Phone,
        City: customer.City,
        AddressLine1: customer.AddressLine1,
      },
    })
  } catch (error) {
    console.error('Customer profile API error:', error)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const customerId = Number(body.customerId)

    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ error: 'Valid customerId is required' }, { status: 400 })
    }

    const updated = await prisma.customers.update({
      where: { UserID: customerId },
      data: {
        Name: body.name ?? undefined,
        Phone: body.phone ?? undefined,
        City: body.city ?? undefined,
        AddressLine1: body.address ?? undefined,
      },
      include: {
        users: {
          select: { Email: true },
        },
      },
    })

    return NextResponse.json({
      message: 'Profile updated',
      data: {
        UserID: updated.UserID,
        Name: updated.Name,
        Email: updated.users.Email,
        Phone: updated.Phone,
        City: updated.City,
        AddressLine1: updated.AddressLine1,
      },
    })
  } catch (error) {
    console.error('Customer profile update API error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

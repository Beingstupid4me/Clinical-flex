import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      licenseNumber,
      companyName,
    } = await request.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { Email: email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex')

    // Create user
    const user = await prisma.users.create({
      data: {
        Email: email,
        PasswordHash: hashedPassword,
        Role: role.toUpperCase() as any,
        IsActive: true,
      },
    })

    // Create role-specific record
    if (role === 'CUSTOMER') {
      await prisma.customers.create({
        data: {
          UserID: user.UserID,
          Name: name,
          Phone: phone || null,
          AddressLine1: address || null,
          isBanned: false,
          IsActive: true,
        },
      })
    } else if (role === 'DOCTOR') {
      await prisma.doctors.create({
        data: {
          UserID: user.UserID,
          FirstName: name.split(' ')[0],
          LastName: name.split(' ').slice(1).join(' ') || null,
          LicenseNumber: licenseNumber || `LIC-${user.UserID}`,
          Phone: phone || null,
          IsActive: true,
        },
      })
    } else if (role === 'SUPPLIER') {
      await prisma.suppliers.create({
        data: {
          UserID: user.UserID,
          CompanyName: companyName || name,
          Address: address || null,
          Phone: phone || null,
          ContactPerson: name,
          IsActive: true,
        },
      })
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          UserID: user.UserID,
          Email: user.Email,
          Role: user.Role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

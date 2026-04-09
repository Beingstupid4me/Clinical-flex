import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const DEV_ADMIN_EMAIL = 'admin@local.test'
const DEV_ADMIN_PASSWORD = 'admin123'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const normalizedEmail = String(email || '').trim().toLowerCase()

    // Development bypass admin login that does not require DB records.
    if (normalizedEmail === DEV_ADMIN_EMAIL && password === DEV_ADMIN_PASSWORD) {
      return NextResponse.json({
        user: {
          UserID: -999,
          Email: DEV_ADMIN_EMAIL,
          Role: 'ADMIN',
        },
      })
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { Email: normalizedEmail },
      select: {
        UserID: true,
        Email: true,
        PasswordHash: true,
        Role: true,
        IsActive: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.IsActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      )
    }

    // Simple password check (in production: use bcrypt)
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex')

    if (user.PasswordHash !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Log the login event
    await prisma.login_history.create({
      data: {
        UserID: user.UserID,
        DateTime_Attempt: new Date(),
      },
    })

    // Return user info (without password)
    return NextResponse.json({
      user: {
        UserID: user.UserID,
        Email: user.Email,
        Role: user.Role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

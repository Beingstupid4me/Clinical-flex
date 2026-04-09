import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ORDER_STATUS = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
const PAYMENT_STATUS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId: orderIdParam } = await params
    const orderId = Number(orderIdParam)
    const body = await request.json()

    if (!Number.isFinite(orderId) || orderId <= 0) {
      return NextResponse.json({ error: 'Valid orderId is required' }, { status: 400 })
    }

    const status = String(body.status ?? '').toUpperCase()
    const paymentStatus = String(body.paymentStatus ?? '').toUpperCase()

    if (!ORDER_STATUS.includes(status as (typeof ORDER_STATUS)[number])) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
    }

    if (!PAYMENT_STATUS.includes(paymentStatus as (typeof PAYMENT_STATUS)[number])) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    const updated = await prisma.orders.update({
      where: { OrderID: orderId },
      data: {
        Status: status as 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
        PaymentStatus: paymentStatus as 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED',
      },
      select: {
        OrderID: true,
        Status: true,
        PaymentStatus: true,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Admin update order status API error:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}

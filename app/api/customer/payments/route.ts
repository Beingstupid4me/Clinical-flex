import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const customerId = Number(request.nextUrl.searchParams.get('customerId'))

    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ error: 'Valid customerId is required' }, { status: 400 })
    }

    const orders = await prisma.orders.findMany({
      where: { CustomerNumber: customerId },
      select: {
        OrderID: true,
        TotalAmount: true,
        PaymentStatus: true,
        PaymentDate: true,
        Date_of_order: true,
      },
      orderBy: { Date_of_order: 'desc' },
    })

    const normalized = orders.map((row: any) => ({
      PaymentID: `PAY-${row.OrderID}`,
      OrderID: row.OrderID,
      Amount: Number(row.TotalAmount),
      PaymentStatus: row.PaymentStatus,
      PaymentDate: row.PaymentDate,
      OrderDate: row.Date_of_order,
      PaymentMethod: 'N/A',
    }))

    const summary = normalized.reduce(
      (acc: any, row: any) => {
        if (row.PaymentStatus === 'PAID') {
          acc.totalPaid += row.Amount
        }
        if (row.PaymentStatus === 'PENDING') {
          acc.pending += row.Amount
        }
        acc.transactions += 1
        return acc
      },
      { totalPaid: 0, pending: 0, transactions: 0 }
    )

    return NextResponse.json({ data: normalized, summary })
  } catch (error) {
    console.error('Customer payments API error:', error)
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 })
  }
}

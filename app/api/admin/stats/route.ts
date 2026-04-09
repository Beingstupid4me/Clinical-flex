import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalDoctors,
      totalSuppliers,
      totalProducts,
      totalOrders,
      totalPrescriptions,
      totalDeliveries,
      pendingOrders,
      paidOrders,
      totalOrderValue,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.customers.count(),
      prisma.doctors.count(),
      prisma.suppliers.count(),
      prisma.products.count(),
      prisma.orders.count(),
      prisma.prescription.count(),
      prisma.delivery_log.count(),
      prisma.orders.count({ where: { Status: 'PENDING' } }),
      prisma.orders.count({ where: { PaymentStatus: 'PAID' } }),
      prisma.orders.aggregate({ _sum: { TotalAmount: true }, where: { PaymentStatus: 'PAID' } }),
    ])

    return NextResponse.json({
      data: {
        totalUsers,
        totalCustomers,
        totalDoctors,
        totalSuppliers,
        totalProducts,
        totalOrders,
        totalPrescriptions,
        totalDeliveries,
        pendingOrders,
        paidOrders,
        totalOrderValue: Number(totalOrderValue._sum.TotalAmount || 0),
      },
    })
  } catch (error) {
    console.error('Admin stats API error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}

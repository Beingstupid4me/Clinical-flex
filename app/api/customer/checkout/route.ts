import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CheckoutItem {
  productId: number
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const customerId = Number(body.customerId)
    const items = Array.isArray(body.items) ? (body.items as CheckoutItem[]) : []

    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ error: 'Valid customerId is required' }, { status: 400 })
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const customer = await prisma.customers.findUnique({ where: { UserID: customerId } })
    if (!customer || !customer.IsActive) {
      return NextResponse.json({ error: 'Customer is not active' }, { status: 403 })
    }

    if (customer.isBanned) {
      return NextResponse.json({ error: 'Customer is banned from ordering' }, { status: 403 })
    }

    const result = await prisma.$transaction(async (tx: any) => {
      let totalAmount = 0
      let prescriptionId: number | null = null

      const preparedItems: Array<{
        productId: number
        quantity: number
        invId: number
        unitPrice: number
      }> = []

      for (const item of items) {
        const product = await tx.products.findUnique({ where: { ProductID: item.productId } })

        if (!product || !product.IsActive) {
          throw new Error(`Product ${item.productId} is unavailable`)
        }

        if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
          throw new Error(`Invalid quantity for product ${item.productId}`)
        }

        const inventoryRow = await tx.inventory.findFirst({
          where: {
            ProductID: item.productId,
            IsActive: true,
            Quantity_on_Hand: { gte: item.quantity },
          },
          orderBy: { ExpiryDate: 'asc' },
        })

        if (!inventoryRow) {
          throw new Error(`Insufficient stock for ${product.Product_Name}`)
        }

        if (product.IsPrescriptionRequired) {
          const drugToken = product.Product_Name.split(' ')[0]
          const rx = await tx.prescription.findFirst({
            where: {
              Patient_ID: customerId,
              IsActive: true,
              Status: 'ACTIVE',
              ExpiryDate: { gte: new Date() },
              OR: [
                { Drug_Name: { contains: product.Product_Name } },
                { Drug_Name: { contains: drugToken } },
              ],
            },
            orderBy: { ExpiryDate: 'desc' },
          })

          if (!rx) {
            throw new Error(`Active prescription required for ${product.Product_Name}`)
          }

          prescriptionId = prescriptionId ?? rx.Prescription_No
        }

        const unitPrice = Number(inventoryRow.Price)
        totalAmount += unitPrice * item.quantity

        preparedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          invId: inventoryRow.Inv_ID,
          unitPrice,
        })
      }

      const order = await tx.orders.create({
        data: {
          CustomerNumber: customerId,
          Prescription_ID: prescriptionId,
          TotalAmount: totalAmount,
          Status: 'PENDING',
          PaymentStatus: 'PENDING',
          IsActive: true,
        },
      })

      for (const item of preparedItems) {
        await tx.orderitems.create({
          data: {
            OrderID: order.OrderID,
            ProductID: item.productId,
            Quantity: item.quantity,
            PriceAtPurchase: item.unitPrice,
            IsActive: true,
          },
        })

        await tx.inventory.update({
          where: { Inv_ID: item.invId },
          data: {
            Quantity_on_Hand: { decrement: item.quantity },
          },
        })

        await tx.inventorytransactions.create({
          data: {
            Inv_ID: item.invId,
            TransactionType: 'SALE',
            Quantity: item.quantity,
            Reason: `Order ${order.OrderID}`,
            ReferenceID: order.OrderID,
            IsActive: true,
          },
        })
      }

      await tx.delivery_log.create({
        data: {
          OrderID: order.OrderID,
          Date_of_shipment: new Date(),
          DeliveryStatus: 'PENDING',
          DeliveryAttempts: 0,
          IsActive: true,
        },
      })

      return {
        orderId: order.OrderID,
        totalAmount,
      }
    })

    return NextResponse.json({
      message: 'Order placed successfully',
      data: result,
    })
  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to place order',
      },
      { status: 500 }
    )
  }
}

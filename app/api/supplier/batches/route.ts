import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supplierId = Number(request.nextUrl.searchParams.get('supplierId'))

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return NextResponse.json({ error: 'Valid supplierId is required' }, { status: 400 })
    }

    const batches = await prisma.inventorybatches.findMany({
      where: {
        inventory: {
          SupplierID: supplierId,
        },
        IsActive: true,
      },
      include: {
        inventory: {
          include: {
            products: {
              select: {
                Product_Name: true,
                SKU: true,
              },
            },
          },
        },
      },
      orderBy: { CreatedAt: 'desc' },
    })

    return NextResponse.json({ data: batches })
  } catch (error) {
    console.error('Supplier batches API error:', error)
    return NextResponse.json({ error: 'Failed to load batches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supplierId = Number(body.supplierId)
    const productId = Number(body.productId)
    const quantity = Number(body.quantity)
    const unitPrice = Number(body.unitPrice ?? body.purchasePrice)
    const manufacturerDate = body.manufacturerDate ?? body.manufactureDate

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return NextResponse.json({ error: 'Valid supplierId is required' }, { status: 400 })
    }
    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ error: 'Valid productId is required' }, { status: 400 })
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 })
    }
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return NextResponse.json({ error: 'Unit price must be greater than 0' }, { status: 400 })
    }
    if (!body.batchNumber || !manufacturerDate || !body.expiryDate) {
      return NextResponse.json({ error: 'batchNumber, manufacturerDate, expiryDate are required' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx: any) => {
      let inventory = await tx.inventory.findFirst({
        where: {
          ProductID: productId,
          SupplierID: supplierId,
        },
      })

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            ProductID: productId,
            SupplierID: supplierId,
            Quantity_on_Hand: 0,
            Price: unitPrice,
            ExpiryDate: new Date(body.expiryDate),
            IsActive: true,
          },
        })
      }

      const batch = await tx.inventorybatches.create({
        data: {
          Inv_ID: inventory.Inv_ID,
          BatchNumber: body.batchNumber,
          ManufacturerDate: new Date(manufacturerDate),
          QuantityReceived: quantity,
          QuantityAvailable: quantity,
          IsActive: true,
        },
      })

      await tx.inventory.update({
        where: { Inv_ID: inventory.Inv_ID },
        data: {
          Quantity_on_Hand: { increment: quantity },
          Price: unitPrice,
          ExpiryDate: new Date(body.expiryDate),
        },
      })

      await tx.inventorytransactions.create({
        data: {
          Inv_ID: inventory.Inv_ID,
          TransactionType: 'RECEIPT',
          Quantity: quantity,
          Reason: `Batch ${body.batchNumber} received`,
          ReferenceID: batch.BatchID,
          IsActive: true,
        },
      })

      return {
        batchId: batch.BatchID,
        invId: inventory.Inv_ID,
      }
    })

    return NextResponse.json({
      message: 'Batch added successfully',
      data: result,
    })
  } catch (error) {
    console.error('Supplier add batch API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add batch' },
      { status: 500 }
    )
  }
}

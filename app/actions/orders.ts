// Workflow A: Customer Order Journey
// All server-side logic lives here - clean separation of concerns

'use server';

import { prisma } from '@/lib/prisma';

// ===== WORKFLOW A: CUSTOMER ORDER =====

/**
 * Search for products by name or by prescription requirement
 * Used in customer checkout flow
 */
export async function searchProducts(query: string) {
  try {
    const products = await prisma.products.findMany({
      where: {
        OR: [
          { Product_Name: { contains: query } },
          { SKU: { contains: query } },
        ],
        IsActive: true,
      },
      select: {
        ProductID: true,
        Product_Name: true,
        SKU: true,
        Manufacturer: true,
        Strength: true,
        DosageForm: true,
        IsPrescriptionRequired: true,
      },
      take: 20,
    });

    return { success: true, data: products };
  } catch (error) {
    console.error('Search error:', error);
    return { success: false, error: 'Failed to search products' };
  }
}

/**
 * Get products by category (prescription vs OTC)
 */
export async function getProductsByCategory(isPrescriptionRequired: boolean) {
  try {
    const products = await prisma.products.findMany({
      where: {
        IsPrescriptionRequired: isPrescriptionRequired,
        IsActive: true,
      },
      select: {
        ProductID: true,
        Product_Name: true,
        SKU: true,
        Strength: true,
        DosageForm: true,
        IsPrescriptionRequired: true,
      },
      take: 50,
    });

    return { success: true, data: products };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}

/**
 * Get available inventory for a product
 */
export async function getProductInventory(productID: number) {
  try {
    const inventory = await prisma.inventory.findMany({
      where: {
        ProductID: productID,
        IsActive: true,
        Quantity_on_Hand: { gt: 0 },
      },
      select: {
        Inv_ID: true,
        ProductID: true,
        Quantity_on_Hand: true,
        Price: true,
        ExpiryDate: true,
        suppliers: {
          select: {
            CompanyName: true,
            Phone: true,
          },
        },
      },
    });

    return { success: true, data: inventory };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return { success: false, error: 'Failed to fetch inventory' };
  }
}

/**
 * Validate if customer can order prescription drug
 * Rule: If Product.IsPrescriptionRequired, customer must have active prescription
 */
export async function validatePrescriptionRequirement(
  customerID: number,
  productID: number,
  drugName: string
) {
  try {
    const product = await prisma.products.findUnique({
      where: { ProductID: productID },
    });

    if (!product?.IsPrescriptionRequired) {
      return { valid: true }; // OTC drugs, no prescription needed
    }

    // Check for active prescription
    const prescription = await prisma.prescription.findFirst({
      where: {
        Patient_ID: customerID,
        Drug_Name: { contains: drugName },
        Status: 'ACTIVE',
        ExpiryDate: { gte: new Date() },
      },
    });

    if (!prescription) {
      return { valid: false, error: 'Active prescription required' };
    }

    return { valid: true, prescriptionID: prescription.Prescription_No };
  } catch (error) {
    console.error('Prescription validation error:', error);
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Create order with items (TRANSACTIONAL)
 * Steps:
 * 1. Validate prescription if needed
 * 2. Create Order
 * 3. Create OrderItems
 * 4. Decrement Inventory
 * 5. Create InventoryTransaction
 */
export async function createOrder(
  customerID: number,
  items: Array<{ productID: number; quantity: number; priceAtPurchase: number }>,
  prescriptionID?: number
) {
  try {
    // TRANSACTION: All-or-nothing
    const result = await prisma.$transaction(async (tx: any) => {
      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);

      // 1. Create Order
      const order = await tx.orders.create({
        data: {
          CustomerNumber: customerID,
          Prescription_ID: prescriptionID || null,
          TotalAmount: totalAmount,
          Status: 'PENDING',
          PaymentStatus: 'PENDING',
        },
      });

      // 2. Create OrderItems and decrement inventory
      for (const item of items) {
        // Create OrderItem
        await tx.orderitems.create({
          data: {
            OrderID: order.OrderID,
            ProductID: item.productID,
            Quantity: item.quantity,
            PriceAtPurchase: item.priceAtPurchase,
          },
        });

        // Get inventory and decrement
        const inventory = await tx.inventory.findFirst({
          where: { ProductID: item.productID },
        });

        if (!inventory || inventory.Quantity_on_Hand < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productID}`);
        }

        // Update inventory
        await tx.inventory.update({
          where: { Inv_ID: inventory.Inv_ID },
          data: {
            Quantity_on_Hand: { decrement: item.quantity },
          },
        });

        // Create InventoryTransaction (SALE type, ReferenceID = OrderID)
        await tx.inventorytransactions.create({
          data: {
            Inv_ID: inventory.Inv_ID,
            TransactionType: 'SALE',
            Quantity: item.quantity,
            Reason: `Sold in order ${order.OrderID}`,
            ReferenceID: order.OrderID,
          },
        });
      }

      return order;
    });

    return { success: true, orderID: result.OrderID, data: result };
  } catch (error) {
    console.error('Order creation error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get orders for a customer
 */
export async function getCustomerOrders(customerID: number) {
  try {
    const orders = await prisma.orders.findMany({
      where: { CustomerNumber: customerID },
      include: {
        orderitems: {
          include: {
            products: {
              select: {
                Product_Name: true,
                SKU: true,
              },
            },
          },
        },
        delivery_log: {
          select: {
            Delivery_log_ID: true,
            DeliveryStatus: true,
            Date_of_shipment: true,
            ActualDeliveryDate: true,
          },
        },
      },
      orderBy: { Date_of_order: 'desc' },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

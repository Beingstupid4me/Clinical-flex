// Workflow B: Supplier Restock Journey
// Workflow C: Doctor Prescription Journey

'use server';

import { prisma } from '@/lib/prisma';

// ===== WORKFLOW B: SUPPLIER RESTOCK =====

/**
 * Get supplier's current inventory
 */
export async function getSupplierInventory(supplierID: number) {
  try {
    const inventory = await prisma.inventory.findMany({
      where: { SupplierID: supplierID },
      include: {
        products: {
          select: {
            Product_Name: true,
            SKU: true,
            Manufacturer: true,
            Strength: true,
          },
        },
        inventorybatches: {
          select: {
            BatchID: true,
            BatchNumber: true,
            QuantityAvailable: true,
            ManufacturerDate: true,
          },
        },
      },
    });

    return { success: true, data: inventory };
  } catch (error) {
    console.error('Error fetching supplier inventory:', error);
    return { success: false, error: 'Failed to fetch inventory' };
  }
}

/**
 * Add new inventory batch (TRANSACTIONAL)
 * Steps:
 * 1. Create/update Inventory record
 * 2. Create InventoryBatch
 * 3. Create InventoryTransaction (RECEIPT type)
 */
export async function addInventoryBatch(
  supplierID: number,
  productID: number,
  batchNumber: string,
  quantityReceived: number,
  price: number,
  expiryDate: string,
  manufacturerDate: string
) {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Find or create Inventory record
      let inventory = await tx.inventory.findFirst({
        where: {
          ProductID: productID,
          SupplierID: supplierID,
        },
      });

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            ProductID: productID,
            SupplierID: supplierID,
            Quantity_on_Hand: 0,
            Price: price,
            ExpiryDate: new Date(expiryDate),
          },
        });
      }

      // 2. Create InventoryBatch
      const batch = await tx.inventorybatches.create({
        data: {
          Inv_ID: inventory.Inv_ID,
          BatchNumber: batchNumber,
          QuantityReceived: quantityReceived,
          QuantityAvailable: quantityReceived,
          ManufacturerDate: new Date(manufacturerDate),
        },
      });

      // 3. Update inventory quantity
      await tx.inventory.update({
        where: { Inv_ID: inventory.Inv_ID },
        data: {
          Quantity_on_Hand: { increment: quantityReceived },
          Price: price, // Update price if changed
        },
      });

      // 4. Create InventoryTransaction (RECEIPT type, ReferenceID = BatchID)
      await tx.inventorytransactions.create({
        data: {
          Inv_ID: inventory.Inv_ID,
          TransactionType: 'RECEIPT',
          Quantity: quantityReceived,
          Reason: `Received batch ${batchNumber}`,
          ReferenceID: batch.BatchID,
        },
      });

      return batch;
    });

    return { success: true, batchID: result.BatchID, data: result };
  } catch (error) {
    console.error('Error adding inventory batch:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get all products (for supplier to add to inventory)
 */
export async function getAllProducts() {
  try {
    const products = await prisma.products.findMany({
      where: { IsActive: true },
      select: {
        ProductID: true,
        Product_Name: true,
        SKU: true,
        Manufacturer: true,
        Strength: true,
        DosageForm: true,
      },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}

// ===== WORKFLOW C: DOCTOR PRESCRIPTION =====

/**
 * Search customers by email or name
 * Used by doctor when creating prescription
 */
export async function searchCustomers(query: string) {
  try {
    const customers = await prisma.customers.findMany({
      where: {
        OR: [
          { users: { Email: { contains: query } } },
          { Name: { contains: query } },
        ],
        IsActive: true,
      },
      include: {
        users: {
          select: { Email: true },
        },
      },
      take: 10,
    });

    return { success: true, data: customers };
  } catch (error) {
    console.error('Error searching customers:', error);
    return { success: false, error: 'Failed to search customers' };
  }
}

/**
 * Create prescription
 * Simple insert - no complex validation needed
 */
export async function createPrescription(
  patientID: number,
  doctorID: number,
  drugName: string,
  dosage: string,
  expiryDate: string,
  refillsRemaining: number = 0
) {
  try {
    const prescription = await prisma.prescription.create({
      data: {
        Patient_ID: patientID,
        Doctor_ID: doctorID,
        Drug_Name: drugName,
        Dosage: dosage,
        ExpiryDate: new Date(expiryDate),
        Status: 'ACTIVE',
        RefillsRemaining: refillsRemaining,
      },
    });

    return { success: true, prescriptionID: prescription.Prescription_No, data: prescription };
  } catch (error) {
    console.error('Error creating prescription:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get doctor's prescriptions
 */
export async function getDoctorPrescriptions(doctorID: number) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { Doctor_ID: doctorID },
      include: {
        customers: {
          select: {
            Name: true,
            users: { select: { Email: true } },
          },
        },
      },
      orderBy: { Date_of_Prescription: 'desc' },
    });

    return { success: true, data: prescriptions };
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return { success: false, error: 'Failed to fetch prescriptions' };
  }
}

/**
 * Get patient prescriptions
 */
export async function getPatientPrescriptions(patientID: number) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { Patient_ID: patientID },
      include: {
        doctors: {
          select: {
            FirstName: true,
            LastName: true,
            Specialty: true,
          },
        },
      },
      orderBy: { Date_of_Prescription: 'desc' },
    });

    return { success: true, data: prescriptions };
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return { success: false, error: 'Failed to fetch prescriptions' };
  }
}

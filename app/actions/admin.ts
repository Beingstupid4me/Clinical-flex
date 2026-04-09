// Workflow D: Admin Management
// "God View" - Admin can see/edit ALL tables without MySQL Workbench

'use server';

import { prisma } from '@/lib/prisma';

// ===== WORKFLOW D: ADMIN GOD VIEW =====

/**
 * Get all users with their role associations
 */
export async function getAllUsers() {
  try {
    const users = await prisma.users.findMany({
      include: {
        customers: { select: { Name: true } },
        doctors: { select: { FirstName: true, LastName: true } },
        suppliers: { select: { CompanyName: true } },
      },
      orderBy: { CreatedAt: 'desc' },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

/**
 * Get all customers
 */
export async function getAllCustomers() {
  try {
    const customers = await prisma.customers.findMany({
      include: { users: { select: { Email: true, IsActive: true } } },
      orderBy: { CreatedAt: 'desc' },
    });

    return { success: true, data: customers };
  } catch (error) {
    return { success: false, error: 'Failed to fetch customers' };
  }
}

/**
 * Get all doctors
 */
export async function getAllDoctors() {
  try {
    const doctors = await prisma.doctors.findMany({
      include: { users: { select: { Email: true, IsActive: true } } },
      orderBy: { CreatedAt: 'desc' },
    });

    return { success: true, data: doctors };
  } catch (error) {
    return { success: false, error: 'Failed to fetch doctors' };
  }
}

/**
 * Get all suppliers
 */
export async function getAllSuppliers() {
  try {
    const suppliers = await prisma.suppliers.findMany({
      include: { users: { select: { Email: true, IsActive: true } } },
      orderBy: { CreatedAt: 'desc' },
    });

    return { success: true, data: suppliers };
  } catch (error) {
    return { success: false, error: 'Failed to fetch suppliers' };
  }
}

/**
 * Get all products
 */
export async function getAllProducts() {
  try {
    const products = await prisma.products.findMany({
      orderBy: { CreatedAt: 'desc' },
    });

    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: 'Failed to fetch products' };
  }
}

/**
 * Get all inventory
 */
export async function getAllInventory() {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        products: { select: { Product_Name: true, SKU: true } },
        suppliers: { select: { CompanyName: true } },
      },
      orderBy: { CreatedAt: 'desc' },
    });

    return { success: true, data: inventory };
  } catch (error) {
    return { success: false, error: 'Failed to fetch inventory' };
  }
}

/**
 * Get all orders
 */
export async function getAllOrders() {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        customers: { select: { Name: true } },
        orderitems: { include: { products: { select: { Product_Name: true } } } },
      },
      orderBy: { Date_of_order: 'desc' },
    });

    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: 'Failed to fetch orders' };
  }
}

/**
 * Get all prescriptions
 */
export async function getAllPrescriptions() {
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        customers: { select: { Name: true } },
        doctors: { select: { FirstName: true, LastName: true } },
      },
      orderBy: { Date_of_Prescription: 'desc' },
    });

    return { success: true, data: prescriptions };
  } catch (error) {
    return { success: false, error: 'Failed to fetch prescriptions' };
  }
}

/**
 * Get all delivery logs
 */
export async function getAllDeliveryLogs() {
  try {
    const logs = await prisma.delivery_log.findMany({
      include: {
        orders: { select: { OrderID: true } },
        delivery_personals: { select: { FirstName: true, LastName: true } },
      },
      orderBy: { CreatedAt: 'desc' },
    });

    return { success: true, data: logs };
  } catch (error) {
    return { success: false, error: 'Failed to fetch delivery logs' };
  }
}

/**
 * Get all ratings
 */
export async function getAllRatings() {
  try {
    const ratings = await prisma.ratings.findMany({
      include: {
        orders: { select: { OrderID: true } },
        suppliers: { select: { CompanyName: true } },
      },
      orderBy: { RatingDate: 'desc' },
    });

    return { success: true, data: ratings };
  } catch (error) {
    return { success: false, error: 'Failed to fetch ratings' };
  }
}

/**
 * Get login history
 */
export async function getLoginHistory(limit: number = 100) {
  try {
    const history = await prisma.login_history.findMany({
      include: {
        users: { select: { Email: true, Role: true } },
      },
      orderBy: { DateTime_Attempt: 'desc' },
      take: limit,
    });

    return { success: true, data: history };
  } catch (error) {
    return { success: false, error: 'Failed to fetch login history' };
  }
}

/**
 * Get inventory transactions (audit trail)
 */
export async function getInventoryTransactions(limit: number = 100) {
  try {
    const transactions = await prisma.inventorytransactions.findMany({
      include: {
        inventory: {
          include: {
            products: { select: { Product_Name: true } },
          },
        },
      },
      orderBy: { TransactionDate: 'desc' },
      take: limit,
    });

    return { success: true, data: transactions };
  } catch (error) {
    return { success: false, error: 'Failed to fetch inventory transactions' };
  }
}

/**
 * Update customer banned status
 */
export async function updateCustomerBanStatus(customerID: number, isBanned: boolean) {
  try {
    const updated = await prisma.customers.update({
      where: { UserID: customerID },
      data: { isBanned },
    });

    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: 'Failed to update customer' };
  }
}

/**
 * Delete user (cascade deletes)
 */
export async function deleteUser(userID: number) {
  try {
    // First delete associated records to handle constraints
    await prisma.users.delete({
      where: { UserID: userID },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete user' };
  }
}

/**
 * Get database statistics for admin dashboard
 */
export async function getDatabaseStats() {
  try {
    const stats = {
      totalUsers: await prisma.users.count(),
      totalCustomers: await prisma.customers.count(),
      totalDoctors: await prisma.doctors.count(),
      totalSuppliers: await prisma.suppliers.count(),
      totalProducts: await prisma.products.count(),
      totalOrders: await prisma.orders.count(),
      totalPrescriptions: await prisma.prescription.count(),
      totalDeliveries: await prisma.delivery_log.count(),
      pendingOrders: await prisma.orders.count({ where: { Status: 'PENDING' } }),
      paidOrders: await prisma.orders.count({ where: { PaymentStatus: 'PAID' } }),
      totalOrderValue: await prisma.orders.aggregate({
        _sum: { TotalAmount: true },
        where: { PaymentStatus: 'PAID' },
      }),
    };

    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: 'Failed to fetch statistics' };
  }
}

// Auth utility for role-based routing and access checks.
// For hardened deployments, replace with token/session middleware.

export type UserRole = 'CUSTOMER' | 'DOCTOR' | 'SUPPLIER' | 'ADMIN';

export interface AuthUser {
  UserID: number;
  Email: string;
  Role: UserRole;
  IsActive: boolean;
}

// Helper to check if user has required role
export function hasRole(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
}

// Helper to get role display name
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    CUSTOMER: 'Customer',
    DOCTOR: 'Doctor',
    SUPPLIER: 'Supplier',
    ADMIN: 'Administrator',
  };
  return roleNames[role];
}

// Helper to get role-specific dashboard path
export function getRoleDashboardPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    CUSTOMER: '/dashboard/customer',
    DOCTOR: '/dashboard/doctor',
    SUPPLIER: '/dashboard/supplier',
    ADMIN: '/dashboard/admin',
  };
  return paths[role];
}

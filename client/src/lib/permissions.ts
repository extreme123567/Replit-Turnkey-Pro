// Role-based access control utilities
export type UserRole = 'admin' | 'property_manager' | 'office_staff' | 'technician' | 'inspector';

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageProperties: boolean;
  canManageTenants: boolean;
  canCreateWorkOrders: boolean;
  canAssignWorkOrders: boolean;
  canCompleteWorkOrders: boolean;
  canScheduleInspections: boolean;
  canCompleteInspections: boolean;
  canApproveExpenses: boolean;
  canManageStaff: boolean;
  canViewReports: boolean;
  canAccessMessaging: boolean;
  canManagePayroll: boolean;
  canProcessInvoices: boolean;
}

export const rolePermissions: Record<UserRole, UserPermissions> = {
  admin: {
    canViewDashboard: true,
    canManageProperties: true,
    canManageTenants: true,
    canCreateWorkOrders: true,
    canAssignWorkOrders: true,
    canCompleteWorkOrders: true,
    canScheduleInspections: true,
    canCompleteInspections: true,
    canApproveExpenses: true,
    canManageStaff: true,
    canViewReports: true,
    canAccessMessaging: true,
    canManagePayroll: true,
    canProcessInvoices: true,
  },
  property_manager: {
    canViewDashboard: true,
    canManageProperties: true,
    canManageTenants: true,
    canCreateWorkOrders: true,
    canAssignWorkOrders: true,
    canCompleteWorkOrders: false,
    canScheduleInspections: true,
    canCompleteInspections: false,
    canApproveExpenses: true,
    canManageStaff: false,
    canViewReports: true,
    canAccessMessaging: true,
    canManagePayroll: false,
    canProcessInvoices: false,
  },
  office_staff: {
    canViewDashboard: true,
    canManageProperties: false,
    canManageTenants: true,
    canCreateWorkOrders: true,
    canAssignWorkOrders: true,
    canCompleteWorkOrders: false,
    canScheduleInspections: true,
    canCompleteInspections: false,
    canApproveExpenses: false,
    canManageStaff: false,
    canViewReports: true,
    canAccessMessaging: true,
    canManagePayroll: false,
    canProcessInvoices: true,
  },
  technician: {
    canViewDashboard: true,
    canManageProperties: false,
    canManageTenants: false,
    canCreateWorkOrders: false,
    canAssignWorkOrders: false,
    canCompleteWorkOrders: true,
    canScheduleInspections: false,
    canCompleteInspections: false,
    canApproveExpenses: false,
    canManageStaff: false,
    canViewReports: false,
    canAccessMessaging: true,
    canManagePayroll: false,
    canProcessInvoices: false,
  },
  inspector: {
    canViewDashboard: true,
    canManageProperties: false,
    canManageTenants: false,
    canCreateWorkOrders: true,
    canAssignWorkOrders: false,
    canCompleteWorkOrders: false,
    canScheduleInspections: true,
    canCompleteInspections: true,
    canApproveExpenses: false,
    canManageStaff: false,
    canViewReports: true,
    canAccessMessaging: true,
    canManagePayroll: false,
    canProcessInvoices: false,
  },
};

export function getUserPermissions(role: UserRole): UserPermissions {
  return rolePermissions[role];
}

export function hasPermission(role: UserRole, permission: keyof UserPermissions): boolean {
  return rolePermissions[role][permission];
}

export function getAvailableDashboards(role: UserRole): string[] {
  const dashboards = ['/dashboard']; // General dashboard available to all
  
  switch (role) {
    case 'admin':
      return [...dashboards, '/property-manager', '/office-staff', '/technician', '/inspector'];
    case 'property_manager':
      return [...dashboards, '/property-manager'];
    case 'office_staff':
      return [...dashboards, '/office-staff'];
    case 'technician':
      return [...dashboards, '/technician'];
    case 'inspector':
      return [...dashboards, '/inspector'];
    default:
      return dashboards;
  }
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  const permissions = getUserPermissions(role);
  
  // Define route access rules
  const routeAccessMap: Record<string, keyof UserPermissions> = {
    '/dashboard': 'canViewDashboard',
    '/property-manager': 'canManageProperties',
    '/office-staff': 'canManageTenants',
    '/technician': 'canCompleteWorkOrders',
    '/inspector': 'canCompleteInspections',
    '/scheduling': 'canViewDashboard',
    '/clients': 'canManageTenants',
    '/staff': 'canManageStaff',
    '/messaging': 'canAccessMessaging',
    '/payroll': 'canManagePayroll',
    '/invoices': 'canProcessInvoices',
  };
  
  const requiredPermission = routeAccessMap[route];
  return requiredPermission ? permissions[requiredPermission] : false;
}
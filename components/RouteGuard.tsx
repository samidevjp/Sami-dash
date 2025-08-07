'use client';

import { useEmployee } from '@/hooks/useEmployee';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  STAFF_HOME_PERMISSIONS,
  STAFF_POS_PERMISSIONS,
  STAFF_TEAM_PERMISSIONS
} from '@/app/dashboard/team/components/common/const';
import { usePermissionsStore } from '@/hooks/usePermissionsStore';

// Define route permissions mapping based on data.ts
const routePermissions: Record<
  string,
  { permission?: string; employeePermission?: string }
> = {
  // Main routes
  '/dashboard/inventory': {
    permission: 'mainNav.inventory',
    employeePermission: 'home.EXPERIENCE_SALES_REPORT'
  },
  '/dashboard/transactions': {
    permission: 'pos.docketView',
    employeePermission: 'pos_setting.DOCKET_VIEW'
  },
  '/dashboard/onAccount': {
    permission: 'pos.onAccount',
    employeePermission: 'pos_setting.ON_ACCOUNT'
  },
  '/dashboard/guest-book': {
    permission: 'mainNav.guestBook'
  },
  '/dashboard/printer-settings': {
    permission: 'mainNav.printerSettings',
    employeePermission: 'home.PRINTERS'
  },
  '/dashboard/table-layout': {
    permission: 'mainNav.tableLayout'
  },
  '/dashboard/report': {
    permission: 'mainNav.report'
  },
  '/dashboard/team': {
    permission: 'mainNav.team',
    employeePermission: 'team.TEAM'
  },
  '/quick-sale': {
    permission: 'mainNav.pos'
  },
  '/pos': {
    permission: 'mainNav.pos'
  },
  '/bump': {
    permission: 'mainNav.bump',
    employeePermission: 'home.POS_SETTINGS'
  },
  '/dashboard/invoice': {
    permission: 'mainNav.invoice',
    employeePermission: 'home.REPORTS'
  },
  '/dashboard/inventory-invoice': {
    permission: 'mainNav.invoice'
  },
  '/dashboard/online-orders': {
    permission: 'mainNav.online_store'
  },
  '/dashboard/wabi-post': {
    permission: 'mainNav.invoice',
    employeePermission: 'home.EXPERIENCE_SALES_REPORT'
  },

  // Settings routes
  '/dashboard/reservation-settings': {
    permission: 'mainNav.reservations'
  },
  '/dashboard/online-store': {
    permission: 'mainNav.online_store',
    employeePermission: 'home.RESTAURANT_PROFILE'
  },
  '/dashboard/surcharge-settings': {
    permission: 'pos.surchargeSetting',
    employeePermission: 'pos_setting.SURCHARGE_SETTINGS'
  },
  '/dashboard/hardware': {
    permission: 'mainNav.printerSettings',
    employeePermission: 'home.PRINTERS'
  },
  '/dashboard/tickets': {
    permission: 'mainNav.reservations'
  },
  '/dashboard/integrations': {
    permission: 'mainNav.integrations',
    employeePermission: 'home.INTEGRATIONS'
  }
};

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { currentEmployee } = useEmployee();
  const { permissions: accountPermissions } = usePermissionsStore();
  const router = useRouter();
  const pathname = usePathname();

  const checkAccountPermission = (permission?: string): boolean => {
    if (!permission) return true;

    const [category, specificPermission] = permission.split('.');
    if (!accountPermissions[category]) return false;

    return accountPermissions[category][specificPermission] || false;
  };

  const checkEmployeePermission = (permission?: string): boolean => {
    if (!permission || !currentEmployee?.permissions) return true;
    const [category, specificPermission] = permission.split('.');
    let permissionValue: number;

    switch (category) {
      case 'home':
        permissionValue =
          STAFF_HOME_PERMISSIONS[
            specificPermission as keyof typeof STAFF_HOME_PERMISSIONS
          ];
        break;
      case 'pos_setting':
        permissionValue =
          STAFF_POS_PERMISSIONS[
            specificPermission as keyof typeof STAFF_POS_PERMISSIONS
          ];
        break;
      case 'team':
        permissionValue =
          STAFF_TEAM_PERMISSIONS[
            specificPermission as keyof typeof STAFF_TEAM_PERMISSIONS
          ];
        break;
      default:
        return false;
    }

    return (
      (currentEmployee.permissions[category] & permissionValue) ===
      permissionValue
    );
  };

  useEffect(() => {
    // Find the most specific route match
    let matchedRoute = '';
    let routeConfig = null;

    // Find the most specific matching route
    for (const route in routePermissions) {
      if (pathname.startsWith(route) && route.length > matchedRoute.length) {
        matchedRoute = route;
        routeConfig = routePermissions[route];
      }
    }

    if (routeConfig) {
      const { permission, employeePermission } = routeConfig;

      // Check if user is owner (bypass permission checks)
      const isOwner = currentEmployee?.role === 'owner';

      // Check account-level permissions
      const hasAccountPermission = checkAccountPermission(permission);

      // Check employee-level permissions
      const hasEmployeePermission = checkEmployeePermission(employeePermission);

      // Redirect if user doesn't have required permissions
      if (!isOwner && !hasAccountPermission && !hasEmployeePermission) {
        console.log(
          `User lacks permission for ${matchedRoute}, redirecting to dashboard`
        );
        router.push('/dashboard');
      }
    }
  }, [pathname, currentEmployee, accountPermissions]);

  return <>{children}</>;
}

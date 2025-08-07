import { useRouter } from 'next/navigation';
import { useEmployee } from '@/hooks/useEmployee';
import {
  STAFF_HOME_PERMISSIONS,
  STAFF_POS_PERMISSIONS,
  STAFF_TEAM_PERMISSIONS
} from '@/app/dashboard/team/components/common/const';
import { ReactNode } from 'react';

interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  children,
  fallback = null
}: PermissionGateProps) {
  const { currentEmployee } = useEmployee();
  const router = useRouter();

  const checkPermission = (permission: string) => {
    if (!currentEmployee || !currentEmployee.permissions) return false;

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

  if (!checkPermission(permission)) {
    // If fallback is provided, render it
    if (fallback) return <>{fallback}</>;

    // Otherwise, redirect to dashboard or show an error message
    router.push('/dashboard');
    return null;
  }

  return <>{children}</>;
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { Dispatch, SetStateAction, useState } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';
import { usePermissionsStore } from '@/hooks/usePermissionsStore';
import { useEmployee } from '@/hooks/useEmployee';
import {
  STAFF_HOME_PERMISSIONS,
  STAFF_POS_PERMISSIONS,
  STAFF_TEAM_PERMISSIONS
} from '@/app/dashboard/team/components/common/const';
import { ChevronDown } from 'lucide-react';

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false
}: DashboardNavProps) {
  const path = usePathname();
  const { isMinimized, toggle } = useSidebar();
  const { permissions: accountPermissions } = usePermissionsStore();
  const { currentEmployee } = useEmployee();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>(
    {}
  );
  const router = useRouter();

  if (!items?.length) {
    return null;
  }

  const checkAccountPermission = (permission: string): boolean => {
    if (!permission) return true;

    const [category, specificPermission] = permission.split('.');
    if (!accountPermissions[category]) return false;

    return accountPermissions[category][specificPermission] || false;
  };

  const checkEmployeePermission = (permission: string): boolean => {
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

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem
  ) => {
    e.preventDefault();
    const accountHasAccess = checkAccountPermission(item.permission || '');
    const employeeHasAccess = checkEmployeePermission(
      item.employeePermission || ''
    );
    if (!employeeHasAccess) {
      return;
    }

    if (!accountHasAccess) {
      router.push(`/subscription?feature=${encodeURIComponent(item.title)}`);
    } else if (item.admin) {
      if (localStorage.getItem('pinPreference') === 'true') {
        router.push(
          `/pin?security=true&route=${encodeURIComponent(item.href || '')}`
        );
      } else {
        router.push(item.href || '');
      }
    } else if (item.href) {
      router.push(item.href);
    }

    if (setOpen) setOpen(false);
    if (isMinimized) {
      toggle();
    }
  };

  const filteredItems = items
    .filter(
      (item) =>
        (!item.employeePermission ||
          checkEmployeePermission(item.employeePermission)) &&
        (!item.permission || checkAccountPermission(item.permission))
    )
    .filter((item) => {
      if (currentEmployee?.role === 'owner') {
        return true;
      }
      if (item.admin) {
        return checkEmployeePermission(item.employeePermission || '');
      }
      return true;
    });

  const toggleSubMenu = (title: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderNavItem = (item: NavItem, index: number, depth = 0) => {
    const Icon = Icons[item.icon || 'arrowRight'];
    const accountHasAccess = checkAccountPermission(item.permission || '');
    const employeeHasAccess = checkEmployeePermission(
      item.employeePermission || ''
    );
    const hasSubItems = item.subItems && item.subItems.length > 0;

    // Skip rendering if user doesn't have permission
    if (item.permission && !accountHasAccess) {
      return null;
    }

    if (item.employeePermission && !employeeHasAccess) {
      return null;
    }

    return (
      <div key={index} className={cn('', depth > 0 && 'ml-4')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href || '#'}
              className={cn(
                'flex cursor-pointer items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                path === item.href ? 'bg-accent' : 'transparent',
                hasSubItems && 'cursor-pointer'
              )}
              onClick={(e) => {
                if (hasSubItems) {
                  e.preventDefault();
                  toggleSubMenu(item.title);
                  if (isMinimized) {
                    toggle();
                  }
                } else {
                  handleNavClick(e, item);
                }
              }}
            >
              <Icon className={`ml-3 size-5 flex-none`} />
              {isMobileNav || (!isMinimized && !isMobileNav) ? (
                <span className="mr-2 truncate">{item.title}</span>
              ) : (
                ''
              )}
              {hasSubItems && (
                <ChevronDown
                  className={cn(
                    'size-4',
                    openSubMenus[item.title] && 'rotate-180'
                  )}
                />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent
            align="center"
            side="right"
            sideOffset={8}
            className={!isMinimized ? 'hidden' : 'inline-block'}
          >
            {item.title}
          </TooltipContent>
        </Tooltip>
        {hasSubItems && openSubMenus[item.title] && (
          <div className="mt-1">
            {item
              .subItems!.filter((subItem) => {
                // Filter out submenu items based on permissions
                if (subItem.permission) {
                  return checkAccountPermission(subItem.permission);
                }
                if (subItem.employeePermission) {
                  return checkEmployeePermission(subItem.employeePermission);
                }
                return true;
              })
              .map((subItem, subIndex) =>
                renderNavItem(subItem, subIndex, depth + 1)
              )}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="grid items-start gap-2">
      <TooltipProvider>
        {filteredItems.map((item, index) => renderNavItem(item, index))}
      </TooltipProvider>
    </nav>
  );
}

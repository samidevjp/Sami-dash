'use client';
import React from 'react';
import { Users, Calendar, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';

const SideBar = () => {
  const { data: session } = useSession();
  const teamPermissions = session?.user?.permissionChecks?.teams || {};

  const menuItems = [
    { id: 'team', label: 'Team', icon: Users, permission: 'team' },
    { id: 'roster', label: 'Roster', icon: Calendar, permission: 'roster' },
    {
      id: 'timesheet',
      label: 'Timesheet',
      icon: Clock,
      permission: 'timesheet'
    }
  ].filter((item) => teamPermissions[item.permission]);

  return (
    <div className="fixed">
      <div className="">
        <div className="flex">
          {menuItems.map((menuItem) => (
            <a
              key={menuItem.id}
              href={`/dashboard/team?id=${menuItem.id}`}
              className={`block py-4 pl-8 text-lg font-bold no-underline transition-all hover:text-primary `}
            >
              {menuItem.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SideBar;

import React from 'react';
import { EmployeePermissions } from '../../common/types';
import { permissionCategories, PERMISSION_LABELS } from '../../common/const';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Employee } from '@/types';
interface StaffPermissionsProps {
  newEmployee: Employee;
  setNewEmployee: React.Dispatch<React.SetStateAction<Employee>>;
}
const StaffPermissions: React.FC<StaffPermissionsProps> = ({
  newEmployee,
  setNewEmployee
}) => {
  const togglePermission = (
    category: keyof EmployeePermissions,
    permission: number
  ) => {
    setNewEmployee((prevState) => ({
      ...prevState,
      permissions: {
        ...prevState.permissions,
        [category]: prevState.permissions[category] ^ permission
      }
    }));
  };
  const toggleAllPermissions = (
    category: keyof EmployeePermissions,
    enableAll: boolean
  ) => {
    const allPermissions =
      permissionCategories.find((item) => item.category === category)
        ?.permissions || {};
    const newPermissions = (Object.values(allPermissions) as number[]).reduce(
      (acc: number, permission: number) => acc | permission,
      0
    );
    setNewEmployee((prevState) => ({
      ...prevState,
      permissions: {
        ...prevState.permissions,
        [category]: enableAll ? newPermissions : 0
      }
    }));
  };
  const isAllChecked = (category: keyof EmployeePermissions) => {
    const allPermissions =
      permissionCategories.find((item) => item.category === category)
        ?.permissions || {};
    const totalPermissions = Object.values(allPermissions).reduce<number>(
      (acc, permission) => acc | (permission as number),
      0
    );
    return (
      (newEmployee.permissions[category] & totalPermissions) ===
      totalPermissions
    );
  };
  return (
    <div className="p-4">
      {permissionCategories.map(({ title, category, permissions }) => (
        <div key={category} className="mb-14">
          <div className="mb-10 flex items-center justify-between">
            <p className="font-bold">{title}</p>
            <Label className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">All on/off</p>
              <Switch
                checked={isAllChecked(category as keyof EmployeePermissions)}
                onCheckedChange={(checked) =>
                  toggleAllPermissions(
                    category as keyof EmployeePermissions,
                    checked
                  )
                }
              />
            </Label>
          </div>
          <div className="pl-4">
            <div className="flex flex-col gap-6">
              {Object.entries(permissions).map(([label, permission]) => (
                <Label
                  key={label}
                  className="flex items-center justify-between"
                >
                  <span className="text-muted-foreground">
                    {PERMISSION_LABELS[label] || label.replace(/_/g, ' ')}
                  </span>
                  <Switch
                    checked={Boolean(
                      newEmployee.permissions[
                        category as keyof EmployeePermissions
                      ] & permission
                    )}
                    onCheckedChange={() =>
                      togglePermission(
                        category as keyof EmployeePermissions,
                        permission
                      )
                    }
                  />
                </Label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default StaffPermissions;

import React from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Employee } from '@/types';
interface SecurityInfoProps {
  newEmployee: Employee;
  setNewEmployee: React.Dispatch<React.SetStateAction<Employee>>;
  activeSystemPin: boolean;
}
const SecurityInfo: React.FC<SecurityInfoProps> = ({
  newEmployee,
  setNewEmployee,
  activeSystemPin
}) => {
  return (
    <>
      <div className="mb-4">
        <Label className="mb-4 flex w-full flex-col">
          <p className="mb-2 text-muted-foreground">Quick Pin</p>
          <Input
            type="text"
            value={newEmployee.quick_pin}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, quick_pin: e.target.value })
            }
            className="mt-1 rounded-lg border p-2"
          />
        </Label>
      </div>
      {activeSystemPin && (
        <div className="mb-4">
          <Label className="mb-4 flex w-full flex-col">
            <p className="mb-2 text-muted-foreground">System Pin</p>
            <Input
              type="text"
              value={newEmployee.system_pin}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, system_pin: e.target.value })
              }
              className="mt-1 rounded-lg border p-2"
            />
          </Label>
        </div>
      )}
    </>
  );
};
export default SecurityInfo;

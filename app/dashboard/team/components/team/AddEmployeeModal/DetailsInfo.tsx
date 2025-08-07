import React from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Employee } from '@/types';
interface DetailsInfoProps {
  newEmployee: Employee;
  setNewEmployee: React.Dispatch<React.SetStateAction<Employee>>;
}
const DetailsInfo: React.FC<DetailsInfoProps> = ({
  newEmployee,
  setNewEmployee
}) => (
  <>
    <div className="mb-4">
      <Label className="mb-4 flex w-full flex-col">
        <span className="text-muted-foreground">Home Address</span>
        <Input
          type="text"
          value={newEmployee.address}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, address: e.target.value })
          }
          className="mt-1 rounded-lg border p-2"
        />
      </Label>
    </div>
    <div className="mb-4">
      <Label className="mb-4 flex w-full flex-col">
        <span className="text-muted-foreground">Contact Number</span>
        <Input
          type="text"
          value={newEmployee.mobile_no}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, mobile_no: e.target.value })
          }
          className="mt-1 rounded-lg border p-2"
        />
      </Label>
    </div>
    <div className="mb-4">
      <Label className="mb-4 flex w-full flex-col">
        <span className="text-muted-foreground">Email Address</span>
        <Input
          type="email"
          value={newEmployee.emailAddress}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, emailAddress: e.target.value })
          }
          className="mt-1 rounded-lg border p-2"
        />
      </Label>
    </div>
    <div className="mb-4">
      <Label className="mb-4 flex w-full flex-col">
        <span className="text-muted-foreground">Date Hired</span>
        <Input
          type="date"
          value={newEmployee.date_hired}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, date_hired: e.target.value })
          }
          className="mt-1 block w-full"
        />
      </Label>
    </div>
  </>
);
export default DetailsInfo;

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Employee } from '@/types';

interface AccountInfoProps {
  newEmployee: Employee;
  setNewEmployee: React.Dispatch<React.SetStateAction<Employee>>;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  newEmployee,
  setNewEmployee
}) => (
  <>
    <div className="mb-4">
      <Label className="">
        <span className="text-muted-foreground">Tax Number</span>
        <Input
          type="text"
          value={newEmployee.tax_no ?? ''}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, tax_no: e.target.value })
          }
          className="mt-1 block w-full"
        />
      </Label>
    </div>
    <div className="mb-4">
      <Label className="">
        <span className="text-muted-foreground">Bank Account</span>
        <Input
          type="text"
          value={newEmployee.bank_account ?? ''}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, bank_account: e.target.value })
          }
          className="mt-1 block w-full"
        />
      </Label>
    </div>
    <div className="mb-4">
      <Label>
        <span className="text-muted-foreground">Bank Name</span>
        <Input
          type="text"
          value={newEmployee.bank_name ?? ''}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, bank_name: e.target.value })
          }
          className="mt-1 block w-full"
        />
      </Label>
    </div>
  </>
);

export default AccountInfo;

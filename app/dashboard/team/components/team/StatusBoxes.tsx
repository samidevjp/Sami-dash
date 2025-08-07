import React from 'react';
import { Button } from '@/components/ui/button';
import { Employee } from '@/types';
interface StatusBoxesProps {
  employees: Employee[];
  deletedEmployees: Employee[];
  showEmployees: string;
  setShowEmployees: (showEmployees: string) => void;
}
const StatusBoxes: React.FC<StatusBoxesProps> = ({
  employees,
  deletedEmployees,
  showEmployees,
  setShowEmployees
}) => {
  return (
    <div className="grid max-w-sm grid-cols-2 gap-4 sm:grid-cols-3">
      {['All', 'Active', 'Inactive'].map((filter) => (
        <Button
          key={filter}
          variant={showEmployees === filter ? 'default' : 'outline'}
          onClick={() => setShowEmployees(filter)}
          className="flex flex-col items-center rounded-lg p-6"
        >
          <div className="text-sm">{filter}</div>
          <p className="flex self-end">
            {filter === 'All'
              ? employees.length + deletedEmployees.length
              : filter === 'Active'
              ? employees.length
              : deletedEmployees.length}
          </p>
        </Button>
      ))}
    </div>
  );
};
export default StatusBoxes;

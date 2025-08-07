import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Employee } from '@/types';
interface SortByEmployeeProps {
  employees: Employee[];
  selectedEmployee: number | null;
  setSelectedEmployee: React.Dispatch<React.SetStateAction<number | null>>;
  setEmployeeId: React.Dispatch<React.SetStateAction<number | null>>;
  title?: string;
}
const SortByEmployee: React.FC<SortByEmployeeProps> = ({
  employees,
  selectedEmployee,
  setSelectedEmployee,
  setEmployeeId,
  title
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const handleEmployeeSelect = (employeeId: number | null) => {
    setSelectedEmployee(employeeId);
    setEmployeeId(employeeId);
  };
  const getSelectedEmployeeName = () => {
    if (selectedEmployee === null) {
      return title || 'Sort by Employee';
    }
    const selectedEmp = employees.find((emp) => emp.id === selectedEmployee);
    return selectedEmp
      ? `${selectedEmp.first_name} ${selectedEmp.last_name}`
      : 'All';
  };
  useEffect(() => {
    if (employees.length === 0) {
      setSelectedEmployee(null);
    }
  }, [employees, setSelectedEmployee]);
  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-60">
          {getSelectedEmployeeName()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[500px] w-full overflow-y-auto">
        <DropdownMenuItem onClick={() => handleEmployeeSelect(null)}>
          All
        </DropdownMenuItem>
        {employees.map((employee: Employee) => (
          <DropdownMenuItem
            key={employee.id}
            onSelect={() => handleEmployeeSelect(Number(employee.id))}
          >
            {employee.first_name} {employee.last_name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default SortByEmployee;

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Employee } from '@/types';

interface RequestAvailabilityProps {
  open: boolean;
  handleClose: () => void;
  employees: Employee[];
  onSubmit: (selectedEmployees: Employee[]) => void;
  scheduleDateId: string | number;
}
const RequestAvailability: React.FC<RequestAvailabilityProps> = ({
  open,
  handleClose,
  employees,
  onSubmit,
  scheduleDateId
}: any) => {
  const [searchText, setSearchText] = useState<any>('');
  const [selectedEmployees, setSelectedEmployees] = useState<any>([]);
  const { requestShift } = useApi();
  const handleSearchChange = (event: any) => {
    setSearchText(event.target.value.toLowerCase());
  };
  const handleToggle = (employee: any) => {
    const currentIndex = selectedEmployees.indexOf(employee);
    const newChecked = [...selectedEmployees];
    if (currentIndex === -1) {
      newChecked.push(employee);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setSelectedEmployees(newChecked);
  };
  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees);
    }
  };
  const handleSend = () => {
    const employeeIds = selectedEmployees.map((employee: any) => employee.id);
    const payload = {
      employee_schedule_date_id: scheduleDateId,
      employee_id: employeeIds,
      send_to_selected_employee_id: true
    };
    const asyncFunction = async () => {
      try {
        const response = await requestShift(payload as any);
        onSubmit(selectedEmployees);
        handleClose();
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Availability request sent successfully.'
        });
      } catch (error) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Failed to send availability request. Please try again.'
        });
        console.error('Error:', error);
      }
    };
    asyncFunction();
  };
  return (
    <Modal
      title="Request Availability"
      description="Select employees to request availability"
      isOpen={open}
      onClose={() => handleClose(false)}
    >
      <div className="">
        <Input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search..."
        />
        <ul className="mt-8 max-h-72 overflow-y-auto">
          {employees
            .filter((employee: any) =>
              `${employee.first_name} ${employee.last_name}`
                .toLowerCase()
                .includes(searchText)
            )
            .map((employee: any) => (
              <li
                key={employee.id}
                className="items-centerp-2 mb-4 flex cursor-pointer"
                onClick={() => handleToggle(employee)}
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.indexOf(employee) !== -1}
                  readOnly
                />
                <span className="ml-2 text-sm">{`${employee.first_name} ${employee.last_name}`}</span>
              </li>
            ))}
        </ul>
        <div className="mt-8 flex justify-end gap-2">
          <Button onClick={handleSelectAll} variant={'outline'}>
            {selectedEmployees.length === employees.length
              ? 'Deselect All'
              : 'Select All'}
          </Button>
          <Button onClick={handleClose} variant={'secondary'}>
            Cancel
          </Button>
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </Modal>
  );
};
export default RequestAvailability;

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Employee } from '@/types';

interface SubmitScheduleModalProps {
  open: any;
  handleClose: () => void;
  employees: Employee[];
  onSubmit: (selectedEmployees: Employee[]) => void;
  scheduleDateId: number | string;
}
const SubmitScheduleModal: React.FC<SubmitScheduleModalProps> = ({
  open,
  handleClose,
  employees,
  onSubmit,
  scheduleDateId
}: any) => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const { emailEmployeeRoster } = useApi();
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value.toLowerCase());
  };
  const handleToggle = (employee: Employee) => {
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
    const employeeIds = selectedEmployees.map(
      (employee: Employee) => employee.id
    );
    const payload = {
      employee_schedule_date_id: scheduleDateId,
      employee_id: employeeIds
    };
    const asyncFunction = async () => {
      try {
        const response = await emailEmployeeRoster(payload);
        onSubmit(selectedEmployees);
        handleClose();
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Schedule sent successfully.'
        });
      } catch (error: any) {
        console.error(error);
        const errorMessage =
          error?.response?.data?.message ||
          'Failed to send schedule. Please try again.';
        toast({
          title: 'error',
          variant: 'destructive',
          description: `${errorMessage} Or check if the email address is valid.`
        });
      }
    };
    asyncFunction();
  };
  return (
    <Modal
      title="Submit Schedule"
      description="Select employees to send the schedule to"
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
                .includes(searchText.toLowerCase())
            )
            .map((employee: any) => (
              <li
                key={employee.id}
                className="mb-4 flex cursor-pointer items-center"
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
export default SubmitScheduleModal;

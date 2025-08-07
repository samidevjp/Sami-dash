import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import ProfileAvatar from '@/app/dashboard/team/components/common/ProfileAvatar';
import { Input } from '../ui/input';

interface BookingEmployeeListProps {
  createBookingEmployee: boolean;
  handleCloseBookingEmployee: () => void;
  employees: any;
  selectedEmployee: any;
  setEmployeeData: (employee: any) => void;
}

const BookingEmployeeList: React.FC<BookingEmployeeListProps> = ({
  createBookingEmployee,
  handleCloseBookingEmployee,
  employees,
  selectedEmployee,
  setEmployeeData
}) => {
  const selectEmployee = (employee: any) => {
    setEmployeeData(employee);
    handleCloseBookingEmployee();
  };

  const [filteredEmployees, setFilteredEmployees] = useState(employees);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredEmployees(employees);
    } else {
      setFilteredEmployees(
        employees.filter((employee: any) => {
          const fullName =
            `${employee.first_name} ${employee.last_name}`.toLowerCase();
          return fullName.includes(searchTerm.toLowerCase());
        })
      );
    }
  }, [searchTerm]);

  return (
    <Dialog
      open={createBookingEmployee}
      onOpenChange={handleCloseBookingEmployee}
      modal={true}
    >
      <DialogContent className="h-[80vh] min-w-[40vw] content-start">
        <DialogHeader>
          <DialogTitle>Booking taken by</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search Employee"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full min-w-56 flex-1 rounded-lg px-4 py-2"
        />
        <div className="overflow-y-auto rounded-lg">
          <TableForFixedHeader className="sticky top-0 bg-secondary">
            <TableHeader
              className="sticky z-10 bg-secondary"
              style={{ top: '-1px' }}
            >
              <TableRow>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees !== undefined &&
                filteredEmployees.map((employee: any, index: number) => (
                  <TableRow
                    className={`cursor-pointer border-b hover:bg-muted ${
                      selectedEmployee?.id === employee.id
                        ? 'bg-muted text-primary'
                        : ''
                    }`}
                    key={index}
                    onClick={() => selectEmployee(employee)}
                  >
                    <TableCell className="flex items-center gap-2">
                      <div>
                        <ProfileAvatar
                          profilePicUrl={employee.photo}
                          firstName={employee.first_name}
                          lastName={employee.last_name}
                          color={employee.color}
                          width={40}
                          height={40}
                        />
                      </div>
                      <p className="text-nowrap">
                        {employee.first_name} {employee.last_name}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </TableForFixedHeader>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingEmployeeList;

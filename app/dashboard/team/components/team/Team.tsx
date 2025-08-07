import React, { useEffect, useState } from 'react';
import AddEmployeeModal from './AddEmployeeModal/AddEmployeeModal';
import EmployeeDetailModal from './EmployeeDetailModal';
import ProfileAvatar from '../common/ProfileAvatar';
import { ArrowRight, TableOfContents, LayoutGrid } from 'lucide-react';
import StatusBoxes from './StatusBoxes';
import { getRelativeLuminance } from '@/utils/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Employee } from '@/types';
interface TeamProps {
  employees: Employee[];
  deletedEmployees: Employee[];
  fetchEmployees: () => Promise<void>;
  fetchDeletedEmployees: () => Promise<void>;
}
const Team: React.FC<TeamProps> = ({
  employees,
  deletedEmployees,
  fetchEmployees,
  fetchDeletedEmployees
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showEmployees, setShowEmployees] = useState<string>('Active');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [isTableView, setIsTableView] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredEmployees, setFilteredEmployees] =
    useState<Employee[]>(employees);
  useEffect(() => {
    const allEmployees = [...employees, ...deletedEmployees];
    let selectedEmployees: Employee[] = [];
    if (showEmployees === 'All') {
      selectedEmployees = allEmployees;
    } else if (showEmployees === 'Active') {
      selectedEmployees = employees;
    } else if (showEmployees === 'Inactive') {
      selectedEmployees = deletedEmployees;
    }
    const filtered = selectedEmployees.filter((employee) => {
      const fullName =
        `${employee.first_name} ${employee.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
    setFilteredEmployees(filtered);
  }, [searchTerm, employees, deletedEmployees, showEmployees]);
  const getFilteredAndSortedEmployees = () => {
    if (searchTerm) {
      return filteredEmployees;
    }
    return filteredEmployees;
  };

  const handleOpenAddEmployeeModal = () => {
    setEditEmployee(null);
    setEditModalOpen(true);
  };
  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setModalOpen(false);
  };
  const handleEditEmployee = (employee: any) => {
    setEditEmployee(employee);
    setEditModalOpen(true);
    setModalOpen(false);
  };
  const handleCloseEditModal = () => {
    setEditEmployee(null);
    setEditModalOpen(false);
  };
  const toggleView = () => {
    setIsTableView((prev) => !prev);
  };
  const exportCSV = (selectedExportMode: string) => {
    const exportData =
      selectedExportMode === 'All'
        ? [...employees, ...deletedEmployees]
        : selectedExportMode === 'Active'
        ? employees
        : selectedExportMode === 'Inactive'
        ? deletedEmployees
        : [];
    const exportDataName =
      selectedExportMode === 'All'
        ? 'AllEmployees'
        : selectedExportMode === 'Active'
        ? 'ActiveEmployees'
        : selectedExportMode === 'Inactive'
        ? 'InactiveEmployees'
        : 'Employees';
    const csvRows = [
      ['Name', 'Job Type', 'Contract', 'Role', 'Level', 'Hired'],
      ...exportData.map((employee) => [
        `${employee.first_name} ${employee.last_name}`,
        employee.roles || '',
        employee.contract || '',
        employee.role || '',
        Array.from({ length: Number(employee.level) })
          .map(() => '⭐')
          .join('') || '',
        employee.date_hired || ''
      ])
    ];
    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exportDataName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      {/* Header */}
      <div className="header relative mb-4 items-end justify-between gap-4 lg:flex">
        <Button
          className="mb-4 w-full rounded-lg md:absolute md:right-0 md:top-[-35px]  md:w-auto lg:mb-0"
          onClick={handleOpenAddEmployeeModal}
          data-tutorial="create-employee"
        >
          + Add Employee
        </Button>
        <div>
          <StatusBoxes
            employees={employees}
            deletedEmployees={deletedEmployees}
            showEmployees={showEmployees}
            setShowEmployees={setShowEmployees}
          />
        </div>
        <div className="mt-4 flex justify-between gap-4 lg:mt-0 lg:block">
          <div className="flex">
            <div className="flex space-x-4">
              <Input
                placeholder="Search Employee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-w-56 flex-1 rounded-lg px-4 py-2"
              />
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex w-full max-w-60 items-center"
                  >
                    <ArrowRight className="mr-2" size={16} />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[500px] w-full overflow-y-auto">
                  <DropdownMenuItem onClick={() => exportCSV('All')}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportCSV('Active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportCSV('Inactive')}>
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                className="flex w-full max-w-60 items-center gap-2 text-nowrap"
                onClick={toggleView}
                variant="outline"
              >
                {isTableView ? (
                  <LayoutGrid className="mr-2" size={16} />
                ) : (
                  <TableOfContents className="mr-2" size={16} />
                )}
                {isTableView ? 'Grid View' : 'Table View'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Body */}
      {isTableView ? (
        // Table View ----------------------------------------------------------
        <div
          className="rounded-lg"
          style={{ maxHeight: 'calc(100dvh - 310px)', overflowY: 'auto' }}
        >
          <TableForFixedHeader className="sticky top-0 bg-secondary">
            <TableHeader
              className="sticky z-10 bg-secondary"
              style={{ top: '-1px' }}
            >
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Date Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredAndSortedEmployees().length > 0 ? (
                getFilteredAndSortedEmployees().map((employee: Employee) => (
                  <TableRow
                    className="cursor-pointer border-b hover:bg-muted"
                    key={employee.id}
                    onClick={() => handleEmployeeClick(employee)}
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
                    <TableCell>
                      {employee.role.charAt(0).toUpperCase() +
                        employee.role.slice(1)}
                    </TableCell>
                    <TableCell>
                      {employee.roles && (
                        <Badge className="rounded-full px-2 py-1">
                          {employee.roles}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{employee.contract}</TableCell>
                    <TableCell>
                      {Array.from({ length: Number(employee.level) }).map(
                        (_, index) => (
                          <span key={index}>⭐</span>
                        )
                      )}
                    </TableCell>
                    <TableCell>{employee.date_hired}</TableCell>
                  </TableRow>
                ))
              ) : (
                <p className="p-4">No employees found</p>
              )}
            </TableBody>
          </TableForFixedHeader>
        </div>
      ) : (
        // Grid View ---------------------------------------------------------
        <div
          className="grid-container pb-8"
          style={{ maxHeight: 'calc(100dvh - 330px)', overflowY: 'auto' }}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {getFilteredAndSortedEmployees().length > 0 ? (
              getFilteredAndSortedEmployees().map((employee: any) => (
                <div
                  key={employee.id}
                  className="employee-card cursor-pointer"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <div className="employee-avatar rounded-lg bg-secondary p-4 text-center">
                    <div className="flex justify-center">
                      <ProfileAvatar
                        profilePicUrl={employee.photo}
                        firstName={employee.first_name}
                        lastName={employee.last_name}
                        color={employee.color}
                      />
                    </div>
                    <p className="mt-2 font-bold">
                      {employee.first_name} {employee.last_name}
                    </p>
                  </div>
                  <div
                    className="employee-info mt-2 rounded-lg p-2 text-center"
                    style={{
                      backgroundColor: employee.color,
                      color: getRelativeLuminance(employee.color)
                    }}
                  >
                    <h6
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {employee.role}
                    </h6>
                  </div>
                </div>
              ))
            ) : (
              <p>No employees found</p>
            )}
          </div>
        </div>
      )}
      <AddEmployeeModal
        employee={editEmployee}
        open={editModalOpen}
        onClose={handleCloseEditModal}
        fetchEmployees={fetchEmployees}
        employees={employees}
        fetchDeletedEmployees={fetchDeletedEmployees}
      />
      {modalOpen && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          open={modalOpen}
          onClose={handleCloseModal}
          onEdit={handleEditEmployee}
        />
      )}
    </>
  );
};
export default Team;

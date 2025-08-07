import React, { useEffect, useState } from 'react';
import { Plus, Mail, Download } from 'lucide-react';
import moment from 'moment';
import { useApi } from '@/hooks/useApi';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Modal } from '@/components/ui/modal';
import SortByEmployee from './components/SortByEmployee';
import TimesheetRecordTable from './components/TimesheetRecordTable';
import { startOfWeek, endOfWeek } from 'date-fns';
import { calculateTotalHoursAndCost } from './utility/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { Employee } from '@/types';

interface RosterGroup {
  id: number;
  group_name: string;
}
interface TimesheetProps {
  employees: Employee[];
  rosterGroups: RosterGroup[];
  currentEmployee: any;
  allEmployees: Employee[];
}
const Timesheet: React.FC<TimesheetProps> = ({
  employees,
  rosterGroups,
  currentEmployee,
  allEmployees
}) => {
  const { data: session } = useSession();
  const businessEmail = session?.user?.email;

  const { timesheetSummary, timeSheets } = useApi();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [isRosterDropdownOpen, setIsRosterDropdownOpen] =
    useState<boolean>(false);
  const today = new Date();
  const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 });
  const endOfWeekDate = endOfWeek(today, { weekStartsOn: 0 });
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: startOfWeekDate,
    to: endOfWeekDate
  });
  const [isEmailModalOpen, setIsEmailModalOpen] =
    React.useState<boolean>(false);
  const [timesheetData, setTimesheetData] = useState<any>([]);
  const [isAddModalOpen, setAddModalOpen] = React.useState<boolean>(false);
  // Sort by Schedule Group ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const handleGroupsSelect = (groupId: number) => {
    setSelectedGroup(groupId);
  };
  const getSelectedRosterName = () => {
    if (selectedGroup === null) {
      return 'Sort by Schedule';
    }
    const selectedRoster = rosterGroups.find(
      (group: any) => group.id === selectedGroup
    );
    return selectedRoster ? selectedRoster.group_name : 'Sort by Schedule';
  };
  // Sort by Date Range ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const handleOnChange = (date: DateRange | undefined) => {
    if (date) {
      setSelectedDateRange(date);
    }
  };
  // Email Timesheet Summary ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const handleOpenEmailModal = () => {
    setIsEmailModalOpen(true);
  };
  const handleEmailModalClose = () => {
    setIsEmailModalOpen(false);
  };
  const handleSendEmail = async () => {
    try {
      const params = {
        employee_id: selectedEmployee ? selectedEmployee : null,
        date_range: `${moment(selectedDateRange.from).format(
          'YYYY-MM-DD'
        )},${moment(selectedDateRange.to).format('YYYY-MM-DD')}`,
        roster_id: selectedGroup ? selectedGroup : null
      };
      await timesheetSummary(params);
      toast({
        title: 'Success',
        variant: 'success',
        description: 'Timesheet sent successfully.'
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Error sending timesheet. Please try again.'
      });
    }
  };

  // Export timesheet to CSV
  const exportTimesheetCSV = () => {
    try {
      // Prepare CSV data with headers
      const csvRows = [
        [
          'Employee Name',
          'Date',
          'Start Time',
          'End Time',
          'Duration (Hours)',
          'Cost'
        ]
      ];

      // Add data rows
      timesheetData.forEach((record: any) => {
        const employee = allEmployees.find(
          (emp) => emp.id === record.employee_id
        );
        const employeeName = employee
          ? `${employee.first_name} ${employee.last_name}`
          : 'Unknown Employee';

        const startTime = moment(record.started_at);
        const endTime = moment(record.stopped_at);
        const duration = moment
          .duration(endTime.diff(startTime))
          .asHours()
          .toFixed(2);

        const payRates = employee?.pay_rates || [];
        const { newTotalCost } = calculateTotalHoursAndCost(
          record.started_at,
          record.stopped_at,
          payRates
        );

        csvRows.push([
          employeeName,
          startTime.format('YYYY-MM-DD'),
          startTime.format('HH:mm:ss'),
          endTime.format('HH:mm:ss'),
          duration,
          `$${newTotalCost ? newTotalCost.toFixed(2) : '0.00'}`
        ]);
      });

      // Create CSV content
      const csvContent = csvRows
        .map((row) => row.map((field) => `"${field}"`).join(','))
        .join('\n');

      // Create filename with date range
      const fromDate = moment(selectedDateRange.from).format('YYYY-MM-DD');
      const toDate = moment(selectedDateRange.to).format('YYYY-MM-DD');
      const filename = `Timesheet_${fromDate}_to_${toDate}.csv`;

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        variant: 'success',
        description: 'Timesheet CSV downloaded successfully.'
      });
    } catch (error) {
      console.error('CSV Export Error:', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Error downloading timesheet. Please try again.'
      });
    }
  };
  // Set Timesheet Data from APIs ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const asyncFunction = async () => {
    const startDate = moment(selectedDateRange.from).format('YYYY-MM-DD');
    const endDate = moment(selectedDateRange.to).format('YYYY-MM-DD');
    const params = {
      id: employeeId ? employeeId : null,
      date_range: `${startDate},${endDate}`
    };
    const response = await timeSheets(params);
    const timesheetData = response.data.map((timesheet: any) => {
      const employee = allEmployees.find(
        (emp) => emp.id === timesheet.employee_id
      );
      if (employee) {
        const payRates = employee.pay_rates || [];
        const { newTotalCost } = calculateTotalHoursAndCost(
          timesheet.started_at,
          timesheet.stopped_at,
          payRates
        );
        return {
          ...timesheet,
          pay_rates: payRates,
          newTotalCost: newTotalCost
        };
      }
      return timesheet;
    });
    setTimesheetData(timesheetData);
  };
  useEffect(() => {
    asyncFunction();
  }, [selectedEmployee, selectedDateRange]);

  // Add New Record ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const handleAddRecordModalOpen = () => {
    setAddModalOpen(true);
  };

  return (
    <div className="relative">
      {/* Filter Section */}
      <div className="mb-4 flex flex-wrap justify-between gap-4">
        <div className="flex gap-4">
          {/* Sort by Roster */}
          <DropdownMenu
            open={isRosterDropdownOpen}
            onOpenChange={setIsRosterDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full max-w-60">
                {getSelectedRosterName()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[500px] w-full overflow-y-auto">
              <DropdownMenuItem onClick={() => handleGroupsSelect(0)}>
                All
              </DropdownMenuItem>
              {rosterGroups.map((group: any) => (
                <DropdownMenuItem
                  key={group.id}
                  onSelect={() => handleGroupsSelect(group.id)}
                >
                  {group.group_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Sort by Employee */}
          <div className="w-80">
            <SortByEmployee
              employees={employees}
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
              setEmployeeId={setEmployeeId}
            />
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Download CSV button */}
          <Button
            className="flex items-center gap-2"
            onClick={exportTimesheetCSV}
            variant={'outline'}
            disabled={!timesheetData || timesheetData.length === 0}
          >
            <Download size={16} />
            Download CSV
          </Button>
          {/* Email Timesheet Summary button */}
          <Button
            className="flex items-center gap-2"
            onClick={handleOpenEmailModal}
            variant={'outline'}
          >
            <Mail size={16} />
            Email Summary
          </Button>
        </div>
      </div>
      {/* Main content area */}
      <div className="relative rounded-lg bg-secondary p-6">
        <div className="mb-6">
          <CalendarDateRangePicker
            onDateChange={handleOnChange}
            initialDateRange={selectedDateRange}
          />
        </div>
        {/* Add Button */}
        <div className="absolute right-10 top-4 z-50 text-right">
          <button
            className="rounded-full bg-primary p-3 text-white"
            onClick={handleAddRecordModalOpen}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div
          className="relative overflow-y-scroll"
          style={{
            height: 'calc(100dvh - 380px)'
          }}
        >
          {timesheetData ? (
            <TimesheetRecordTable
              employees={employees}
              allEmployees={allEmployees}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
              timesheetData={timesheetData}
              setTimesheetData={setTimesheetData}
              currentEmployee={currentEmployee}
              setEmployeeId={setEmployeeId}
              isAddModalOpen={isAddModalOpen}
              setAddModalOpen={setAddModalOpen}
              selectedDateRange={selectedDateRange}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p>
                No records for{' '}
                {moment(selectedDateRange.from).format('ddd, MMM DD')} -{' '}
                {moment(selectedDateRange.to).format('ddd, MMM DD')}
              </p>
            </div>
          )}
        </div>
      </div>
      <Modal
        title="Send Timesheet"
        description={`Do you want to send this timesheets to "${businessEmail}" ?`}
        isOpen={isEmailModalOpen}
        onClose={handleEmailModalClose}
      >
        <div>
          <div className="flex justify-end gap-2">
            <Button onClick={handleEmailModalClose} variant={'secondary'}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>Send</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Timesheet;

import React from 'react';
import { Pencil, Check, Trash } from 'lucide-react';
import moment from 'moment';
import { useApi } from '@/hooks/useApi';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AddNewRecordModal from './AddNewRecordModal';
import { calculateTotalHoursAndCost } from '../utility/utils';
import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Employee } from '@/types';
import { formatNumberWithCommas } from '@/lib/utils';
interface TimesheetRecordTableProps {
  employees: Employee[];
  selectedGroup: any;
  setSelectedGroup: (group: any) => void;
  selectedEmployee: any;
  setSelectedEmployee: React.Dispatch<React.SetStateAction<number | null>>;
  timesheetData: any[];
  setTimesheetData: (timesheetData: any[]) => void;
  currentEmployee: any;
  setEmployeeId: React.Dispatch<React.SetStateAction<number | null>>;
  isAddModalOpen: boolean;
  setAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDateRange: any;
  allEmployees: Employee[];
}
const TimesheetRecordTable: React.FC<TimesheetRecordTableProps> = ({
  employees,
  timesheetData,
  setTimesheetData,
  currentEmployee,
  isAddModalOpen,
  setAddModalOpen,
  selectedDateRange,
  allEmployees
}) => {
  const { deleteTimeRecord, approveTimesheet, updateTimeRecord } = useApi();
  const [selectedRecordId, setSelectedRecordId] = React.useState<number | null>(
    null
  );
  const formatTime = (datetime: string, format: string) => {
    return moment(datetime).format(format);
  };
  const [isDeleteModalOpen, setDeleteModalOpen] =
    React.useState<boolean>(false);
  const [isEditModalOpen, setEditModalOpen] = React.useState<boolean>(false);
  const calculateDuration = (start: string, stop: string) => {
    const startMoment = moment(start);
    const stopMoment = moment(stop);
    if (stopMoment.isBefore(startMoment)) {
      stopMoment.add(1, 'day');
    }
    return moment.duration(stopMoment.diff(startMoment)).asHours().toFixed(1);
  };
  const [selectedRecord, setSelectedRecord] = React.useState<any>(null);
  const [startTime, setStartTime] = React.useState<string>('');
  const [startTimeData, setStartTimeData] = React.useState<string>('');
  const [endTime, setEndTime] = React.useState<string>('');
  const [endTimeData, setEndTimeData] = React.useState<string>('');
  // Get unique dates from timesheetData ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const groupedTimesheets = timesheetData.reduce<Record<string, any[]>>(
    (acc, record) => {
      const date = formatTime(record.started_at, 'dddd DD MMM');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    },
    {}
  );
  const sortedGroupedTimesheets = Object.fromEntries(
    Object.entries(groupedTimesheets).sort(([dateA], [dateB]) => {
      const parsedDateA = moment(dateA, 'dddd DD MMM').toDate();
      const parsedDateB = moment(dateB, 'dddd DD MMM').toDate();
      return parsedDateA.getTime() - parsedDateB.getTime();
    })
  );
  // Delete record ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const handleDeleteRecordModalOpen = (recordId: number) => {
    setSelectedRecordId(recordId);
    setDeleteModalOpen(true);
  };
  // Close modal ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setSelectedRecordId(null);
  };
  // Delete record ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const handleDeleteRecord = async () => {
    if (selectedRecordId !== null) {
      try {
        const params = {
          id: selectedRecordId,
          processed_by: currentEmployee.id
        };
        await deleteTimeRecord(params);
        const updatedTimesheetData = timesheetData.filter(
          (record) => record.id !== selectedRecordId
        );
        setTimesheetData(updatedTimesheetData);
        handleDeleteModalClose();
      } catch (error) {
        console.error('Failed to delete the record', error);
      }
    }
  };
  // Approved_by ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const handleApprove = async (
    recordId: number,
    deleted_at?: string | null
  ) => {
    if (deleted_at != null) {
      console.log("Can't approve a deleted record");
      toast({
        title: 'Restore the employee',
        variant: 'destructive',
        description:
          'Restore the employee to enable them to approve the record in the team settings.'
      });
      return;
    }

    try {
      const params = {
        id: recordId,
        approved_by: currentEmployee.id
      };
      await approveTimesheet(params);
      setTimesheetData(
        timesheetData.map((record) => {
          if (record.id === recordId) {
            return {
              ...record,
              approved_by: currentEmployee.id
            };
          }
          return record;
        })
      );
    } catch (error) {
      console.error('Failed to approve the timesheet', error);
    }
  };
  // Edit Record ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const handleEditRecordModalOpen = (recordId: number) => {
    const recordToEdit = timesheetData.find((record) => record.id === recordId);
    if (recordToEdit) {
      const startMoment = moment(recordToEdit.started_at);
      let endMoment = moment(recordToEdit.stopped_at);
      if (endMoment.isBefore(startMoment)) {
        endMoment.add(1, 'day');
      }
      setStartTime(startMoment.format('YYYY-MM-DDTHH:mm'));
      setEndTime(
        recordToEdit.stopped_at ? endMoment.format('YYYY-MM-DDTHH:mm') : ''
      );
      setSelectedRecord(recordToEdit);
    }
    setSelectedRecordId(recordId);
    setEditModalOpen(true);
  };
  // Close modal
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedRecordId(null);
  };
  // Save Record
  const handleSaveRecord = async (recordId?: number) => {
    if (recordId !== null && selectedRecord) {
      try {
        const { total_hours, newTotalCost } = calculateTotalHoursAndCost(
          startTimeData || selectedRecord.started_at,
          endTimeData || selectedRecord.stopped_at,
          selectedRecord.pay_rates || selectedRecord.payRates || []
        );
        const params = {
          id: recordId,
          processed_by: currentEmployee.id,
          started_at: startTimeData || selectedRecord.started_at,
          stopped_at: endTimeData || selectedRecord.stopped_at,
          employee_id: selectedRecord.employee_id || null,
          roster_id: selectedRecord.roster_id || null
        };
        const response = await updateTimeRecord(params);
        setTimesheetData(
          timesheetData.map((record) => {
            if (record.id === recordId) {
              return {
                ...record,
                started_at: params.started_at,
                stopped_at: params.stopped_at,
                total_hours,
                newTotalCost
              };
            }
            return record;
          })
        );
        handleEditModalClose();
      } catch (error) {
        console.error('Failed to save the record', error);
      }
    }
  };
  const totalCostsByDate = Object.keys(groupedTimesheets).reduce(
    (acc, date) => {
      const totalCostForDate = groupedTimesheets[date].reduce(
        (sum: number, record: any) => {
          const cost = record.newTotalCost || 0;
          return sum + cost;
        },
        0
      );
      acc[date] = totalCostForDate;
      return acc;
    },
    {} as { [key: string]: number }
  );
  return (
    <div className="relative pb-8">
      {Object.keys(sortedGroupedTimesheets).map((date) => (
        <div key={date} className="mb-2">
          {/* Table */}
          <TableForFixedHeader
            className="md:table-fixed"
            style={{
              tableLayout: 'auto'
            }}
          >
            <TableHeader
              className="sticky bg-secondary"
              style={{ top: '-1px' }}
            >
              <TableRow style={{ borderWidth: '0' }}>
                <TableHead colSpan={10} className="w-auto">
                  <h2 className="text-lg">{date}</h2>
                </TableHead>
              </TableRow>
              <TableRow className="text-left">
                <TableHead className="w-60">Employee</TableHead>
                <TableHead className="w-auto">Start</TableHead>
                <TableHead className="w-auto">End</TableHead>
                <TableHead className="w-auto">Device</TableHead>
                <TableHead className="w-auto">Duration</TableHead>
                <TableHead className="w-auto">Wage</TableHead>
                {/* <TableHead className="w-auto">Note</TableHead> */}
                <TableHead className="w-20 text-center">Approve</TableHead>
                <TableHead className="w-20 text-center">Edit</TableHead>
                <TableHead className="w-20 text-center">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="space-y-2 border-b">
              {groupedTimesheets[date].map((record: any) => {
                const employee = allEmployees.find(
                  (employee) => employee.id === record.employee_id
                );
                return (
                  <TableRow key={record.id}>
                    <TableCell
                      className={`p-3 ${
                        record.approved_by ? 'text-green' : ''
                      }`}
                    >
                      {employee
                        ? `${employee.first_name} ${employee.last_name}`
                        : 'No Name'}{' '}
                      {employee?.deleted_at && '(Deleted)'}
                    </TableCell>
                    {/* Start Time */}
                    <TableCell
                      className={`p-3 ${
                        record.approved_by ? 'text-green' : ''
                      }`}
                    >
                      {formatTime(record.started_at, 'hh:mm A')}
                    </TableCell>
                    {/* End Time */}
                    <TableCell
                      className={`p-3 ${
                        record.approved_by ? 'text-green' : ''
                      }`}
                    >
                      {record.stopped_at
                        ? formatTime(record.stopped_at, 'hh:mm A')
                        : '--'}
                    </TableCell>
                    {/* Device */}
                    <TableCell
                      className={`p-3 ${
                        record.approved_by ? 'text-green' : ''
                      }`}
                    >
                      {record.device}
                    </TableCell>
                    {/* Duration */}
                    <TableCell className="p-3">
                      {record.stopped_at
                        ? calculateDuration(
                            record.started_at,
                            record.stopped_at
                          )
                        : '--'}
                      h
                    </TableCell>
                    {/* Wage */}
                    <TableCell className="p-3">
                      ${formatNumberWithCommas(record?.newTotalCost ?? '--')}
                    </TableCell>
                    {/* Approve */}
                    <TableCell className="p-3 text-center">
                      {record.approved_by == null && (
                        <Button
                          className="rounded border border-green p-2 text-green"
                          onClick={() =>
                            handleApprove(
                              record.id,
                              employee?.deleted_at || null
                            )
                          }
                          variant="ghost"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                    {/* Edit */}
                    <TableCell className="p-3">
                      <Button
                        onClick={() => handleEditRecordModalOpen(record.id)}
                        variant="ghost"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                    </TableCell>
                    {/* Delete */}
                    <TableCell className="p-3">
                      <Button
                        className="p-3 pr-0"
                        onClick={() => handleDeleteRecordModalOpen(record.id)}
                        variant="ghost"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableForFixedHeader>
          <p className="pr-12 pt-4 text-right">
            Total Wage : $
            <span className="text-xl">
              {' '}
              {formatNumberWithCommas(totalCostsByDate[date].toFixed(2))}
            </span>
          </p>
        </div>
      ))}
      {/* Total Wages */}
      <div className="sticky bottom-0 mt-12 bg-secondary p-4 pr-12 text-right">
        <p className="">
          Total Wages: ${' '}
          <span className="text-3xl">
            {formatNumberWithCommas(
              Object.values(totalCostsByDate)
                .reduce((acc, cost) => acc + cost, 0)
                .toFixed(2)
            )}
          </span>
        </p>
      </div>
      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Record"
        description="Are you sure you want to delete this record?"
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
      >
        <div className="flex justify-end gap-2">
          <Button onClick={handleDeleteModalClose} variant={'secondary'}>
            Cancel
          </Button>
          <Button variant={'danger'} onClick={handleDeleteRecord}>
            Delete
          </Button>
        </div>
      </Modal>
      {/* Edit Timesheet Modal */}
      <Modal
        title="Edit Time Record"
        description="Edit the time record"
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
      >
        {/* Start Time */}
        <div className="mb-4 flex flex-col">
          <Label className="mb-2">
            <p className="text-muted-foreground">Start Time</p>
            <div className="relative">
              <Input
                type="datetime-local"
                id="start-time"
                value={moment(startTime).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => {
                  const time = e.target.value;
                  if (time > endTime) {
                    alert('Start time cannot be after end time');
                    return;
                  }
                  setStartTime(time);
                  setStartTimeData(moment(time).format('YYYY-MM-DD HH:mm:ss'));
                }}
              />
            </div>
          </Label>
        </div>
        {/* End Time */}
        <div className="mb-8 flex flex-col">
          <Label htmlFor="end-time" className="mb-2">
            <p className="text-muted-foreground">End Time</p>
          </Label>
          <Input
            type="datetime-local"
            id="end-time"
            value={moment(endTime).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => {
              const time = e.target.value;
              if (time < startTime) {
                alert('End time cannot be before start time');
                return;
              }
              setEndTime(time);
              setEndTimeData(moment(time).format('YYYY-MM-DD HH:mm:ss'));
            }}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => handleSaveRecord(selectedRecord.id)}>
            SAVE
          </Button>
        </div>
      </Modal>
      {/* Add New Record Modal */}
      <AddNewRecordModal
        isAddModalOpen={isAddModalOpen}
        setAddModalOpen={setAddModalOpen}
        employees={employees}
        allEmployees={allEmployees}
        timesheetData={timesheetData}
        setTimesheetData={setTimesheetData}
        sortedGroupedTimesheets={sortedGroupedTimesheets}
        selectedDateRange={selectedDateRange}
      />
    </div>
  );
};
export default TimesheetRecordTable;

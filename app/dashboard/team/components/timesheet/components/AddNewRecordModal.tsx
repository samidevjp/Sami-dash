import React, { useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { v4 as uuid } from 'uuid';
import SortByEmployee from './SortByEmployee';
import { useApi } from '@/hooks/useApi';
import { calculateTotalHoursAndCost } from '../utility/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import moment from 'moment';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Employee } from '@/types';
interface AddNewRecordModalProps {
  employees: Employee[];
  timesheetData: any[];
  setTimesheetData: React.Dispatch<any>;
  isAddModalOpen: boolean;
  setAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sortedGroupedTimesheets: any;
  selectedDateRange: any;
  allEmployees: Employee[];
}
const AddNewRecordModal: React.FC<AddNewRecordModalProps> = ({
  employees,
  timesheetData,
  setTimesheetData,
  isAddModalOpen,
  setAddModalOpen,
  sortedGroupedTimesheets,
  selectedDateRange,
  allEmployees
}) => {
  const { timeBatchInsert } = useApi();
  const [startTimeData, setStartTimeData] = React.useState<string>('');
  const [endTimeData, setEndTimeData] = React.useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const handleAddRecordModalClose = () => {
    setAddModalOpen(false);
  };

  const formatTime = (datetime: string, format: string) => {
    return moment(datetime).format(format);
  };
  const handleDateTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value;
    const formattedValue = value.replace('T', ' ') + ':00';
    setter(formattedValue);
  };
  const handleSaveNewRecord = async () => {
    try {
      if (!selectedEmployee) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Please select an employee before saving.'
        });
        return;
      }

      const selectedEmployeeData = employees.find(
        (employee) => employee.id === selectedEmployee
      );
      const payRates = selectedEmployeeData?.pay_rates || [];

      if (payRates.length === 0) {
        console.error('Pay rates for the selected employee are not available.');
        return;
      }

      if (startTimeData > endTimeData) {
        alert('Start time cannot be after end time');
        return;
      }

      const { total_hours, newTotalCost } = calculateTotalHoursAndCost(
        startTimeData,
        endTimeData,
        payRates
      );

      const newRecord = {
        id: 0,
        uuid: uuid(),
        employee_id: selectedEmployee,
        started_at: startTimeData,
        stopped_at: endTimeData,
        note_clock_out: '',
        note_clock_in: '',
        device: 'web',
        updated_at: '',
        total_hours,
        total_cost: newTotalCost,
        payRates
      };

      const dateFrom = moment(selectedDateRange.from)
        .startOf('day')
        .format('YYYY-MM-DD HH:mm:ss');
      const dateTo = moment(selectedDateRange.to)
        .endOf('day')
        .format('YYYY-MM-DD HH:mm:ss');
      const startTimeMoment = moment(startTimeData);

      if (startTimeMoment.isBetween(dateFrom, dateTo, undefined, '[]')) {
        setTimesheetData((prevData: any) => [...prevData, newRecord]);
      }
      const params = { time: [newRecord] };
      const response = await timeBatchInsert(params);
      if (response?.data?.length) {
        const updatedRecord = {
          ...newRecord,
          id: response.data[0].id,
          total_cost: newTotalCost,
          newTotalCost: newTotalCost
        };

        setTimesheetData((prevData: any) => {
          const updatedData = prevData.map((record: any) =>
            record.uuid === newRecord.uuid ? updatedRecord : record
          );

          const recordDate = formatTime(
            updatedRecord.started_at,
            'dddd DD MMM'
          );

          console.log('Generated recordDate:', recordDate);
          console.log(
            'Existing keys in sortedGroupedTimesheets:',
            Object.keys(sortedGroupedTimesheets)
          );
          if (sortedGroupedTimesheets[recordDate]) {
            sortedGroupedTimesheets[recordDate].push(updatedRecord);
          } else {
            sortedGroupedTimesheets[recordDate] = [updatedRecord];
          }

          return updatedData;
        });
      }

      handleAddRecordModalClose();

      toast({
        title: 'Success',
        variant: 'success',
        description: 'Record added successfully.'
      });
    } catch (error) {
      console.error('Failed to save the record', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Failed to save the record. Please try again.'
      });
    }
  };

  return (
    <>
      <Modal
        title="Add Time Record"
        description="Add a new time record"
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
      >
        <div>
          {/* Sort by Employee */}
          <div className="mb-4 flex items-center gap-2">
            <SortByEmployee
              employees={employees}
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
              setEmployeeId={setEmployeeId}
              title="Select Employee"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={16} />
                </TooltipTrigger>
                <TooltipContent>
                  If you want to add deleted employees, please restore them
                  first in the team settings.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {/* Start Time */}
          <div className="mb-4 flex flex-col">
            <Label>
              <p className="mb-2 text-muted-foreground">Start Time</p>
              <Input
                type="datetime-local"
                id="start-time"
                value={startTimeData}
                onChange={(e) => {
                  if (endTimeData !== '' && e.target.value > endTimeData) {
                    alert('Start time cannot be after end time');
                    return;
                  }
                  handleDateTimeChange(e, setStartTimeData);
                }}
              />
            </Label>
          </div>
          {/* End Time */}
          <div className="mb-8 flex flex-col">
            <Label>
              <p className="mb-2 text-muted-foreground">End Time</p>
            </Label>
            <Input
              type="datetime-local"
              id="end-time"
              value={endTimeData}
              onChange={(e) => {
                if (startTimeData !== '' && e.target.value < startTimeData) {
                  alert('End time cannot be before start time');
                  return;
                }
                handleDateTimeChange(e, setEndTimeData);
              }}
            />
          </div>
        </div>
        <div className="text-right">
          <Button onClick={handleSaveNewRecord}>Add</Button>
        </div>
      </Modal>
    </>
  );
};
export default AddNewRecordModal;

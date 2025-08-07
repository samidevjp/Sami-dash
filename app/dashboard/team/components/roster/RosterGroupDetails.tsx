import React, { useState } from 'react';
import { Pencil, Trash, ArrowLeft, ArrowLeftRight } from 'lucide-react';
import moment from 'moment';
import ScheduleView from './ScheduleView';
import { useApi } from '@/hooks/useApi';
import { Schedule } from '../common/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Employee, Floor } from '@/types';

interface RosterGroup {
  id: any;
  group_name: string;
}
interface RosterGroupDetailsProps {
  copiedShift: any;
  copiedShiftCalendar: any;
  employeeGroupScheduleId: number;
  employees: Employee[];
  floors: Floor[];
  groupName: string;
  handleCloseCreateScheduleModal: () => void;
  handleCloseDetails: () => void;
  handleCopyShift: (shift: any) => void;
  handleDeleteSchedule: () => void;
  handleOpenCreateScheduleModal: () => void;
  schedules: any[];
  selectedGroup: RosterGroup;
  setCopiedShift: (shift: any) => void;
  setCopiedShiftCalendar: (calendar: any) => void;
  setSchedules: any;
  copiedShiftDetail: any;
  setCopiedShiftDetail: any;
  loading: boolean;
  fetchSchedules: any;
}
const RosterGroupDetails: React.FC<RosterGroupDetailsProps> = ({
  employees,
  groupName,
  floors,
  selectedGroup,
  schedules,
  setSchedules,
  handleCloseDetails,
  handleOpenCreateScheduleModal,
  employeeGroupScheduleId,
  copiedShift,
  setCopiedShift,
  copiedShiftCalendar,
  setCopiedShiftCalendar,
  loading,
  fetchSchedules
}: any) => {
  const { updateScheduleDate, removeScheduleDate, getDeletedSchedule } =
    useApi();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null
  );
  const [openEditModal, setOpenEditModal] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [deletedSchedules, setDeletedSchedules] = useState<Schedule[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);

  const handleEditSchedule = (schedule: Schedule) => {
    setNewScheduleName(schedule.name);
    setSelectedScheduleId(schedule.id);
    setOpenEditModal(true);
  };
  const handleRowClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };
  const handleCloseScheduleModal = async () => {
    setSelectedSchedule(null);

    if (selectedGroup) {
      await fetchSchedules(selectedGroup);
    }
  };

  const handleSaveScheduleName = async () => {
    try {
      const schedule = {
        employee_group_schedule_id: employeeGroupScheduleId,
        id: selectedScheduleId || 0,
        name: newScheduleName
      };
      await updateScheduleDate(schedule);
      const updatedSchedules = schedules.map((s: Schedule) =>
        s.id === selectedScheduleId ? { ...s, name: newScheduleName } : s
      );
      setSchedules(updatedSchedules);

      setOpenEditModal(false);
      toast({
        title: 'Success',
        variant: 'success',
        description: 'Schedule name updated successfully.'
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Error updating schedule name.'
      });
    }
  };
  const handleDeleteSchedule = (id: number) => {
    setScheduleToDelete(id);
    setOpenDeleteModal(true);
  };
  const confirmDeleteSchedule = () => {
    if (scheduleToDelete !== null) {
      handleDeleteScheduleFromTable(scheduleToDelete);
      setOpenDeleteModal(false);
      setScheduleToDelete(null);
    }
  };
  const handleDeleteScheduleFromTable = async (id: number) => {
    try {
      const data = await removeScheduleDate({ id });
      const updatedSchedules = schedules.filter((s: Schedule) => s.id !== id);
      setSchedules(updatedSchedules);
      toast({
        title: 'Success',
        variant: 'success',
        description: 'Schedule deleted successfully'
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Error deleting schedule.'
      });
    }
  };
  const handleShowDeleteSchedule = () => {
    setShowDeleted(true);
    const params = {
      id: selectedGroup.id
    };
    const asyncFunction = async () => {
      const data = await getDeletedSchedule(params);
      setDeletedSchedules(data);
    };
    asyncFunction();
  };
  const handleShowCurrentSchedule = () => {
    setShowDeleted(false);
  };

  return (
    <>
      {selectedSchedule ? (
        <div>
          <ScheduleView
            copiedShift={copiedShift}
            copiedShiftCalendar={copiedShiftCalendar}
            employees={employees}
            floors={floors}
            handleClose={handleCloseScheduleModal}
            schedule={selectedSchedule}
            schedules={schedules}
            setCopiedShift={setCopiedShift}
            setCopiedShiftCalendar={setCopiedShiftCalendar}
            setSchedules={setSchedules}
          />
        </div>
      ) : (
        <div className="bg-background pb-4">
          <div className="mb-2 justify-between gap-8 md:flex">
            <div className="flex gap-4">
              <Button
                onClick={handleCloseDetails}
                className="mb-4 min-w-44 px-4"
                variant={'outline'}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back To Group
              </Button>
              {showDeleted ? (
                <Button
                  onClick={handleShowCurrentSchedule}
                  className="mb-4 min-w-44 px-4"
                  variant={'outline'}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Current Schedule
                </Button>
              ) : (
                <Button
                  onClick={handleShowDeleteSchedule}
                  className="mb-4 min-w-44 px-4"
                  variant={'outline'}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Deleted Schedule
                </Button>
              )}
            </div>
            <Button
              onClick={handleOpenCreateScheduleModal}
              className="mb-4 w-full rounded-lg px-4 md:w-auto"
            >
              + Create Schedule
            </Button>
          </div>
          <div
            className="rounded-lg bg-secondary"
            style={{ maxHeight: 'calc(100dvh - 280px)', overflowY: 'auto' }}
          >
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
                <TableRow className="" style={{ borderWidth: '0' }}>
                  <TableHead colSpan={10}>
                    <p className="my-4 ml-6 text-2xl text-primary-foreground">
                      {groupName}
                    </p>
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="w-auto">
                    <span className="ml-4">Schedule Name</span>
                  </TableHead>
                  <TableHead className="w-auto">Date Range</TableHead>
                  <TableHead className="w-auto">No. of Employees</TableHead>
                  <TableHead className="w-20 text-center">Edit</TableHead>
                  <TableHead className="w-20 text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <div className="p-8">Loading...</div>
                ) : (
                  (showDeleted ? deletedSchedules : schedules).map(
                    (schedule: any) => {
                      const formattedStartDate = moment(
                        schedule.start_date
                      ).format('ddd, MMM DD');
                      const formattedEndDate = moment(schedule.end_date).format(
                        'ddd, MMM DD'
                      );
                      const formattedDateRange = `${formattedStartDate} - ${formattedEndDate}`;
                      return (
                        <TableRow
                          key={schedule.id}
                          onClick={() => handleRowClick(schedule)}
                          className="cursor-pointer border-b hover:bg-muted"
                        >
                          <TableCell>
                            <span className="ml-4">{schedule.name}</span>
                          </TableCell>
                          <TableCell>{formattedDateRange}</TableCell>
                          <TableCell>{schedule.employees}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              className="p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSchedule(schedule);
                              }}
                              variant="ghost"
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>
                          </TableCell>
                          <TableCell className="text-center">
                            {!showDeleted ? (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSchedule(schedule.id);
                                }}
                                className="p-2"
                                variant="ghost"
                              >
                                <Trash className="h-5 w-5" />
                              </Button>
                            ) : (
                              <></>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                )}
              </TableBody>
            </TableForFixedHeader>
          </div>
        </div>
      )}
      {/* Edit Schedule Modal */}
      <Modal
        title="Edit Schedule"
        description="Edit the schedule name"
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
      >
        <Input
          type="text"
          value={newScheduleName}
          onChange={(e) => setNewScheduleName(e.target.value)}
        />
        <div className="mt-4 text-right">
          <Button onClick={handleSaveScheduleName}>Save</Button>
        </div>
      </Modal>

      <Modal
        title="Confirm Delete"
        description="Are you sure you want to delete this schedule?"
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
      >
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => setOpenDeleteModal(false)}
            className="mr-2"
            variant={'secondary'}
          >
            Cancel
          </Button>
          <Button onClick={confirmDeleteSchedule} variant={'danger'}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};
export default RosterGroupDetails;

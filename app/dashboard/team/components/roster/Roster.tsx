import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import '../../styles/style.scss';
import { Modal } from '@/components/ui/modal';
import moment from 'moment';
import RosterGroupDetails from './RosterGroupDetails';
import { useApi } from '@/hooks/useApi';
import { toast } from '@/components/ui/use-toast';

import { Pencil, Trash, TableOfContents, LayoutGrid } from 'lucide-react';

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
  id: number;
  group_name: string;
}
interface Schedule {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  no_of_employees: number;
  no_of_weeks: number;
  employee_group_schedule_id: number;
}

interface RosterProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  rosterGroups: RosterGroup[];
  setRosterGroups: React.Dispatch<React.SetStateAction<RosterGroup[]>>;
}
const Roster: React.FC<RosterProps> = ({
  employees,
  rosterGroups,
  setRosterGroups
}) => {
  const {
    createGroupSchedule,
    removeGroupSchedule,
    getScheduleDate,
    createScheduleDate,
    getFloors
  } = useApi();
  const [isTableView, setIsTableView] = useState(false);
  const [copiedShiftDetail, setCopiedShiftDetail] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [openCreateScheduleModal, setOpenCreateScheduleModal] =
    useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleName, setScheduleName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [noOfWeeks, setNoOfWeeks] = useState<any>('');
  const [copiedShift, setCopiedShift] = useState<any>(null);
  const [copiedShiftCalendar, setCopiedShiftCalendar] = useState<any>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [openRenameModal, setOpenRenameModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const handleCopyShift = (shift: any) => {
    setCopiedShift(shift);
    setCopiedShiftCalendar(shift);
  };
  const [loading, setLoading] = useState<boolean>(false);
  // const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenCreateScheduleModal = () => setOpenCreateScheduleModal(true);
  const handleCloseCreateScheduleModal = () =>
    setOpenCreateScheduleModal(false);
  useEffect(() => {
    const callbackGetFloors = async () => {
      const response = await getFloors();
      if (response.error) {
        console.error('Error fetching floors:', response.error);
      } else {
        setFloors(response.data.floors);
      }
    };
    callbackGetFloors();
  }, []);
  const handleCreateGroup = async () => {
    if (groupName) {
      const payload = {
        group_name: groupName
      };
      try {
        const response = await createGroupSchedule(payload);
        setRosterGroups([...rosterGroups, response]);
        setGroupName('');
        setOpen(false);
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Roster group created successfully.'
        });
      } catch (error) {
        console.error('Group creation error:', error);
        toast({
          title: 'error',
          variant: 'destructive',
          description: 'Failed to create roster group. Please try again.'
        });
      }
    }
  };

  const fetchSchedules = async (group: RosterGroup) => {
    try {
      setLoading(true);
      setSelectedGroup(group);
      setShowDetails(true);

      const params = {
        id: group.id
      };

      const response = await getScheduleDate(params);

      const formattedSchedules = response.data
        .filter(
          (schedule: Schedule) =>
            schedule.employee_group_schedule_id === group.id
        )
        .map((schedule: Schedule) => ({
          id: schedule.id,
          name: schedule.name || '',
          dateRange: `${schedule.start_date} - ${schedule.end_date}`,
          employees: schedule.no_of_employees,
          start_date: schedule.start_date,
          end_date: schedule.end_date,
          no_of_weeks: schedule.no_of_weeks
        }));
      setSchedules(formattedSchedules);
    } catch (error) {
      console.error('Error fetching schedule date:', error);
      toast({
        title: 'error',
        variant: 'destructive',
        description: 'Failed to fetch schedule. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedGroup(null);
    setSchedules([]);
  };
  const handleOpenRenameModal = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    group: RosterGroup
  ) => {
    e.stopPropagation();
    setSelectedGroup(group);
    setGroupName(group.group_name);
    setOpenRenameModal(true);
  };
  const handleCloseRenameModal = () => {
    setOpenRenameModal(false);
    setGroupName('');
  };
  const handleRenameGroup = async () => {
    if (selectedGroup && groupName) {
      const payload = {
        id: selectedGroup.id,
        group_name: groupName
      };
      try {
        const response = await createGroupSchedule(payload);

        setRosterGroups((prevGroups: any) =>
          prevGroups.map((group: any) =>
            group.id === selectedGroup.id
              ? { ...group, group_name: groupName }
              : group
          )
        );
        toast({
          title: 'Success',
          variant: 'success',
          className: 'bg-green-500 text-white',
          description: 'Roster group renamed successfully.'
        });
        handleCloseRenameModal();
      } catch (error) {
        console.error('API call error:', error);
        toast({
          title: 'error',
          variant: 'destructive',
          description: 'Failed to rename roster group. Please try again.'
        });
      }
    }
  };
  const handleOpenDeleteModal = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    group: RosterGroup
  ) => {
    e.stopPropagation();
    setSelectedGroup(group);
    setOpenDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };
  const handleDeleteGroup = async () => {
    if (selectedGroup) {
      const params = {
        id: selectedGroup.id
      };
      try {
        const response = await removeGroupSchedule(params);
        if (response.error) {
          console.error('Error deleting group:', response.error);
        } else {
          setRosterGroups((prevGroups) =>
            prevGroups.filter((group) => group.id !== selectedGroup.id)
          );
          handleCloseDeleteModal();
        }
      } catch (error) {
        console.error('API call error:', error);
      }
    }
  };
  const handleDeleteSchedule = () => {
    setRosterGroups(
      rosterGroups.filter((group: RosterGroup) => group !== selectedGroup)
    );
    handleCloseDetails();
  };
  const handleSaveSchedule = () => {
    if (!startDate) {
      console.error('Start date is undefined');
      return;
    }
    const data = {
      start_date: moment(startDate).format('YYYY-MM-DD'),
      name: scheduleName,
      no_of_weeks: parseInt(noOfWeeks, 10),
      employee_group_schedule_id: selectedGroup?.id
    };
    const asyncFunction = async () => {
      try {
        const response = await createScheduleDate(data);
        if (response.error) {
          console.error('Error:', response.error);
        } else {
          setOpenCreateScheduleModal(false);
          setScheduleName('');
          setNoOfWeeks('');
          fetchSchedules(selectedGroup);
        }
      } catch (err) {
        console.error('Error creating schedule:', err);
      }
    };
    asyncFunction();
  };
  const toggleView = () => {
    setIsTableView((prev) => !prev);
  };
  return (
    <>
      {!showDetails ? (
        <div className="">
          <div className="mb-4 justify-end gap-2 md:flex">
            <Button
              className="flex w-full max-w-44 items-center gap-2 text-nowrap"
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
            <Button
              className="w-full rounded-lg px-4 md:w-auto"
              onClick={() => setOpen(true)}
            >
              + Add New Roster Group
            </Button>
          </div>
          <div style={{ maxHeight: 'calc(100dvh - 280px)', overflowY: 'auto' }}>
            {/* Body */}
            {isTableView ? (
              // Table View ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              <TableForFixedHeader className="sticky top-0 bg-secondary">
                <TableHeader
                  className="sticky z-10 bg-secondary"
                  style={{ top: '-1px' }}
                >
                  <TableRow>
                    <TableHead className="w-auto">Name</TableHead>
                    <TableHead className="w-36 text-center">
                      Edit name
                    </TableHead>
                    <TableHead className="w-12 text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rosterGroups.length > 0 ? (
                    rosterGroups.map((group: RosterGroup, index: any) => (
                      <TableRow
                        className="cursor-pointer border-b hover:bg-muted"
                        key={index}
                        onClick={() => fetchSchedules(group)}
                      >
                        <TableCell>
                          <span className="ml-4">{group.group_name}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={'ghost'}
                            onClick={(e) => handleOpenRenameModal(e, group)}
                            className="p-2"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={'ghost'}
                            onClick={(e) => handleOpenDeleteModal(e, group)}
                            className="p-2"
                          >
                            <Trash className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <p className="p-4">No employees found</p>
                  )}
                </TableBody>
              </TableForFixedHeader>
            ) : (
              // Grid View ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              <div className="grid grid-cols-2 gap-4 pb-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {rosterGroups.map((group: RosterGroup, index: any) => (
                  <div
                    className="relative flex min-h-[180px] cursor-pointer items-center justify-center rounded-lg bg-secondary p-2"
                    key={index}
                    onClick={() => fetchSchedules(group)}
                  >
                    {group.group_name}
                    <div className="absolute right-2 top-2 flex">
                      <Button
                        variant={'ghost'}
                        onClick={(e) => handleOpenRenameModal(e, group)}
                        className="p-2"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        variant={'ghost'}
                        onClick={(e) => handleOpenDeleteModal(e, group)}
                        className="p-2"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <RosterGroupDetails
          employees={employees}
          groupName={selectedGroup?.group_name}
          floors={floors}
          selectedGroup={selectedGroup}
          schedules={schedules}
          setSchedules={setSchedules}
          handleCloseDetails={handleCloseDetails}
          handleDeleteSchedule={handleDeleteSchedule}
          handleOpenCreateScheduleModal={handleOpenCreateScheduleModal}
          handleCloseCreateScheduleModal={handleCloseCreateScheduleModal}
          employeeGroupScheduleId={selectedGroup?.id}
          copiedShift={copiedShift}
          handleCopyShift={handleCopyShift}
          setCopiedShift={setCopiedShift}
          copiedShiftCalendar={copiedShiftCalendar}
          setCopiedShiftCalendar={setCopiedShiftCalendar}
          copiedShiftDetail={copiedShiftDetail}
          setCopiedShiftDetail={setCopiedShiftDetail}
          loading={loading}
          fetchSchedules={fetchSchedules}
        />
      )}
      <Modal
        title="Roster Group"
        description="Create a new roster group"
        isOpen={open}
        onClose={() => handleClose()}
      >
        <Input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Create new roster group"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={handleClose} variant={'secondary'}>
            Cancel
          </Button>
          <Button onClick={handleCreateGroup}>Create</Button>
        </div>
      </Modal>
      <Modal
        title="Rename Group"
        description="Please enter a new group name"
        isOpen={openRenameModal}
        onClose={() => handleCloseRenameModal()}
      >
        <Input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter new group name"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={handleCloseRenameModal} variant={'secondary'}>
            Cancel
          </Button>
          <Button onClick={handleRenameGroup}>Save</Button>
        </div>
      </Modal>
      <Modal
        title="Delete Group"
        description="Are you sure you want to delete this group?"
        isOpen={openDeleteModal}
        onClose={() => handleCloseDeleteModal()}
      >
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={handleCloseDeleteModal} variant={'secondary'}>
            Cancel
          </Button>
          <Button onClick={handleDeleteGroup} variant={'danger'}>
            Delete
          </Button>
        </div>
      </Modal>
      <Modal
        title="Create Schedule"
        description="Please enter the schedule details"
        isOpen={openCreateScheduleModal}
        onClose={() => handleCloseCreateScheduleModal()}
      >
        <div className="w-full">
          <Label htmlFor="startDate">
            <p className="mb-2 text-muted-foreground">Enter start date</p>
            <Input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </Label>
          <Label>
            <p className="mb-2 mt-4 text-muted-foreground">
              Enter schedule name
            </p>
            <Input
              type="text"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
            />
          </Label>
          <Label>
            <p className="mb-2 mt-4 text-muted-foreground">
              Enter how many weeks
            </p>
            <Input
              type="number"
              value={noOfWeeks}
              onChange={(e) => setNoOfWeeks(e.target.value)}
            />{' '}
          </Label>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveSchedule}>Save</Button>
        </div>
      </Modal>
    </>
  );
};
export default Roster;

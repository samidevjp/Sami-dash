import React, { useEffect, useState, useRef } from 'react';
import WeekView from './scheduleView/WeekView';
import DayView from './scheduleView/DayView';
import TeamView from './scheduleView/TeamView';
import FloorView from './scheduleView/FloorView';
import moment from 'moment';
import { Shift, Schedule, EmployeeShifts } from '../common/types';
import SubmitScheduleModal from './scheduleView/SubmitScheduleModal';
import RequestAvailabilityModal from './scheduleView/RequestAvailabilityModal';
import BreakDownModal from './scheduleView/BreakDownModal';
import ShiftDetailModal from './scheduleView/ShiftDetailModal';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  ClipboardCopy,
  ClipboardPaste,
  ArrowDownToLine,
  RefreshCcw
} from 'lucide-react';
import { Employee, Floor } from '@/types';

interface ScheduleViewProps {
  copiedShift: any;
  copiedShiftCalendar: any;
  employees: Employee[];
  floors: Floor[];
  handleClose: () => void;
  schedule: Schedule;
  schedules: Schedule[];
  setCopiedShift: (shift: any) => void;
  setCopiedShiftCalendar: (calendar: any) => void;
  setSchedules: (schedules: Schedule[]) => void;
}
const ScheduleView: React.FC<ScheduleViewProps> = ({
  copiedShift,
  copiedShiftCalendar,
  employees,
  floors,
  handleClose,
  schedule,
  schedules,
  setCopiedShift,
  setCopiedShiftCalendar,
  setSchedules
}: any) => {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('edit');

  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [scheduleCopiedAlert, setScheduleCopiedAlert] = useState(false);

  const { useApi } = require('@/hooks/useApi');
  const { getEmployeeSchedule, createEmployeeSchedule, getEmployeeRoles } =
    useApi();
  const [employeeTable, setEmployeeTable] = useState<EmployeeShifts>({});
  const [employeeShifts, setEmployeeShifts] = useState<EmployeeShifts>({});
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [employeesSchedule, setEmployeesSchedule] = useState<any>([]);
  const [activeView, setActiveView] = useState('Week View');
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const carouselRef = useRef(null);
  const [employeesState, setEmployeesState] = useState<Employee[]>([]);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [requestAvailabilityModalOpen, setRequestAvailabilityModalOpen] =
    useState(false);
  const [totalHoursAllEmployees, setTotalHoursAllEmployees] = useState(0);
  const [totalCostsAllEmployees, setTotalCostsAllEmployees] = useState(0);
  const [totalShiftsRoleEmployees, setTotalShiftsRoleEmployees] = useState<
    number | null
  >(0);
  const [roles, setRoles] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [showSelectBox, setShowSelectBox] = useState(false);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [displayedEmployees, setDisplayedEmployees] = useState<Employee[]>([]);
  const [isBreakDownModalOpen, setIsBreakDownModalOpen] = useState(false);

  const [employeeOrder, setEmployeeOrder] = useState<string[]>([]);
  const handleHeaderClick = () => {
    setIsBreakDownModalOpen(true);
  };
  const handleCloseBreakDownModal = () => {
    setIsBreakDownModalOpen(false);
  };
  const formatHoursAndMinutes = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  const handleOpenSubmitShiftModal = () => {
    setSelectModalOpen(true);
  };
  const handleOpenRequestShiftModal = () => {
    setRequestAvailabilityModalOpen(true);
  };
  const handleCloseSelectModal = () => {
    setSelectModalOpen(false);
  };
  const handleCloseRequestAvailabilityModal = () => {
    setRequestAvailabilityModalOpen(false);
  };
  const handleEmployeeSelect = (employees: any) => {
    setSelectedEmployees(employees);
  };

  const getEmployeeColor = (employee: any) => {
    return employee.color;
  };
  const scrollLeft = () => {
    if (carouselRef.current) {
      (carouselRef.current as HTMLElement).scrollLeft -= 300;
    }
  };
  const scrollRight = () => {
    if (carouselRef.current) {
      (carouselRef.current as HTMLElement).scrollLeft += 300;
    }
  };

  const fetchData = async () => {
    try {
      setEmployeesData(Array.isArray(employees) ? employees : []);

      setFilteredEmployees(employeesData || []);
      const params = {
        id: schedule.id
      };
      const scheduleData = await getEmployeeSchedule(params);
      setEmployeesSchedule(scheduleData);
      const fetchedRoles = await getEmployeeRoles();
      setRoles(fetchedRoles.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [schedules]);
  useEffect(() => {
    if (!selectedRole) {
      const filtered = employeesData.filter(
        (employee: any) =>
          !(
            Array.isArray(displayedEmployees) &&
            displayedEmployees.some(
              (displayedEmployee) => displayedEmployee.id === employee.id
            )
          )
      );
      setFilteredEmployees(filtered);
    }
  }, [employeesData, displayedEmployees, selectedRole]);

  const resetToAllEmployees = () => {
    setSelectedRole(null);
    setFilteredEmployees(
      employees.filter(
        (employee: any) => !employeeOrder.includes(String(employee.id))
      )
    );
  };
  const handleRoleSelect = (roleId: number) => {
    setSelectedRole(roleId);
    setShowSelectBox(false);
    const filtered = employees.filter(
      (employee: any) =>
        employee.employment_role_id === roleId &&
        !displayedEmployees.some(
          (displayedEmployee: any) => displayedEmployee.id === employee.id
        )
    );
    setFilteredEmployees(filtered);
  };
  const handleTotalHoursChange = (totalHours: number) => {
    setTotalHoursAllEmployees(totalHours);
  };
  const handleTotalCostsChange = (totalCosts: number) => {
    setTotalCostsAllEmployees(totalCosts);
  };
  const handleTotalShiftsRoleEmployees = (totalShifts: number) => {
    setTotalShiftsRoleEmployees(totalShifts);
  };
  const handleRefresh = async () => {
    const params = {
      id: schedule.id
    };
    try {
      const scheduleData = await getEmployeeSchedule(params);
      setEmployeesSchedule(scheduleData);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const handleCopyShift = (shift: any) => {
    if (employeesSchedule && employeesSchedule.employee_shifts) {
      setCopiedShift(employeesSchedule.employee_shifts);
      setCopiedShiftCalendar(employeesSchedule.calendar);
      setScheduleCopiedAlert(true);
      localStorage.setItem(
        'copiedEmployeeOrder',
        JSON.stringify(employeeOrder)
      );
      setTimeout(() => {
        setScheduleCopiedAlert(false);
      }, 1000);
    }
  };
  const handlePasteShift = () => {
    if (!employeesData || employeesData.length === 0) {
      console.error('Employee data is not yet available');
      return;
    }
    const pasteCalendarStartDate = moment(schedule.start_date);
    const copyCalendarStartDate = moment(copiedShiftCalendar.start_date);
    const updatedShifts = copiedShift.reduce((acc: any, shift: any) => {
      const shiftShifts = Array.isArray(shift.shifts) ? shift.shifts : [];
      shiftShifts.forEach((s: any, shiftIndex: any) => {
        const shiftDate = moment(s.start_date);
        const dayDifference = shiftDate.diff(copyCalendarStartDate, 'days');
        const newStartDate = pasteCalendarStartDate
          .clone()
          .add(dayDifference, 'days');
        const newShift = {
          ...s,
          id: `new-${shiftIndex}${Date.now()}`,
          employee_schedule_date_id: schedule.id,
          start_date: newStartDate.format('YYYY-MM-DD'),
          end_date: newStartDate.format('YYYY-MM-DD'),
          date: newStartDate.format('YYYY-MM-DD')
        };
        if (!acc[newShift.employee_id]) {
          acc[newShift.employee_id] = [];
        }
        acc[newShift.employee_id].push(newShift);
      });
      return acc;
    }, {});
    const unifiedSchedule = unifiedFormattedSchedule(
      {
        calendar: copiedShiftCalendar,
        employee_shifts: updatedShifts
      },
      employees
    );
    setEmployeesSchedule(unifiedSchedule);
    setEmployeeTable(updatedShifts);
    setEmployeeShifts(updatedShifts);
    const storedEmployeeOrder = localStorage.getItem('copiedEmployeeOrder');
    if (storedEmployeeOrder) {
      setEmployeeOrder(JSON.parse(storedEmployeeOrder));
    }
  };
  const convertEmployeeShiftsToArray = (
    employeeShifts: any,
    employeesData: any
  ) => {
    return Object.entries(employeeShifts).map(([employeeId, shifts]) => {
      const employee =
        employeesData?.find(
          (emp: any) => emp.id === parseInt(employeeId, 10)
        ) || {};
      return {
        id: parseInt(employeeId, 10),
        shifts: shifts,
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        color: schedule.color || '',
        role: employee.role || '',
        mobile_no: employee.mobile_no || '',
        myob_uid: employee.myob_uid || null,
        pin: employee.pin || '',
        quick_pin: employee.quick_pin || '',
        reckon_employee_uid: employee.reckon_employee_uid || null,
        reckon_rha_employee_list_id:
          employee.reckon_rha_employee_list_id || null,
        branch_id: employee.branch_id || null,
        created_at: employee.created_at || '',
        deleted_at: employee.deleted_at || null
      };
    });
  };
  const unifiedFormattedSchedule = (formattedSchedule: any, employees: any) => {
    return {
      ...formattedSchedule,
      employee_shifts: convertEmployeeShiftsToArray(
        formattedSchedule.employee_shifts,
        employees
      )
    };
  };

  const handleDisplayedEmployees = (employees: any) => {
    setDisplayedEmployees(employees);
  };

  // setDisplayedEmployees is called in useEffect below
  useEffect(() => {
    if (employeesData.length === 0 || employeeOrder.length === 0) return;

    const validEmployeeIds = employeeOrder.filter((id) =>
      employeesData.some((emp) => String(emp.id) === id)
    );

    if (validEmployeeIds.length !== employeeOrder.length) {
      setEmployeeOrder(validEmployeeIds);
    }

    const newEmployees = validEmployeeIds
      .map((employeeId) =>
        employeesData.find((emp) => String(emp.id) === employeeId)
      )
      .filter(
        (employee): employee is Employee =>
          employee !== undefined &&
          !displayedEmployees.some((emp) => emp.id === employee.id)
      );

    newEmployees.forEach((employee) => {
      handleEmployeeClick(employee);
    });
  }, [employeeOrder, employeesData]);

  const handleEmployeeClick = (employee: Employee) => {
    setDisplayedEmployees((prev: Employee[]) => [...prev, employee]);

    let newFilteredEmployees = filteredEmployees.filter(
      (e) => e.id !== employee.id
    );
    if (selectedRole) {
      newFilteredEmployees = newFilteredEmployees.filter(
        (e) => e.employment_role_id === selectedRole
      );
    }
    setFilteredEmployees(newFilteredEmployees);
    setSelectedEmployees((prev: Employee[]) => [...prev, employee]);

    setEmployeesSchedule((prevSchedule: any) => {
      const employeeShifts = prevSchedule?.employee_shifts ?? [];
      const isEmployeeInSchedule = employeeShifts.some(
        (emp: any) => emp.id === employee.id
      );

      if (!isEmployeeInSchedule) {
        const newEmployeeWithShifts = {
          ...employee,
          shifts: employee.shifts || [],
          pay_rates: employee.pay_rates || [],
          role: employee.role || ''
        };

        return {
          ...prevSchedule,
          employee_shifts: [...employeeShifts, newEmployeeWithShifts]
        };
      }
      return prevSchedule;
    });
  };
  // useEffect(() => {
  //   console.log('filteredEmployees', filteredEmployees);
  //   console.log('employeesData', employeesData);
  // }, [filteredEmployees]);

  const removeEmployeeFromOrder = (employeeId: string) => {
    setEmployeeOrder((prevOrder) => {
      const updatedOrder = prevOrder.filter((id) => id !== employeeId);
      localStorage.setItem(
        `employeeOrder_${schedule.id}`,
        JSON.stringify(updatedOrder)
      );
      return updatedOrder;
    });
    setFilteredEmployees((prevFiltered) => {
      const removedEmployee = employees.find(
        (e: any) => String(e.id) === employeeId
      );
      if (!removedEmployee) return prevFiltered;

      let newFilteredEmployees = [...prevFiltered, removedEmployee];

      if (selectedRole) {
        newFilteredEmployees = newFilteredEmployees.filter(
          (e) => e.employment_role_id === selectedRole
        );
      }
      return newFilteredEmployees;
    });

    fetchData();
  };

  useEffect(() => {
    if (employeesSchedule?.employee_shifts) {
      const employeeArrayWithPayRates = employeeOrder
        .map((employeeId) => {
          const employeeScheduleData = employeesSchedule.employee_shifts.find(
            (emp: any) => String(emp.id) === employeeId
          );

          const employee =
            employeeScheduleData ||
            employeesData.find((emp: any) => String(emp.id) === employeeId);

          if (!employee) {
            console.warn(
              `employeeId ${employeeId} not found in employeesSchedule or employeesData`
            );
            return null;
          }

          const originalEmployee =
            employeesData.find(
              (originalEmp: any) => String(originalEmp.id) === employeeId
            ) || ({} as Employee);

          const shifts = employeeScheduleData?.shifts || [];
          const totalCost = shifts.reduce((acc: number, shift: any) => {
            const dayNumber = moment(shift.start_date).day() + 1;
            const rate =
              originalEmployee?.pay_rates?.find(
                (rate: any) => rate.day_number === dayNumber
              )?.rate || 0;
            const totalSeconds =
              shift.end_time - shift.start_time - shift.break_time;
            return acc + (totalSeconds / 3600) * rate;
          }, 0);

          return {
            ...employee,
            pay_rates: originalEmployee.pay_rates || [],
            employment_role_id: originalEmployee.employment_role_id || null,
            photo: originalEmployee.photo || null,
            shifts,
            totalCost
          };
        })
        .filter(Boolean);

      setEmployeesState(employeeArrayWithPayRates);
      handleDisplayedEmployees(employeeArrayWithPayRates);
    }
  }, [employeeOrder]);

  const handleShiftClick = (
    shift: any,
    mode: string,
    event: any,
    employeeId: any,
    date: any
  ) => {
    const rect = event.target.getBoundingClientRect();
    setSelectedShift(shift || { start_date: date });
    setSelectedEmployee(employeeId);
    setModalMode(mode);

    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedShift(null);
  };
  const handleCopyShiftDetail = (shiftDetail: any) => {
    setCopiedShift(shiftDetail);
  };
  const onPasteShiftDetail = () => {
    return copiedShift;
  };

  const handleSave = async (): Promise<void> => {
    try {
      const formattedEmployeeData = Object.values(employeeShifts).flatMap(
        (shifts: Shift[]) =>
          shifts.map((shift: Shift) => ({
            id:
              typeof shift.id === 'string' &&
              (shift.id as string).startsWith('new-')
                ? null
                : shift.id,
            start_time: shift.start_time || 0,
            floor_id: shift.floor_id || 0,
            break_time: shift.break_time || 0,
            type: shift.type,
            end_date: shift.end_date || shift.start_date,
            station_id: shift.station_id || 0,
            day_of_week: moment(shift.start_date).day(),
            employee_id: shift.employee_id,
            note: shift.note || '',
            start_date: shift.start_date,
            end_time: shift.end_time || 0,
            deleted: shift.deleted || false,
            color: shift.color || ''
          }))
      );
      const payload = {
        employee_schedule_date_id: schedule.id,
        employee: formattedEmployeeData
      };

      const response = await createEmployeeSchedule(payload as any);

      toast({
        title: 'Success',
        variant: 'success',
        className: 'bg-green-500 text-white',
        description: 'Save was successful!'
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Save failed. Please try again.'
      });
      throw error;
    }
  };
  const handleSaveButton = async () => {
    await handleSave();
    await fetchData();
  };
  const handleShiftChange = async (newShift: any) => {
    const updatedEmployees = { ...employeeTable };

    if (!updatedEmployees[newShift.employee_id]) {
      updatedEmployees[newShift.employee_id] = [];
    }
    const existingShiftIndex = updatedEmployees[newShift.employee_id].findIndex(
      (shift: any) => shift.id === newShift.id
    );
    if (newShift.deleted) {
      if (typeof newShift.id === 'string' && newShift.id.startsWith('new-')) {
        if (existingShiftIndex > -1) {
          updatedEmployees[newShift.employee_id].splice(existingShiftIndex, 1);
        }
      } else if (existingShiftIndex > -1) {
        updatedEmployees[newShift.employee_id][existingShiftIndex] = {
          ...updatedEmployees[newShift.employee_id][existingShiftIndex],
          deleted: true
        };
      }
    } else {
      if (existingShiftIndex > -1) {
        updatedEmployees[newShift.employee_id][existingShiftIndex] = newShift;
      } else {
        if (typeof newShift.id === 'string' && newShift.id.startsWith('new-')) {
          newShift.id = `new-${Date.now()}-${Math.random()}`;
        }
        updatedEmployees[newShift.employee_id].push(newShift);
      }
    }
    setEmployeeTable(updatedEmployees);
    setEmployeeShifts(updatedEmployees);
    setIsModalOpen(false);

    try {
      await handleSave();
    } catch (error) {
      console.error('Error during saving or fetching:', error);
    } finally {
      await fetchData();
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'Week View':
        return (
          <WeekView
            handleShiftClick={handleShiftClick}
            employeesData={employeesData}
            employeesSchedule={employeesSchedule}
            employeesState={employeesState}
            employeeTable={employeeTable}
            floors={floors}
            handlePasteShift={handlePasteShift}
            onDisplayedEmployeesChange={handleDisplayedEmployees}
            onTotalCostsChange={handleTotalCostsChange}
            onTotalHoursChange={handleTotalHoursChange}
            onTotalShiftsRoleChange={handleTotalShiftsRoleEmployees}
            roles={roles}
            schedule={schedule}
            schedules={schedules}
            selectedEmployees={selectedEmployees}
            setEmployeeShifts={setEmployeeShifts}
            setEmployeeTable={setEmployeeTable}
            setSchedules={setSchedules}
            removeEmployeeFromOrder={removeEmployeeFromOrder}
            employeeOrder={employeeOrder}
            setEmployeeOrder={setEmployeeOrder}
          />
        );
      case 'Day View':
        return (
          <DayView schedule={schedule} employeesSchedule={employeesSchedule} />
        );
      case 'Team View':
        return (
          <TeamView schedule={schedule} employeesSchedule={employeesSchedule} />
        );
      case 'Floor View':
        return (
          <FloorView
            schedule={schedule}
            employeesSchedule={employeesSchedule}
          />
        );
      default:
        return null;
    }
  };
  if (activeView === 'Floor View') {
    return (
      <div className="relative mt-4 h-[calc(100dvh-120px)] overflow-y-scroll">
        {renderActiveView()}
      </div>
    );
  }

  return (
    <div className="">
      <div style={{ height: 'calc(100dvh - 300px)', overflowY: 'auto' }}>
        <div
          className="relative flex transform flex-col bg-background"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
          <div className="mb-2 text-xs">{schedule.dateRange}</div>
          <div className="mb-3 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleOpenRequestShiftModal}
                variant={'outline'}
                className="w-full md:w-52"
              >
                Request Availability
              </Button>
              {requestAvailabilityModalOpen && (
                <RequestAvailabilityModal
                  open={requestAvailabilityModalOpen}
                  handleClose={handleCloseRequestAvailabilityModal}
                  onSubmit={handleEmployeeSelect}
                  employees={displayedEmployees}
                  scheduleDateId={schedule.id}
                />
              )}
              <Button
                onClick={handleOpenSubmitShiftModal}
                variant={'outline'}
                className="w-full md:w-52"
              >
                Submit Schedule
              </Button>
              {selectModalOpen && (
                <SubmitScheduleModal
                  open={selectModalOpen}
                  handleClose={handleCloseSelectModal}
                  onSubmit={handleEmployeeSelect}
                  employees={displayedEmployees}
                  scheduleDateId={schedule.id}
                />
              )}
            </div>
            <Button
              variant={'secondary'}
              className="w-full md:w-52"
              onClick={handleHeaderClick}
            >
              <p className="">See Weekly Total</p>
              {/* <p className="text-sm">
                Hours: {formatHoursAndMinutes(totalHoursAllEmployees)}
              </p>
              <p className="text-sm">
                Estimated Total Wages: ${totalCostsAllEmployees.toFixed(2)}
              </p> */}
            </Button>
          </div>

          <BreakDownModal
            open={isBreakDownModalOpen}
            onClose={handleCloseBreakDownModal}
            floors={floors}
            employeeTable={employeeTable}
            roles={roles}
            totalHoursAllEmployees={totalHoursAllEmployees}
            totalCostsAllEmployees={totalCostsAllEmployees}
            formatHoursAndMinutes={formatHoursAndMinutes}
          />
          {/* View Switch Tabs and Buttons */}
          {/* <div className="mb-2 justify-between xgap-8 md:flex">
            <div className="mb-2 flex items-center rounded-full bg-tertiary px-2 md:mb-0">
              <button
                className={`cursor-pointer rounded-full px-6 py-1 text-xs font-medium ${
                  activeView === 'Week View'
                    ? 'text-secondary-foregrand bg-secondary'
                    : 'text-background-foregrand bg-transparent'
                }`}
                onClick={() => setActiveView('Week View')}
              >
                Week View
              </button>

              <button
                className={`cursor-pointer rounded-full px-6 py-1 text-xs font-medium ${
                  activeView === 'Day View'
                    ? 'text-secondary-foregrand bg-secondary'
                    : 'text-background-foregrand bg-transparent'
                }`}
                onClick={() => setActiveView('Day View')}
              >
                Day View
              </button>

              <button
                className={`cursor-pointer rounded-full px-6 py-1 text-xs font-medium ${
                  activeView === 'Team View'
                    ? 'text-secondary-foregrand bg-secondary'
                    : 'text-background-foregrand bg-transparent'
                }`}
                onClick={() => setActiveView('Team View')}
              >
                Team View
              </button>

              <button
                className={`cursor-pointer rounded-full px-6 py-1 text-xs font-medium ${
                  activeView === 'Floor View'
                    ? 'text-secondary-foregrand bg-secondary'
                    : 'text-background-foregrand bg-transparent'
                }`}
                onClick={() => setActiveView('Floor View')}
              >
                Floor View
              </button>
            </div>
          
          </div> */}
          {/* Filter Section */}
          <div className="block items-center justify-between md:flex md:gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm">Filter:</p>
              <DropdownMenu
                open={showSelectBox}
                onOpenChange={setShowSelectBox}
              >
                <DropdownMenuTrigger asChild>
                  <div
                    className="flex min-w-44 cursor-pointer items-center justify-center rounded-full bg-tertiary py-2 text-xs font-bold"
                    onClick={() => setShowSelectBox((prev) => !prev)}
                  >
                    {selectedRole
                      ? roles.find((role: any) => role.id === selectedRole)
                          ?.title
                      : 'All'}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[500px] w-full overflow-y-auto">
                  <DropdownMenuItem onClick={resetToAllEmployees}>
                    All
                  </DropdownMenuItem>
                  {roles.map((role: any) => (
                    <DropdownMenuItem
                      key={role.id}
                      onSelect={() => handleRoleSelect(role.id)}
                    >
                      {role.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Employees Carousel */}
            <div className="relative flex items-center gap-2 overflow-hidden">
              <button
                className="z-10 h-5 w-5 cursor-pointer rounded-full border bg-secondary text-xs"
                onClick={scrollLeft}
              >
                {'<'}
              </button>
              <div
                ref={carouselRef}
                className="scrollbar-hide flex w-full gap-2 overflow-x-auto scroll-smooth whitespace-nowrap py-2"
                style={{ maxWidth: 'calc(100vw - 650px)' }}
              >
                {filteredEmployees.map((employee: any) => (
                  <div
                    className="flex min-w-fit flex-shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full bg-gray-dark px-4 py-2 text-xs"
                    key={employee.id}
                    onClick={() => {
                      handleEmployeeClick(employee);
                    }}
                  >
                    <div
                      className="mr-2 flex h-5 w-5 items-center justify-center rounded-full font-bold"
                      style={{ backgroundColor: getEmployeeColor(employee) }}
                    ></div>
                    {employee.first_name} {employee.last_name}
                  </div>
                ))}
              </div>
              <button
                onClick={scrollRight}
                className="z-10 h-5 w-5 cursor-pointer rounded-full border bg-secondary text-xs"
              >
                {'>'}
              </button>
            </div>
          </div>
          {/* Active View Section */}
          <div className="relative mt-4 max-h-[calc(100dvh-100px)] overflow-y-auto">
            {renderActiveView()}
          </div>
        </div>
      </div>
      {/* Footer Section */}
      <div className="mt-8 flex flex-col justify-between gap-4 md:flex-row">
        {/* Close Button */}
        <Button
          className="flex w-[120px] min-w-20 items-center gap-2"
          onClick={handleClose}
          variant={'outline'}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div className="flex">
          <div className="flex flex-col gap-4 md:flex-row">
            <Button
              className="flex w-[120px] items-center gap-2 rounded"
              onClick={handleRefresh}
              variant={'outline'}
            >
              Refresh
              <RefreshCcw size={16} />
            </Button>
            {displayedEmployees.length > 0 ? (
              <div className="relative">
                <Button
                  className="flex w-[120px] items-center gap-2 rounded"
                  onClick={() => handleCopyShift(selectedShift)}
                  variant={'outline'}
                >
                  Copy
                  <ClipboardCopy size={16} />
                </Button>
                {scheduleCopiedAlert && (
                  <p className="absolute left-[30px] top-[-30px] rounded-lg bg-gray-500 p-1 text-center text-xs text-white opacity-90">
                    Copied!
                  </p>
                )}
              </div>
            ) : (
              <Button
                className="flex w-[120px] items-center gap-2 rounded"
                onClick={handlePasteShift}
                variant={'outline'}
              >
                Paste
                <ClipboardPaste size={16} />
              </Button>
            )}
            <Button
              className="flex w-[120px] items-center gap-2 rounded"
              onClick={handleSaveButton}
            >
              SAVE
              <ArrowDownToLine size={16} />
            </Button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <ShiftDetailModal
          employeeId={selectedEmployee}
          employeesState={employeesState}
          floors={floors}
          mode={modalMode}
          onClose={handleCloseModal}
          onCopyShiftDetail={handleCopyShiftDetail}
          onPasteShiftDetail={onPasteShiftDetail}
          handleShiftChange={handleShiftChange}
          open={isModalOpen}
          roles={roles}
          shift={selectedShift}
        />
      )}
    </div>
  );
};
export default ScheduleView;

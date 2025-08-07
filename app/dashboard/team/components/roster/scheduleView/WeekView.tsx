import React, { useEffect } from 'react';
import moment from 'moment';
import { Shift, EmployeeShifts } from '../../common/types';
import _ from 'lodash';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  TableForFixedHeader,
  TableBody,
  TableHeader,
  TableRow,
  TableCell
} from '@/components/ui/table';

import { Undo2, GripVertical, Clock, DollarSign } from 'lucide-react';
import { getRelativeLuminance } from '@/utils/common';
import { Employee, Floor } from '@/types';

const generateDateRange = (startDate: any, endDate: any) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates.map((date) => date.toISOString().split('T')[0]);
};
const formatTime = (seconds: number) => {
  return moment().startOf('day').add(seconds, 'seconds').format('hh:mm A');
};
interface WeekViewProps {
  employeesData: Employee[];
  employeesSchedule: any;
  employeesState: Employee[];
  employeeTable: EmployeeShifts;
  floors: Floor[];
  handlePasteShift: () => void;
  handleShiftClick: (
    shift: Shift | null,
    mode: string,
    event: React.MouseEvent,
    employeeId: string,
    date: string
  ) => void;
  onDisplayedEmployeesChange: (employees: Employee[]) => void;
  onTotalCostsChange: (totalCosts: number) => void;
  onTotalHoursChange: (totalHours: number) => void;
  onTotalShiftsRoleChange: any;

  roles: any[];
  schedule: any;
  schedules: any[];
  selectedEmployees: Employee[];
  setEmployeeShifts: (shifts: EmployeeShifts) => void;
  setEmployeeTable: (employeeTable: EmployeeShifts) => void;
  setSchedules: (schedules: any[]) => void;
  removeEmployeeFromOrder: (employeeId: string) => void;
  employeeOrder: string[];
  setEmployeeOrder: React.Dispatch<React.SetStateAction<string[]>>;
}
const SortableRow = ({ employeeId, children }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: employeeId });

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: transform ? `translateY(${transform.y}px)` : undefined,
        transition
      }}
      {...attributes}
      {...listeners}
      className="cursor-grab"
    >
      {children}
    </TableRow>
  );
};
const WeekView: React.FC<WeekViewProps> = ({
  handleShiftClick,
  employeesData,
  employeesSchedule = { employee_shifts: [] },
  employeesState,
  employeeTable,
  onDisplayedEmployeesChange,
  onTotalCostsChange,
  onTotalHoursChange,
  onTotalShiftsRoleChange,
  roles,
  schedule,
  setEmployeeShifts,
  setEmployeeTable,

  removeEmployeeFromOrder,
  employeeOrder,
  setEmployeeOrder
}) => {
  useEffect(() => {
    const saved = localStorage.getItem(`employeeOrder_${schedule.id}`);
    let storedEmployeeOrder = saved ? JSON.parse(saved) : [];

    const missingEmployees = Object.keys(employeeTable).filter(
      (id) => !storedEmployeeOrder.includes(id)
    );

    if (missingEmployees.length > 0) {
      storedEmployeeOrder = [...storedEmployeeOrder, ...missingEmployees];

      localStorage.setItem(
        `employeeOrder_${schedule.id}`,
        JSON.stringify(storedEmployeeOrder)
      );
    }

    setEmployeeOrder(storedEmployeeOrder);
  }, [employeeTable, schedule.id]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setEmployeeOrder((items: string[]) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(
          `employeeOrder_${schedule.id}`,
          JSON.stringify(newOrder)
        );
        return newOrder;
      });
    }
  };

  useEffect(() => {
    const transformEmployeeSchedule = (employeesSchedule: any) => {
      if (!employeesSchedule || !employeesSchedule.employee_shifts) {
        return {};
      }
      const employeeShiftsArray = Array.isArray(
        employeesSchedule.employee_shifts
      )
        ? employeesSchedule.employee_shifts
        : Object.values(employeesSchedule.employee_shifts);
      const result: { [key: string]: any } = {};
      employeeShiftsArray.forEach((employee: any) => {
        const employeeId = employee.id;
        const originalEmployee = employeesData.find(
          (originalEmp: any) => originalEmp.id === employeeId
        );
        result[employeeId] = employee?.shifts?.map((shift: any) => {
          const startSeconds = shift.start_time;
          const endSeconds = shift.end_time;
          const breakTimeSeconds = shift.break_time;
          let totalSeconds = 0;

          const startDateTime = moment(shift.start_date)
            .startOf('day')
            .add(startSeconds, 'seconds');
          const endDateTime = moment(shift.end_date)
            .startOf('day')
            .add(endSeconds, 'seconds');
          if (endDateTime.isSameOrAfter(startDateTime)) {
            totalSeconds = endSeconds - startSeconds - breakTimeSeconds;
          } else {
            totalSeconds = endSeconds + 86400 - startSeconds - breakTimeSeconds;
          }
          const dayNumber = moment(shift.start_date).day() + 1;
          const rate =
            originalEmployee?.pay_rates?.find(
              (rate: any) => rate.day_number === dayNumber
            )?.rate || 0;
          const totalCost = (totalSeconds / 3600) * rate;
          const TotalShifts =
            employee?.shifts?.filter((shift: any) => shift.type === 1)
              ?.length || 0;
          return {
            id: shift.id,
            employee_id: shift.employee_id,
            first_name: originalEmployee?.first_name || '',
            last_name: originalEmployee?.last_name || '',
            employeeColor: originalEmployee?.color || '',
            start_date: shift.start_date,
            end_time: shift.end_time || 0,
            break_time: shift.break_time || 0,
            start_time: shift.start_time || 0,
            type: shift.type || '',
            station_id: shift.station_id || '',
            note: shift.note || '',
            deleted: shift.deleted || false,
            totalHours: totalSeconds > 0 ? totalSeconds : 0,
            totalCost: totalCost > 0 ? totalCost : 0,
            pay_rates: originalEmployee?.pay_rates || [],
            floor_id: shift.floor_id || '',
            employment_role_id: originalEmployee?.employment_role_id || null,
            photo: originalEmployee?.photo || null,
            totalShifts: TotalShifts > 0 ? TotalShifts : 0,
            color: shift.color || ''
          };
        });
      });
      return result;
    };
    const formattedSchedule = transformEmployeeSchedule(employeesSchedule);
    if (!_.isEqual(formattedSchedule, employeeTable)) {
      setEmployeeTable(formattedSchedule);
      setEmployeeShifts(formattedSchedule);
    }
  }, [employeesSchedule, employeesState]);

  useEffect(() => {
    if (employeesSchedule.employee_shifts) {
      onDisplayedEmployeesChange(employeesSchedule.employee_shifts);
    }
  }, [employeesSchedule, onDisplayedEmployeesChange]);
  const dates = generateDateRange(schedule.start_date, schedule.end_date);
  useEffect(() => {
    // Total Hours
    const totalHoursByEmployee: { [key: string]: number } = {};
    Object.keys(employeeTable).forEach((employeeId) => {
      const shifts = employeeTable[employeeId] || [];
      const totalHours = shifts
        .filter((shift: any) => !shift.deleted && shift.type === 1)
        .reduce((acc: any, shift: any) => acc + shift.totalHours, 0);
      totalHoursByEmployee[employeeId] = totalHours;
    });

    const totalHoursAllEmployees = Object.values(totalHoursByEmployee).reduce(
      (acc, totalHours) => acc + totalHours,
      0
    );
    if (onTotalHoursChange) {
      onTotalHoursChange(totalHoursAllEmployees);
    }
    // Total Costs
    const totalCostsByEmployee: { [key: string]: number } = {};
    Object.keys(employeeTable).forEach((employeeId) => {
      const shifts = employeeTable[employeeId] || [];
      const totalCosts = shifts
        .filter((shift: any) => !shift.deleted && shift.type === 1)
        .reduce((acc: any, shift: any) => acc + shift.totalCost, 0);
      totalCostsByEmployee[employeeId] = totalCosts;
    });
    const totalCostsAllEmployees = Object.values(totalCostsByEmployee).reduce(
      (acc, totalCosts) => acc + totalCosts,
      0
    );
    if (onTotalCostsChange) {
      onTotalCostsChange(totalCostsAllEmployees);
    }
  }, [employeeTable, setEmployeeShifts]);

  useEffect(() => {
    const totalShiftsRoleEmployees: { [key: string]: number } = {};
    const mergedEmployeesState = employeesState.map((employee: any) => {
      const updatedShifts = employeeTable[employee.id] || [];
      const mergedShifts = [...employee.shifts];
      updatedShifts.forEach((updatedShift: any) => {
        const existingShiftIndex = mergedShifts.findIndex(
          (shift: any) => shift.id === updatedShift.id
        );
        if (existingShiftIndex > -1) {
          mergedShifts[existingShiftIndex] = updatedShift;
        } else {
          mergedShifts.push(updatedShift);
        }
      });
      return {
        ...employee,
        shifts: mergedShifts
      };
    });
    roles.forEach((role: any) => {
      const totalShifts = mergedEmployeesState
        .filter((employee: any) => employee.employment_role_id === role.id)
        .reduce((acc: any, employee: any) => {
          return (
            acc +
            employee.shifts.filter(
              (shift: any) => shift.type === 1 && !shift.deleted
            ).length
          );
        }, 0);
      totalShiftsRoleEmployees[role.id] = totalShifts;
    });
    onTotalShiftsRoleChange(totalShiftsRoleEmployees);
  }, [employeeTable]);

  const getEmployeeName = (employeeId: any) => {
    if (!employeeId) return 'Unknown';
    const employeeArray = Array.isArray(employeesSchedule?.employee_shifts)
      ? employeesSchedule.employee_shifts
      : [];

    const employeeData =
      employeeArray.find(
        (emp: any) => emp.id.toString() === employeeId.toString()
      ) ||
      employeesData.find(
        (emp: any) => emp.id.toString() === employeeId.toString()
      );

    return employeeData?.first_name + ' ' + employeeData?.last_name;
  };

  return (
    <TableForFixedHeader>
      <TableHeader>
        <TableRow>
          <TableCell className="w-1/6">Employee</TableCell>
          {dates.map((date) => (
            <TableCell key={date} className="text-center">
              {moment(date).format('ddd, MMM D')}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={employeeOrder}
            strategy={verticalListSortingStrategy}
          >
            {employeeOrder.map((employeeId) => (
              <SortableRow key={employeeId} employeeId={employeeId}>
                <TableCell className="flex-1">
                  <div className="">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} />
                      {(!employeeTable[employeeId] ||
                        employeeTable[employeeId].length === 0) && (
                        <Undo2
                          className="cursor-pointer"
                          size={16}
                          onClick={() => removeEmployeeFromOrder(employeeId)}
                        />
                      )}
                      <div className="">
                        <p className="text-sm">{getEmployeeName(employeeId)}</p>
                        <div className="mt-1 flex flex-wrap text-xs">
                          <div className="mr-2 flex items-center gap-1">
                            <Clock size={10} />
                            <p>
                              {(() => {
                                const totalSeconds = employeeTable[employeeId]
                                  ?.filter(
                                    (shift: any) =>
                                      shift.type === 1 && !shift.deleted
                                  )
                                  .reduce(
                                    (acc: number, shift: any) =>
                                      acc + (shift.totalHours || 0),
                                    0
                                  );
                                const hours = Math.floor(totalSeconds / 3600);
                                const minutes = Math.floor(
                                  (totalSeconds % 3600) / 60
                                );

                                return `${hours
                                  .toString()
                                  .padStart(2, '0')}h${minutes
                                  .toString()
                                  .padStart(2, '0')}m`;
                              })()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={10} />
                            <p>
                              {employeeTable[employeeId]
                                ?.filter(
                                  (shift: any) =>
                                    shift.type === 1 && !shift.deleted
                                )
                                .reduce(
                                  (acc: number, shift: any) =>
                                    acc + (shift.totalCost || 0),
                                  0
                                )
                                .toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
                {dates.map((date) => {
                  const shiftsForDate = employeeTable[employeeId]?.filter(
                    (shift: any) => shift.start_date === date && !shift.deleted
                  );
                  return (
                    <TableCell
                      key={date}
                      className="w-[12%] flex-1 cursor-pointer text-center align-top"
                    >
                      <div className="flex h-full w-full flex-col gap-1">
                        {!!shiftsForDate?.length &&
                          shiftsForDate.map((shift: any) => {
                            const bgColor =
                              shift.color ||
                              (shift.type === 1
                                ? '#aafaA1'
                                : shift.type === 2
                                ? '#2a5bd9'
                                : '#757576');
                            const calculatedTextColor =
                              getRelativeLuminance(bgColor);
                            return (
                              <div
                                key={shift.id}
                                style={{
                                  background: bgColor,
                                  fontSize: '0.8rem',
                                  color: calculatedTextColor
                                }}
                                className="cursor-pointer rounded-lg border py-2 text-xs transition-all hover:border-primary hover:opacity-80"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShiftClick(
                                    shift,
                                    'edit',
                                    e,
                                    employeeId,
                                    date
                                  );
                                }}
                              >
                                {shift.type === 1 ? (
                                  <span className="whitespace-nowrap">
                                    {formatTime(shift.start_time)} <wbr />-{' '}
                                    {formatTime(shift.end_time)}
                                  </span>
                                ) : shift.type === 2 ? (
                                  'Requested Off'
                                ) : (
                                  'On Leave'
                                )}
                              </div>
                            );
                          })}
                        <div
                          onClick={(e) => {
                            handleShiftClick(null, 'add', e, employeeId, date);
                          }}
                          className="rounded-lg border bg-secondary py-1 transition-all hover:border-primary"
                        >
                          <p className="text-center">+</p>
                        </div>
                      </div>
                    </TableCell>
                  );
                })}
              </SortableRow>
            ))}
          </SortableContext>
        </DndContext>
      </TableBody>
    </TableForFixedHeader>
  );
};
export default WeekView;

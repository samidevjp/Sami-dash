import React, { useEffect, useState } from 'react';
import { Modal } from '@mui/material';
import { X } from 'lucide-react';
import ProfileAvatar from '../../common/ProfileAvatar';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Employee, Floor } from '@/types';

interface Role {
  id: number;
  title: string;
}
interface BreakDownModalProps {
  employeeTable: any;
  floors: Floor[];
  formatHoursAndMinutes: (totalSeconds: number) => string;
  onClose: () => void;
  open: boolean;
  roles: Role[];
  totalCostsAllEmployees: number;
  totalHoursAllEmployees: number;
}
const BreakDownModal: React.FC<BreakDownModalProps> = ({
  employeeTable,
  floors,
  formatHoursAndMinutes,
  onClose,
  open,
  roles,
  totalCostsAllEmployees,
  totalHoursAllEmployees
}: any) => {
  const [employeesByFloor, setEmployeesByFloor] = useState<{
    [floorId: number]: Employee[];
  }>({});
  const [staffCount, setStaffCount] = useState<{ [roleId: number]: number }>(
    {}
  );
  const [roleShiftsCount, setRoleShiftsCount] = useState<{
    [roleId: number]: number;
  }>({});
  const [totalShiftsCount, setTotalShiftsCount] = useState<any>(0);
  const [totalHours, setTotalHours] = useState<{ [roleId: number]: number }>(
    {}
  );
  const [totalCosts, setTotalCosts] = useState<{ [roleId: number]: number }>(
    {}
  );
  useEffect(() => {
    // Get employees for each floor_id^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    const employeesByFloor = floors.reduce((acc: any, floor: any) => {
      acc[floor.id] = Object.values(employeeTable).filter(
        (shifts: any) =>
          Array.isArray(shifts) &&
          shifts.some(
            (shift: any) =>
              shift.floor_id === floor.id &&
              shift.floor_id !== '' &&
              (shift.deleted === undefined || shift.deleted === false)
          )
      );
      return acc;
    }, {});
    setEmployeesByFloor(employeesByFloor);
    // Get staff count for each role_id^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    const staffCount = roles.reduce((acc: any, role: any) => {
      acc[role.id] = Object.values(employeeTable).filter((shifts: any) =>
        shifts.some(
          (shift: any) =>
            shift.employment_role_id === role.id &&
            (shift.deleted === undefined || shift.deleted === false)
        )
      ).length;
      return acc;
    }, {});
    setStaffCount(staffCount);
    // Get shifts count for each role_id^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    const roleShiftsCount = roles.reduce((acc: any, role: any) => {
      acc[role.id] = Object.values(employeeTable).reduce(
        (acc: any, shifts: any) => {
          const validShifts = shifts.filter(
            (shift: any) =>
              shift.employment_role_id === role.id &&
              (shift.deleted === undefined || shift.deleted === false) &&
              shift.type === 1
          );
          return acc + validShifts.length;
        },
        0
      );
      return acc;
    }, {});
    setRoleShiftsCount(roleShiftsCount);
    const totalShifts = Object.values(roleShiftsCount).reduce(
      (acc: any, count: any) => acc + count,
      0
    );
    setTotalShiftsCount(totalShifts);
    // Get total hours for each role_id^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    const roleTotalHours = roles.reduce((acc: any, role: any) => {
      const totalHours = Object.values(employeeTable).reduce(
        (acc: any, shifts: any) => {
          const validShifts = shifts.filter(
            (shift: any) =>
              shift.employment_role_id === role.id &&
              (shift.deleted === undefined || shift.deleted === false) &&
              shift.type === 1
          );
          const totalHoursForRole = validShifts.reduce(
            (sum: number, shift: any) => sum + shift.totalHours,
            0
          );
          return acc + totalHoursForRole;
        },
        0
      );
      acc[role.id] = totalHours;
      return acc;
    }, {});
    setTotalHours(roleTotalHours);
    // Get total costs for each role_id^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    const roleTotalCosts = roles.reduce((acc: any, role: any) => {
      const totalCosts = Object.values(employeeTable).reduce(
        (acc: any, shifts: any) => {
          const validShifts = shifts.filter(
            (shift: any) =>
              shift.employment_role_id === role.id &&
              (shift.deleted === undefined || shift.deleted === false) &&
              shift.type === 1
          );
          const totalCostsForRole = validShifts.reduce(
            (sum: number, shift: any) => sum + shift.totalCost,
            0
          );
          return acc + totalCostsForRole;
        },
        0
      );
      acc[role.id] = totalCosts;
      return acc;
    }, {});
    setTotalCosts(roleTotalCosts);
  }, [open]);
  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative top-1/2 mx-auto w-4/5 max-w-[800px] -translate-y-1/2 transform rounded-lg bg-background p-8">
        <Button
          variant={'ghost'}
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X size={24} />
        </Button>
        <p className="mb-8 text-xl font-bold">Break down</p>
        <div className="flex">
          {/* Floors section */}
          <div className="max-h-[70vh] flex-1 overflow-y-auto">
            {floors.map((floor: any) => {
              const displayedEmployeeIds = new Set<number>();
              return (
                <div key={floor.id} className="mb-8">
                  <Label className="mb-2 text-muted-foreground">
                    {floor.floor_name}
                  </Label>
                  <div className="mr-6 flex flex-wrap justify-start gap-2">
                    {employeesByFloor[floor.id]?.flat().map((employee: any) => {
                      if (displayedEmployeeIds.has(employee.employee_id)) {
                        return null;
                      }
                      displayedEmployeeIds.add(employee.employee_id);
                      return (
                        <div key={employee.employee_id}>
                          <ProfileAvatar
                            profilePicUrl={employee?.photo}
                            firstName={employee?.first_name}
                            lastName={employee?.last_name}
                            color={employee?.color}
                            width={40}
                            height={40}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Roles section */}
          <div className="max-h-[70vh] w-full flex-1 overflow-y-auto">
            {roles.map((role: any) => {
              return (
                <div key={role.id} className="mb-4">
                  <Label className="mb-2 text-muted-foreground">
                    {role.title}
                  </Label>
                  <div className="rounded-lg border border-border p-2 text-center">
                    <div className="flex justify-center gap-8">
                      <div>
                        <p>{staffCount[role.id.toString()] ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Staff</p>
                      </div>
                      <div>
                        <p>{roleShiftsCount[role.id.toString()] ?? 0}</p>
                        <p className="text-xs text-muted-foreground">
                          Total Shifts
                        </p>
                      </div>
                      <div>
                        <p>{((totalHours[role.id] ?? 0) / 3600).toFixed(1)}h</p>
                        <p className="text-xs text-muted-foreground">
                          Total Hours
                        </p>
                      </div>
                      <div>
                        <p>$ {(totalCosts[role.id] ?? 0).toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">
                          Est Cost
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 border-t border-border pt-4 text-center">
          <div className="flex justify-center gap-8">
            <div>
              {totalShiftsCount}
              <p className="text-sm text-muted-foreground">Total Shifts</p>
            </div>
            <div>
              <p>{formatHoursAndMinutes(totalHoursAllEmployees)}</p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
            <div>
              <p>${totalCostsAllEmployees.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Est Cost</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default BreakDownModal;

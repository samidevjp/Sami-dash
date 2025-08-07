import React, { useEffect, useState } from 'react';
import { X, ClipboardCopy, ClipboardPaste } from 'lucide-react';
import moment from 'moment';
import ProfileAvatar from '../../common/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
interface ShiftDetailModalProps {
  employeeId: any;
  employeesState: any[];
  floors: any[];
  mode: string;
  onClose: () => void;
  onCopyShiftDetail: (shiftDetail: any) => void;
  onPasteShiftDetail: () => any;
  handleShiftChange: (shift: any) => void;
  open: boolean;

  roles: any[];

  shift: any;
}
const ShiftDetailModal: React.FC<ShiftDetailModalProps> = ({
  employeeId,
  employeesState,
  floors,
  mode = 'edit',
  onClose,
  onCopyShiftDetail,
  onPasteShiftDetail,
  handleShiftChange = {},
  open,
  roles,
  shift = {}
}: any) => {
  const [shiftColor, setShiftColor] = useState<string>(
    shift.color || '#aafaA1'
  );

  const [previousColor, setPreviousColor] = useState<string>('#aafaA1');
  const [isResetColor, setIsResetColor] = useState<boolean>(true);
  const [shiftCoopiedAlert, setShiftCoopiedAlert] = useState<boolean>(false);
  const employee = employeesState.find(
    (emp: any) => emp.id === parseInt(employeeId, 10)
  );
  const employeeName = employee
    ? `${employee?.first_name} ${employee?.last_name}`
    : 'Unknown Employee';
  const employeeRole = roles.find(
    (role: any) => role.id === employee?.employment_role_id
  );
  const displayEmployeeRole = employeeRole ? `${employeeRole?.title}` : '';
  const isEditMode = mode === 'edit';
  const [startTime, setStartTime] = useState(
    shift.start_time
      ? moment()
          .startOf('day')
          .add(shift?.start_time, 'seconds')
          .format('HH:mm')
      : '00:00'
  );
  const [endTime, setEndTime] = useState(
    shift?.end_time
      ? moment()
          .startOf('day')
          .add(shift?.end_time, 'seconds')
          .format('HH:mm')
      : '12:00'
  );
  const [breakTime, setBreakTime] = useState<any>(
    shift?.break_time ? shift.break_time / 3600 : 0
  );
  const [section, setSection] = useState(shift?.floor_id || '');
  const [station, setStation] = useState(shift?.station_id || '');
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] =
    useState<boolean>(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState<boolean>(false);
  const [type, setType] = useState(shift?.type || 1);
  const [notes, setNotes] = useState(shift?.note || '');
  const existingShift = shift;
  const [totalHours, setTotalHours] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const setDefaultColors = (checked: boolean) => {
    if (checked) {
      setPreviousColor(shiftColor);
      if (type === 1) {
        setShiftColor('#aafaA1');
      } else if (type === 2) {
        setShiftColor('#2a5bd9');
      } else if (type === 3) {
        setShiftColor('#757576');
      } else {
        setShiftColor('#aafaA1');
      }
    } else {
      setShiftColor(previousColor);
    }
    setIsResetColor(checked);
  };
  // initial values and flugs
  const initialStartTime = shift.start_time
    ? moment().startOf('day').add(shift.start_time, 'seconds').format('HH:mm')
    : '00:00';
  const initialEndTime = shift?.end_time
    ? moment().startOf('day').add(shift.end_time, 'seconds').format('HH:mm')
    : '12:00';
  const initialBreakTime = shift.break_time / 3600 || 0;
  const initialSection = shift.floor_id || '';
  const initialStation = shift.station_id || '';
  const initialType = shift.type || 1;
  const initialNotes = shift.note || '';
  const isShiftModified =
    startTime !== initialStartTime ||
    endTime !== initialEndTime ||
    breakTime !== initialBreakTime ||
    section !== initialSection ||
    station !== initialStation ||
    type !== initialType ||
    notes !== initialNotes;
  useEffect(() => {
    const calculateTotalHours = () => {
      if (type === 2 || type === 3) {
        return 0;
      }
      const startSeconds = moment(startTime, 'HH:mm').diff(
        moment().startOf('day'),
        'seconds'
      );
      const endSeconds = moment(endTime, 'HH:mm').diff(
        moment().startOf('day'),
        'seconds'
      );
      const breakTimeSeconds = parseFloat(breakTime) * 3600;
      let totalSeconds = 0;
      if (endSeconds >= startSeconds) {
        totalSeconds = endSeconds - startSeconds - breakTimeSeconds;
      } else {
        totalSeconds = endSeconds + 86400 - startSeconds - breakTimeSeconds;
      }
      const totalHours = totalSeconds / 3600;
      return totalHours > 0 ? totalHours : 0;
    };
    const calculateTotalCost = () => {
      if (type === 2 || type === 3) {
        return 0;
      }
      let dayNumber = moment(shift.start_date).day();
      dayNumber = dayNumber === 0 ? 7 : dayNumber;
      const rate =
        employee?.pay_rates?.find((rate: any) => rate.day_number === dayNumber)
          ?.rate || 0;
      return calculateTotalHours() * rate;
    };
    setTotalHours(calculateTotalHours());
    setTotalCost(calculateTotalCost());
  }, [startTime, endTime, breakTime, shift, employee, type]);
  const handleDeleteShift = () => {
    const deletedShift = {
      ...existingShift,
      deleted: true
    };
    handleShiftChange(deletedShift);

    onClose();
  };
  const handleUpdateShift = () => {
    const updatedShift = {
      ...existingShift,
      start_time: moment(startTime, 'HH:mm').diff(
        moment().startOf('day'),
        'seconds'
      ),
      end_time: moment(endTime, 'HH:mm').diff(
        moment().startOf('day'),
        'seconds'
      ),
      break_time: parseFloat(breakTime) * 3600,
      floor_id: section,
      station_id: station,
      type,
      note: notes,
      totalHours: totalHours * 3600,
      totalCost: totalCost,
      color: shiftColor
    };
    handleShiftChange(updatedShift);
    onClose();
  };
  const handleAddShift = () => {
    if (!isShiftModified) {
      onClose();
      return;
    }
    const addShift = {
      id: `new-${Date.now()}`,
      employee_id: parseInt(employeeId, 10),
      start_time: moment(startTime, 'HH:mm').diff(
        moment().startOf('day'),
        'seconds'
      ),
      end_time: moment(endTime, 'HH:mm').diff(
        moment().startOf('day'),
        'seconds'
      ),
      break_time: parseFloat(breakTime) * 3600,
      floor_id: section,
      station_id: station,
      type: type || 1,
      note: notes,
      start_date: shift.start_date,
      totalHours: totalHours * 3600,
      totalCost: totalCost,
      employment_role_id: employee?.employment_role_id,
      color: shiftColor
    };
    handleShiftChange(addShift);

    onClose();
  };
  const formatHoursAndMinutes = (totalHours: number) => {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours % 1) * 60);
    return `${hours}h ${minutes}m`;
  };
  const handleCopyShiftDetail = () => {
    const copiedShiftDetail = {
      start_time: moment(startTime, 'HH:mm').diff(
        moment().startOf('day'),
        'seconds'
      ),
      end_time: moment(endTime, 'HH:mm').diff(
        moment().startOf('day'),
        'seconds'
      ),
      break_time: parseFloat(breakTime) * 3600,
      floor_id: section,
      station_id: station,
      type,
      note: notes
    };
    onCopyShiftDetail(copiedShiftDetail);
    setShiftCoopiedAlert(true);
    setTimeout(() => {
      setShiftCoopiedAlert(false);
    }, 1000);
  };
  const handlePasteShiftDetail = () => {
    const copiedShiftDetail = onPasteShiftDetail();
    if (copiedShiftDetail) {
      setStartTime(
        moment()
          .startOf('day')
          .add(copiedShiftDetail.start_time, 'seconds')
          .format('HH:mm')
      );
      setEndTime(
        moment()
          .startOf('day')
          .add(copiedShiftDetail.end_time, 'seconds')
          .format('HH:mm')
      );
      setBreakTime(copiedShiftDetail.break_time / 3600);
      setSection(copiedShiftDetail.floor_id);
      setStation(copiedShiftDetail.station_id);
      setType(copiedShiftDetail.type);
      setNotes(copiedShiftDetail.note);
    }
  };
  const handleModalClose = () => {
    if (isEditMode) {
      handleUpdateShift();
    } else {
      handleAddShift();
    }
  };
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        open ? 'block' : 'hidden'
      }`}
    >
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={handleModalClose}
      ></div>
      <div className="relative max-h-[90vh] w-[450px] overflow-y-auto rounded-lg bg-background p-8 pt-12 shadow-lg">
        <button onClick={handleModalClose} className="absolute right-4 top-4">
          <X size={24} />
        </button>
        <div className="relative">
          <div
            className=" absolute left-0 top-0 h-full w-[5px] rounded-lg shadow-inner"
            style={{
              backgroundColor: employee?.color
            }}
          ></div>
          <div className="mb-2 flex items-center pl-4">
            <ProfileAvatar
              profilePicUrl={employee?.photo}
              firstName={employee?.first_name}
              lastName={employee?.last_name}
              color={employee?.color}
              width={50}
              height={50}
            />
            <p className="ml-2 flex-1 text-xl font-bold">{employeeName}</p>
            {isEditMode ? (
              <div className="relative">
                <Button
                  className="flex items-center gap-2 rounded-full"
                  onClick={handleCopyShiftDetail}
                  variant={'tertiary'}
                >
                  Copy <ClipboardCopy size={16} />
                </Button>
                {shiftCoopiedAlert && (
                  <p className="absolute left-0 top-[-30px] rounded-lg bg-tertiary p-1 text-center text-xs opacity-90">
                    Copied!
                  </p>
                )}
              </div>
            ) : (
              <Button
                className="flex w-[120px] items-center gap-2 rounded-full"
                onClick={handlePasteShiftDetail}
                variant={'tertiary'}
              >
                Paste
                <ClipboardPaste size={16} />
              </Button>
            )}
          </div>
          <p className="pl-4 text-sm text-muted-foreground">
            {displayEmployeeRole}
          </p>
        </div>
        {/* Form Fields */}
        <div className="mt-8 border-b">
          <p className="mb-2 font-bold">
            {moment(shift.start_date).format('ddd, MMM D')}
          </p>
          {/* Start Time */}
          <div className="mb-4 flex items-center justify-between  border-muted-foreground">
            <Label className="text-muted-foreground">Start Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mb-1 w-56"
            />
          </div>
          {/* End Time */}
          <div className="mb-4 flex items-center justify-between  border-muted-foreground">
            <Label className="text-muted-foreground">End Time</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mb-1 w-56"
            />
          </div>
          {/* Break Time */}
          <div className="mb-4 flex items-center justify-between  border-muted-foreground">
            <Label className="text-muted-foreground">Break Time (hours)</Label>
            <Input
              type="number"
              value={breakTime}
              onChange={(e) => setBreakTime(e.target.value)}
              className="mb-1 w-56"
            />
          </div>
          {/* Section */}
          <div className="mb-4 flex items-center justify-between  border-muted-foreground">
            <Label className="text-muted-foreground">Floor</Label>
            <DropdownMenu
              open={isSectionDropdownOpen}
              onOpenChange={setIsSectionDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-56 justify-start">
                  {section
                    ? floors.find((floor: any) => floor.id === section)
                        ?.floor_name || 'Select Section'
                    : 'Select Section'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {floors.map((floor: any) => (
                  <DropdownMenuItem
                    key={floor.id}
                    onSelect={() => setSection(floor.id)}
                  >
                    {floor.floor_name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Station */}
          {/* TODO Define the behavior for this section once requirements are clear. */}
          {/* <div className="mb-4 flex items-center justify-between  border-muted-foreground">
            <Label className="text-muted-foreground">Station</Label>
            <Input
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="mb-1 w-56"
            />
          </div> */}
          {/* Type */}
          <div className="mb-4 flex items-center justify-between  border-muted-foreground">
            <Label className="text-muted-foreground">Type</Label>
            <DropdownMenu
              open={isTypeDropdownOpen}
              onOpenChange={setIsTypeDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mb-1 w-56 justify-start">
                  {type === 1
                    ? 'Shift'
                    : type === 2
                    ? 'Requested Off'
                    : 'On Leave'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={(e) => {
                    setType(1);
                    setPreviousColor('#aafaA1');
                    if (isResetColor) {
                      setShiftColor('#aafaA1');
                    }
                  }}
                >
                  Shift
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    setType(2);
                    setPreviousColor('#2a5bd9');
                    if (isResetColor) {
                      setShiftColor('#2a5bd9');
                    }
                  }}
                >
                  Requested Off
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    setType(3);
                    setPreviousColor('#757576');
                    if (isResetColor) {
                      setShiftColor('#757576');
                    }
                  }}
                >
                  On Leave
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Notes */}
          {/* TODO Define the behavior for this section once requirements are clear. */}
          <div className="mb-4 flex items-center justify-between  border-muted-foreground">
            <Label className="text-muted-foreground">Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mb-1 w-56"
            />
          </div>
          {/* Color picker */}
          <div className="mb-4 flex justify-between  border-muted-foreground">
            <Label className="text-muted-foreground">Color</Label>
            <div className="w-56">
              <div className="flex w-28 items-center overflow-hidden rounded-lg">
                <Input
                  type="color"
                  value={shiftColor}
                  onChange={(e) => setShiftColor(e.target.value)}
                  className="h-10 min-w-10 max-w-10 cursor-pointer border-none p-0"
                  style={{ backgroundColor: 'transparent' }}
                  disabled={isResetColor}
                />
                <Input
                  type="text"
                  value={shiftColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value.startsWith('#')) {
                      setShiftColor(`#${value}`);
                    } else {
                      setShiftColor(value);
                    }
                  }}
                  className={
                    isResetColor
                      ? 'w-full border-none p-2 text-center text-xs text-gray-500'
                      : 'w-full border-none p-2 text-center text-xs'
                  }
                  disabled={isResetColor}
                />
              </div>
              <Label className="mt-2 flex cursor-pointer items-center gap-2">
                <span className="mr-2 text-xs text-muted-foreground">
                  Use to default colors
                </span>
                <Switch
                  checked={isResetColor}
                  onCheckedChange={(checked) => setDefaultColors(checked)}
                />
              </Label>
            </div>
          </div>
        </div>
        {/* Total Hours & Cost */}
        <div className="mt-4 text-center">
          <p>
            <span className="text-sm">Total Hours & Cost : </span>
            <span className="text-lg font-bold">
              {formatHoursAndMinutes(totalHours)} - ${totalCost.toFixed(2)}
            </span>
          </p>
        </div>
        {/* Buttons */}
        <div className="mt-4 text-center">
          {isEditMode ? (
            <Button onClick={handleDeleteShift} variant={'danger'}>
              Delete Shift
            </Button>
          ) : (
            <Button
              variant={'tertiary'}
              onClick={handleAddShift}
              disabled={!isShiftModified}
            >
              Add Shift
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ShiftDetailModal;

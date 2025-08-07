'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import { useApi } from '@/hooks/useApi';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import moment from 'moment';

interface SpecialDay {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  is_active: number;
  deleted?: boolean;
  type: number;
  is_open: number;
  status: number;
  shifts: any[];
  date?: string;
}

const SpecialDaysForm = () => {
  const { getSpecialDays, saveSpecialDays, getFloors } = useApi();
  const [floor, setFloor] = useState<any>(null);
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [currentDay, setCurrentDay] = useState<Partial<SpecialDay>>({
    id: 0,
    name: '',
    start_date: '',
    end_date: '',
    is_recurring: false,
    is_active: 1,
    type: 1,
    is_open: 1,
    status: 1,
    shifts: [],
    deleted: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [errors, setErrors] = useState<{
    name?: string;
    date?: string;
    time?: string;
  }>({});
  const [deleteTarget, setDeleteTarget] = useState<SpecialDay | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [currentShiftDay, setCurrentShiftDay] = useState<SpecialDay | null>(
    null
  );
  const [editingShift, setEditingShift] = useState<any | null>(null);
  const [shiftErrors, setShiftErrors] = useState<{
    name?: string;
    time?: string;
    floor?: string;
  }>({});
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  // const formatDate = (str: string) => new Date(str).toLocaleDateString();
  const formatDate = (str: string) => moment(str).format('DD MMM, YYYY');

  //  -----------------------------------
  // Local storage functions
  //  -----------------------------------
  // TODO wait for API to implement
  const LOCAL_SHIFT_KEY = 'local_special_day_shifts';
  const loadLocalShifts = (): Record<number, any[]> => {
    const stored = localStorage.getItem(LOCAL_SHIFT_KEY);
    return stored ? JSON.parse(stored) : {};
  };
  const saveLocalShifts = (data: Record<number, any[]>) => {
    localStorage.setItem(LOCAL_SHIFT_KEY, JSON.stringify(data));
  };

  const timeToSeconds = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  const secondsToTime = (sec: number) => {
    const h = Math.floor(sec / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, '0');
    return `${h}:${m}`;
  };
  // -----------------------------------
  // API functions
  // -----------------------------------

  const handleGetFloors = async () => {
    try {
      const response = await getFloors();
      if (response.code === 'OK') {
        setFloor(response.data.floors);
      } else {
        console.error('Failed to fetch floors:', response.data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
      return [];
    }
  };
  const fetchSpecialDays = async () => {
    try {
      const res = await getSpecialDays();
      const localShiftMap = loadLocalShifts();
      const merged = res.special_days.map((day: SpecialDay) => ({
        ...day,
        shifts: localShiftMap[day.id] ?? []
      }));
      setSpecialDays(merged);
    } catch (err) {
      console.error('Error fetching:', err);
    }
  };
  useEffect(() => {
    fetchSpecialDays();
    handleGetFloors();
  }, []);

  //  -----------------------------------
  // Event handlers
  //  -----------------------------------
  const validateSpecialDay = (): boolean => {
    const errors: { name?: string; date?: string } = {};
    if (!currentDay.name) {
      errors.name = 'Name is Required';
    }
    if (!dateRange || !dateRange.from) {
      errors.date = 'Select a date';
    }
    const normalizeDate = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (dateRange?.from) {
      const from = normalizeDate(dateRange.from);
      const to = dateRange.to ? normalizeDate(dateRange.to) : from;

      const hasOverlap = specialDays.some((day) => {
        if (day.id === currentDay.id || day.deleted) return false;

        const existingFrom = normalizeDate(new Date(day.start_date));
        const existingTo = normalizeDate(new Date(day.end_date));

        return from <= existingTo && to >= existingFrom;
      });

      if (hasOverlap) {
        errors.date = 'Date overlaps with an existing special day';
      }
    }

    setErrors(errors);
    console.log('errors', errors);
    return Object.keys(errors).length === 0;
  };
  const handleEdit = (day: SpecialDay) => {
    setCurrentDay(day);
    setIsEditing(true);
    setDateRange({
      from: new Date(day.start_date),
      to: new Date(day.end_date)
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentDay({
      id: 0,
      name: '',
      is_recurring: false,
      is_active: 1,
      type: 1,
      is_open: 1,
      status: 1,
      shifts: [],
      deleted: false,
      start_date: '',
      end_date: ''
    });
    setDateRange(undefined);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateSpecialDay()) return;
    const newErrors: { name?: string; date?: string } = {};
    if (!currentDay.name) newErrors.name = 'Required';
    if (!dateRange || !dateRange.from) newErrors.date = 'Select a date';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
    const to = dateRange?.to
      ? format(dateRange.to, 'yyyy-MM-dd')
      : format(dateRange?.from!, 'yyyy-MM-dd');

    const type = dateMode === 'single' ? 1 : 2;
    const start_date = `${from}`;
    const end_date = `${to}`;

    const payload = {
      special_days: [
        {
          id: currentDay.id || 0,
          name: currentDay.name || '',
          type,
          start_date,
          end_date,
          is_recurring: currentDay.is_recurring ?? false,
          is_open: Number(currentDay.is_open ?? 1),
          is_active: currentDay.is_active ?? 1,
          deleted: currentDay.deleted ?? false,
          status: 1,
          shifts: []
        }
      ]
    };

    try {
      await saveSpecialDays(payload);
      setIsModalOpen(false);
      fetchSpecialDays();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const updatedList = specialDays.map((d) => {
      const updatedDay = d.id === deleteTarget.id ? { ...d, deleted: true } : d;

      const { date, ...rest } = updatedDay;

      return {
        ...rest,
        start_date: moment(rest.start_date).format('YYYY-MM-DD'),
        end_date: moment(rest.end_date).format('YYYY-MM-DD')
      };
    });

    const payload = {
      special_days: updatedList
    };

    console.log('payloaddelete', payload);
    setSpecialDays(updatedList);

    try {
      await saveSpecialDays(payload);
      fetchSpecialDays();
    } catch (err) {
      console.error('Error during deletion:', err);
    } finally {
      setDeleteTarget(null);
    }
  };
  const getDurationInSeconds = (start: number, end: number): number => {
    if (end <= start) {
      return end + 86400 - start;
    }
    return end - start;
  };
  const validateShift = (): boolean => {
    const errors: { name?: string; time?: string; floor?: string } = {};

    if (!editingShift?.name) {
      errors.name = 'Shift name is required';
    }

    const duration = getDurationInSeconds(
      editingShift?.start_time,
      editingShift?.end_time
    );

    if (
      editingShift?.start_time == null ||
      editingShift?.end_time == null ||
      duration <= 0
    ) {
      errors.time = 'Shift must have a valid duration';
    }

    if (!editingShift?.floors || editingShift.floors.length === 0) {
      errors.floor = 'At least one floor must be selected';
    }

    setShiftErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShiftSave = () => {
    if (!currentShiftDay || !editingShift) return;
    if (!validateShift()) return;
    const isEditing = !!editingShift.id;

    const updatedShifts = isEditing
      ? currentShiftDay.shifts.map((s) =>
          s.id === editingShift.id ? { ...editingShift } : s
        )
      : [
          ...(currentShiftDay.shifts || []),
          {
            ...editingShift,
            id: Date.now(),
            turn_time: null,
            day_of_week: [1],
            floors: []
          }
        ];

    const data = loadLocalShifts();
    data[currentShiftDay.id] = updatedShifts;
    saveLocalShifts(data);

    setSpecialDays((prev) =>
      prev.map((day) =>
        day.id === currentShiftDay.id ? { ...day, shifts: updatedShifts } : day
      )
    );

    setIsShiftModalOpen(false);
  };

  const handleShiftDelete = () => {
    if (!currentShiftDay || !editingShift) return;

    const updatedShifts = currentShiftDay.shifts.filter(
      (s) => s.id !== editingShift.id
    );

    const data = loadLocalShifts();
    data[currentShiftDay.id] = updatedShifts;
    saveLocalShifts(data);

    setSpecialDays((prev) =>
      prev.map((day) =>
        day.id === currentShiftDay.id ? { ...day, shifts: updatedShifts } : day
      )
    );

    setIsShiftModalOpen(false);
  };

  return (
    <div className="w-full">
      {/* TODO Change className to commentout when APIs are ready */}
      <div className="mb-4 hidden grid-cols-4 gap-2 border-b pb-2 lg:grid">
        {/* <div className="mb-4 hidden grid-cols-12 gap-2 border-b pb-2 lg:grid"> */}
        <h3 className="text-xs font-semibold ">Name</h3>
        <h3 className="text-xs font-semibold ">Date</h3>
        <h3 className="text-xs font-semibold ">Status</h3>
        <h3 className="text-xs font-semibold ">Action</h3>
        {/* TODO remove comment out when APIs are ready */}
        {/* <h3 className="col-span-8 text-xs font-semibold">Shift</h3> */}
      </div>

      {specialDays
        .filter((d) => !d.deleted)
        .map((day) => {
          const isRange = day.start_date !== day.end_date;
          return (
            <>
              <div
                key={day.id}
                className="group relative mb-10 grid-cols-4 items-center gap-2 space-y-4 border-b py-8 lg:grid lg:space-y-0 lg:border-none lg:py-4"
              >
                {/* TODO Change className to commentout when APIs are ready */}
                {/* <div
                key={day.id}
                className="group relative mb-10 grid-cols-12 items-center gap-2 space-y-4 border-b py-8 lg:grid lg:space-y-0 lg:border-none lg:py-4"
              >  */}
                <div className="flex items-center gap-2 lg:block">
                  <div className="flex flex-grow flex-col">
                    <div className="text-xs font-semibold">
                      <span>{day.name}</span>
                    </div>
                    {!!day.is_recurring && (
                      <span className="text-nowrap text-[10px] text-gray-500">
                        Repeats Annually
                      </span>
                    )}
                  </div>

                  <Badge
                    variant="secondary"
                    className={`pointer-events-none h-6 w-16 justify-center rounded-full px-2 py-1 lg:hidden ${
                      day.is_open === 1
                        ? 'border-green-500 bg-green-100 text-green-500'
                        : 'border-red-500 bg-red-100 text-red-500'
                    }`}
                  >
                    {day.is_open === 1 ? 'Open' : 'Closed'}
                  </Badge>
                </div>
                <div className="">
                  <div className="text-xs">
                    {formatDate(day.start_date)}
                    {isRange && ` - ${formatDate(day.end_date)}`}
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Badge
                    variant="secondary"
                    className={`pointer-events-none w-16 justify-center rounded-full px-2 py-1 ${
                      day.is_open === 1
                        ? 'border-green-500 bg-green-100 text-green-500'
                        : 'border-red-500 bg-red-100 text-red-500'
                    }`}
                  >
                    {day.is_open === 1 ? 'Open' : 'Closed'}
                  </Badge>
                </div>
                <div className="absolute -top-8 right-0 flex gap-1 lg:relative lg:top-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-1 py-2"
                    onClick={() => handleEdit(day)}
                  >
                    <Pencil size={16} className="text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-1 py-2"
                    onClick={() => setDeleteTarget(day)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
                {/* TODO Remove comment out when APIs are ready*/}
                {/* ---------------------------------------------------------------------- */}
                {/* <div className="flex flex-col items-end gap-2 pt-6 lg:col-span-8 lg:flex-row lg:items-center lg:pt-0">
                <div className="w-full">
                  <TimelineRenderer
                    floor={floor}
                    shifts={day.shifts}
                    onShiftClick={(shift) => {
                      setCurrentShiftDay(day);
                      setEditingShift(shift);
                      setIsShiftModalOpen(true);
                    }}
                    onTimeClick={(seconds) => {
                      setCurrentShiftDay(day);
                      setEditingShift({
                        name: '',
                        start_time: seconds,
                        end_time: seconds + 7200,
                        shift_color: '#485df9',
                        floors: []
                      });
                      setIsShiftModalOpen(true);
                    }}
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCurrentShiftDay(day);
                    setEditingShift({
                      name: '',
                      start_time: 0,
                      end_time: 0,
                      shift_color: '#485df9'
                    });
                    setIsShiftModalOpen(true);
                  }}
                  className="cursor-pointer p-2 hover:opacity-60"
                >
                  <Plus size={12} />
                </Button>
              </div> */}
                {/* ---------------------------------------------------------------------- */}
              </div>
            </>
          );
        })}

      <Button variant="outline" onClick={handleAdd} className="mt-4">
        <Plus className="mr-2 h-4 w-4" />
        Add New Special Day
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit' : 'Add'} Special Day</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={currentDay.name}
                onChange={(e) =>
                  setCurrentDay((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Christmas Day"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Date Mode</Label>
              <div className="flex gap-4">
                <Label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="dateMode"
                    value="single"
                    checked={dateMode === 'single'}
                    onChange={() => setDateMode('single')}
                  />
                  Single Date
                </Label>
                <Label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="dateMode"
                    value="range"
                    checked={dateMode === 'range'}
                    onChange={() => setDateMode('range')}
                  />
                  Date Range
                </Label>
              </div>
            </div>
            {dateMode === 'single' ? (
              <Input
                type="date"
                value={
                  dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''
                }
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  setDateRange({ from: selectedDate, to: selectedDate });
                }}
              />
            ) : (
              <CalendarDateRangePicker
                initialDateRange={dateRange}
                onDateChange={setDateRange}
              />
            )}

            <div className="flex items-center justify-between">
              <Label>
                Status: {currentDay?.is_open === 1 ? 'Open' : 'Close'}
              </Label>
              <Switch
                checked={currentDay?.is_open === 1}
                onCheckedChange={(val) =>
                  setCurrentDay((prev: any) => ({
                    ...prev,
                    is_open: val ? 1 : 0
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Repeat Annually</Label>
              <Switch
                checked={currentDay.is_recurring}
                onCheckedChange={(val) =>
                  setCurrentDay((prev) => ({ ...prev, is_recurring: val }))
                }
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Special Day</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isShiftModalOpen} onOpenChange={setIsShiftModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingShift ? 'Edit' : 'Add'} Shift</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Shift Name</Label>
              <Input
                value={editingShift?.name || ''}
                onChange={(e) =>
                  setEditingShift((prev: any) => ({
                    ...prev,
                    name: e.target.value
                  }))
                }
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={
                    editingShift?.start_time
                      ? secondsToTime(editingShift.start_time)
                      : ''
                  }
                  onChange={(e) =>
                    setEditingShift((prev: any) => ({
                      ...prev,
                      start_time: timeToSeconds(e.target.value)
                    }))
                  }
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={
                    editingShift?.end_time
                      ? secondsToTime(editingShift.end_time)
                      : ''
                  }
                  onChange={(e) =>
                    setEditingShift((prev: any) => ({
                      ...prev,
                      end_time: timeToSeconds(e.target.value)
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Shift Color</Label>
              <div className="flex items-center gap-2">
                {/* Color picker */}
                <Input
                  type="color"
                  value={editingShift?.shift_color || '#000000'}
                  onChange={(e) =>
                    setEditingShift((prev: any) => ({
                      ...prev,
                      shift_color: e.target.value
                    }))
                  }
                  className="h-10 w-10 border-none p-0"
                />

                <Input
                  type="text"
                  value={editingShift?.shift_color || ''}
                  onChange={(e) =>
                    setEditingShift((prev: any) => ({
                      ...prev,
                      shift_color: e.target.value
                    }))
                  }
                  className="w-28"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Floor</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-2 px-2">
                {floor?.map((f: any) => (
                  <Label
                    key={f.id}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      checked={editingShift?.floors?.includes(f.id)}
                      onCheckedChange={(checked) => {
                        setEditingShift((prev: any) => {
                          const floors = checked
                            ? [...(prev.floors || []), f.id]
                            : prev.floors?.filter((id: number) => id !== f.id);
                          return { ...prev, floors };
                        });
                      }}
                    />
                    <p>{f.floor_name}</p>
                  </Label>
                ))}
              </div>
            </div>
            {shiftErrors.name && (
              <p className="text-xs text-red-500">{shiftErrors.name}</p>
            )}
            {shiftErrors.time && (
              <p className="text-xs text-red-500">{shiftErrors.time}</p>
            )}
            {shiftErrors.floor && (
              <p className="text-xs text-red-500">{shiftErrors.floor}</p>
            )}
            <div className="flex justify-between gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={() => setIsDeleteAlertOpen(true)}
                disabled={!editingShift?.id}
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsShiftModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleShiftSave}>Save</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{editingShift?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="border border-danger bg-background text-danger"
              onClick={() => {
                handleShiftDelete();
                setIsDeleteAlertOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SpecialDaysForm;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Palette, Pencil } from 'lucide-react';
// import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
// import { is } from 'date-fns/locale';

type Shift = {
  id: number;
  name: string;
  start_time: number;
  end_time: number;
  day_of_week: number[];
  shift_color: string;
  floors: number[];
  turn_time: number;
};

type ShiftsTableProps = {
  shifts: Shift[];
  updateFields?: (fields: Partial<{ shifts: Shift[] }>) => void;
  isSignUp?: boolean;
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ShiftsTable: React.FC<ShiftsTableProps> = ({
  shifts,
  updateFields,
  isSignUp = true
}) => {
  const [currentShift, setCurrentShift] = useState<Shift>({
    id: 0,
    name: '',
    start_time: 32400,
    end_time: 64800,
    day_of_week: [],
    shift_color: '#4F46E5',
    floors: [0],
    turn_time: 120
  });
  const [isEditing, setIsEditing] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    days?: string;
  }>({});

  const resetCurrentShift = () => {
    setCurrentShift({
      id: 0,
      name: '',
      start_time: 32400,
      end_time: 64800,
      day_of_week: [],
      shift_color: '#4F46E5',
      floors: [0],
      turn_time: 120
    });
    setIsEditing(false);
    setValidationErrors({});
  };

  const handleEditShift = (shift: Shift) => {
    setCurrentShift(shift);
    setIsEditing(true);
    const modal = document.getElementById('new-shift-modal');
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  };

  const addOrUpdateShift = () => {
    const errors: { name?: string; days?: string } = {};

    if (!currentShift.name) {
      errors.name = 'Shift name is required';
    }

    if (currentShift.day_of_week.length === 0) {
      errors.days = 'Please select at least one day';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (isEditing) {
      updateFields?.({
        shifts: shifts.map((shift) =>
          shift.id === currentShift.id ? currentShift : shift
        )
      });
    } else {
      if (isSignUp) {
        updateFields?.({
          shifts: [...shifts, { ...currentShift, id: Date.now() }]
        });
      } else {
        updateFields?.({
          shifts: [...shifts, { ...currentShift }]
        });
      }
    }

    resetCurrentShift();
    const modal = document.getElementById('new-shift-modal');
    if (modal instanceof HTMLDialogElement) {
      modal.close();
    }
  };

  const handleDayToggle = (day: number) => {
    setCurrentShift((prev) => ({
      ...prev,
      day_of_week: prev.day_of_week.includes(day)
        ? prev.day_of_week.filter((d) => d !== day)
        : [...prev.day_of_week, day]
    }));
  };

  // const formatTime = (seconds: number) => {
  //   const date = new Date(seconds * 1000);
  //   return date.toLocaleTimeString('en-US', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: true
  //   });
  // };

  const handleDeleteShift = (shift: Shift) => {
    updateFields?.({
      shifts: shifts.filter((s) => s.id !== shift.id)
    });
    setShiftToDelete(null);
  };

  const normalizeTimeInput = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60;
  };

  const formatTimeForInput = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  };

  const formatTimeDisplay = (
    startSeconds: number,
    endSeconds: number
  ): string => {
    const formatTimeString = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return `${formatTimeString(startSeconds)} - ${formatTimeString(
      endSeconds
    )}`;
  };

  return (
    <div
      className={`w-full rounded-lg  p-6 md:min-w-[832px] ${
        isSignUp ? 'border bg-white' : 'border bg-background'
      }`}
    >
      <div className="mb-4 grid grid-cols-9 gap-2 border-b pb-2">
        <div className="col-span-2">
          <h3
            className={`text-xs font-medium  ${
              isSignUp ? 'text-gray-900' : 'text-foreground'
            }`}
          >
            Shift Name
          </h3>
        </div>
        {DAYS.map((day) => (
          <div key={day} className="text-center">
            <span
              className={`text-xs font-medium ${
                isSignUp ? 'text-gray-900' : 'text-foreground'
              }`}
            >
              {day}
            </span>
          </div>
        ))}
      </div>
      {shifts?.map((shift, index) => (
        <div
          key={index}
          className="group mb-3 grid grid-cols-9 items-center gap-2"
        >
          <div className="col-span-2 flex flex-col items-center gap-1.5 md:flex-row">
            <div className="flex items-center gap-1">
              <div
                className="h-3 min-h-3 w-3 min-w-3 rounded-full border border-gray-200"
                style={{ backgroundColor: shift.shift_color }}
              />
              <div className="flex flex-grow flex-col">
                <span className="truncate text-xs font-medium">
                  {shift.name}
                </span>
                <span className="truncate text-[10px] text-gray-500">
                  {formatTimeDisplay(shift.start_time, shift.end_time)}
                </span>
              </div>
            </div>
            <div className="flex">
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleEditShift(shift);
                }}
              >
                <Pencil size={16} className="text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={(e) => {
                  e.preventDefault();
                  setShiftToDelete(shift);
                }}
              >
                <Trash2 size={16} className="text-danger" />
              </Button>
            </div>
          </div>
          {DAYS.map((_, idx) => (
            <div key={idx} className="flex justify-center">
              <div
                className={cn(
                  'h-6 w-full rounded transition-all duration-200',
                  shift.day_of_week.includes(idx + 1)
                    ? 'border-2 border-primary shadow-sm'
                    : 'border-2 border-gray-500/50 '
                )}
                style={{
                  backgroundColor: shift.day_of_week.includes(idx + 1)
                    ? shift.shift_color + '80'
                    : ''
                }}
              />
            </div>
          ))}
        </div>
      ))}

      <Button
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          const modal = document.getElementById('new-shift-modal');
          if (modal instanceof HTMLDialogElement) {
            modal.showModal();
          }
        }}
        className="mt-4"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add New Shift
      </Button>
      <dialog
        id="new-shift-modal"
        className={`w-[440px] rounded-lg p-6  shadow-lg ${
          isSignUp ? 'bg-white' : 'bg-background'
        }`}
      >
        <h3 className="mb-4 text-lg font-semibold">
          {isEditing ? 'Edit Shift' : 'New Shift'}
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              className={`text-sm font-medium ${
                isSignUp ? 'text-gray-900' : 'text-foreground'
              }`}
            >
              Shift Name
            </Label>
            <Input
              value={currentShift.name}
              onChange={(e) => {
                setCurrentShift((prev) => ({ ...prev, name: e.target.value }));
                if (e.target.value) {
                  setValidationErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="e.g., Morning Shift"
              className={`h-12 pl-10 ${
                validationErrors.name ? 'border-red-500' : ''
              } ${isSignUp ? 'bg-white text-gray-900' : ''}`}
            />
            {validationErrors.name && (
              <p className="mt-1 text-xs text-red-500">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                className={`text-sm font-medium ${
                  isSignUp ? 'text-gray-900' : 'text-foreground'
                }`}
              >
                Start Time
              </Label>
              <div className="relative w-full">
                {/* <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /> */}
                <Input
                  type="time"
                  className={`h-12 pl-10  ${
                    isSignUp ? 'bg-white text-gray-900' : ''
                  }`}
                  value={formatTimeForInput(currentShift.start_time)}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const timeInSeconds = normalizeTimeInput(e.target.value);
                    setCurrentShift((prev) => ({
                      ...prev,
                      start_time: timeInSeconds
                    }));
                  }}
                />
              </div>
            </div>

            <div className="w-full space-y-2">
              <Label
                className={`text-sm font-medium ${
                  isSignUp ? 'text-gray-900' : 'text-foreground'
                }`}
              >
                End Time
              </Label>
              <div className="relative">
                {/* <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /> */}
                <Input
                  type="time"
                  className={`h-12 pl-10  ${
                    isSignUp ? 'bg-white text-gray-900' : ''
                  }`}
                  value={formatTimeForInput(currentShift.end_time)}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const timeInSeconds = normalizeTimeInput(e.target.value);
                    setCurrentShift((prev) => ({
                      ...prev,
                      end_time: timeInSeconds
                    }));
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              className={`text-sm font-medium ${
                isSignUp ? 'text-gray-900' : 'text-foreground'
              }`}
            >
              Working Days
            </Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day, index) => (
                <Button
                  key={day}
                  type="button"
                  size="sm"
                  variant={
                    currentShift.day_of_week.includes(index + 1)
                      ? 'submit'
                      : 'outline'
                  }
                  className={cn(
                    'transition-all duration-200',
                    currentShift.day_of_week.includes(index + 1)
                      ? 'border border-transparent bg-primary text-primary-foreground shadow-sm ring-secondary/20'
                      : 'hover:text-white'
                  )}
                  onClick={() => {
                    handleDayToggle(index + 1);
                    if (currentShift.day_of_week.length === 0) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        days: undefined
                      }));
                    }
                  }}
                >
                  {day}
                </Button>
              ))}
            </div>
            {validationErrors.days && (
              <p className="mt-1 text-xs text-red-500">
                {validationErrors.days}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              className={`text-sm font-medium ${
                isSignUp ? 'text-gray-900' : 'text-foreground'
              }`}
            >
              Shift Color
            </Label>
            <div className="flex items-center gap-3">
              <Palette className="h-4 w-4 text-gray-500" />
              <Input
                type="color"
                value={currentShift.shift_color}
                onChange={(e) =>
                  setCurrentShift((prev) => ({
                    ...prev,
                    shift_color: e.target.value
                  }))
                }
                className={`h-10 w-20 p-1 ${isSignUp ? 'bg-white' : ''}`}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                resetCurrentShift();
                const modal = document.getElementById('new-shift-modal');
                if (modal instanceof HTMLDialogElement) {
                  modal.close();
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                addOrUpdateShift();
              }}
            >
              {isEditing ? 'Update Shift' : 'Save Shift'}
            </Button>
          </div>
        </div>
      </dialog>
      <AlertDialog
        open={!!shiftToDelete}
        onOpenChange={() => setShiftToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {shiftToDelete?.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => shiftToDelete && handleDeleteShift(shiftToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShiftsTable;

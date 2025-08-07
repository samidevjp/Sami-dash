import React, { SetStateAction, Dispatch, useEffect } from 'react';
import { getShiftIndex, filterShifts } from '@/utils/Utility';
import moment from 'moment';

// Define the shape of a single shift
interface Shift {
  id: number;
  name: string;
  [key: string]: any; // optional if shift has other properties
}

interface ShiftSelectorProps {
  selectedDate: Date;
  selectedShift: number | undefined;
  setSelectedShift: Dispatch<SetStateAction<number | undefined>>;
  shifts: Shift[];
  isSpecialDay: boolean;
  closedDatesMapRef: Map<string, string>;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({
  selectedDate,
  selectedShift,
  setSelectedShift,
  shifts,
  isSpecialDay,
  closedDatesMapRef
}) => {
  const filteredShiftsData = filterShifts(
    shifts,
    moment(selectedDate).isoWeekday()
  );

  // Update shift when selectedDate changes and selectedShift is invalid
  useEffect(() => {
    const updatedFiltered = filterShifts(
      shifts,
      moment(selectedDate).isoWeekday()
    );

    const exists = updatedFiltered.some(
      (shift: Shift) => shift.id === selectedShift
    );

    if (updatedFiltered.length === 0) {
      if (selectedShift !== undefined) setSelectedShift(undefined);
    } else if (!exists) {
      setSelectedShift(updatedFiltered[0].id);
    }
  }, [selectedDate, shifts, selectedShift, setSelectedShift]);

  const selectShift = () => {
    if (isSpecialDay) {
      return;
    }
    const idx = getShiftIndex('id', selectedShift, filteredShiftsData);
    if (idx !== -1) {
      const nextShift =
        idx === filteredShiftsData.length - 1
          ? filteredShiftsData[0]
          : filteredShiftsData[idx + 1];
      setSelectedShift(nextShift.id);
    } else {
      setSelectedShift(filteredShiftsData[0]?.id);
    }
  };

  const getShiftName = () => {
    if (selectedShift === undefined || selectedShift === null)
      return 'No shift Available';
    const selectedShiftObj = shifts.find(
      (shift: Shift) => shift.id === selectedShift
    );
    if (!selectedShiftObj) {
      return 'No shift Available';
    }
    return selectedShiftObj.name;
  };

  const checkShift = () => {};

  return (
    <div className="mx-2 md:mx-4">
      <div
        className="flex h-6 w-36 cursor-pointer items-center justify-center rounded-2xl bg-gray-dark font-medium shadow md:h-8 md:w-48"
        onClick={selectShift}
      >
        {isSpecialDay ? (
          <>
            {closedDatesMapRef?.get(selectedDate.toLocaleDateString('en-CA')) ??
              'No Shifts Available'}
          </>
        ) : (
          <>
            {shifts.length > 0 ? (
              <label className="cursor-pointer">{getShiftName()}</label>
            ) : (
              <label className="cursor-pointer">No shift</label>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShiftSelector;

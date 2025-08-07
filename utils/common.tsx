import { BOOKINGSTATUS, TABLETYPE } from '@/utils/enum';

import type { SplitItemAssignments } from '@/types';

const threshold = 150;

export function getRelativeLuminance(hex: string | null | undefined): string {
  hex = hex?.replace(/^#/, '');
  const hexRegex = /^[0-9A-F]{6}$/i;

  if (!hex || !hexRegex.test(hex)) {
    return 'inherit';
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > threshold ? 'black' : 'white';
}

export const getRoundTableBookingStatus = (tableType: number) => {
  switch (tableType) {
    case TABLETYPE.fourPersonRoundTable:
    case TABLETYPE.sixPersonRoundTable:
    case TABLETYPE.eightPersonRoundTable:
    case TABLETYPE.halfSeatRoundTable:
    case TABLETYPE.twoPersonRoundTable:
    case TABLETYPE.tenPersonRoundTable:
      return true;
    default:
      return false;
  }
};

// Get name status color
export const getNameStatusColor = (status: number) => {
  switch (status) {
    // unconfirmed
    case BOOKINGSTATUS.unconfirmed:
      return 'text-booking-unconfirmed';
    // finished, no show, cancelled
    case BOOKINGSTATUS.finished:
    case BOOKINGSTATUS.noShow:
    case BOOKINGSTATUS.cancelled:
      return 'text-finished';
    default:
      return 'inherit';
  }
};

export const getBookingProgressStatusColor = (
  target: string,
  status: number
): string => {
  switch (status) {
    // seated, over-time
    case BOOKINGSTATUS.seated:
    case BOOKINGSTATUS.overTime:
      return target + '-bookingProgress-seated';
    // need attention or late
    case BOOKINGSTATUS.needAttention:
    case BOOKINGSTATUS.late:
    case BOOKINGSTATUS.upcoming:
      return target + '-bookingProgress-late';
    // partially seated
    case BOOKINGSTATUS.partiallySeated:
      return target + '-bookingProgress-partiallySeated';
    // billed
    case BOOKINGSTATUS.billed:
      return target + '-bookingProgress-billed';

    // finished, no show, cancelled
    case BOOKINGSTATUS.finished:
    case BOOKINGSTATUS.noShow:
    case BOOKINGSTATUS.cancelled:
      return target + '-bookingProgress-finished';
    case BOOKINGSTATUS.unconfirmed:
      return target + '-bookingProgress-unconfirmed';
    default:
      return target + '-[#E3E0E0]';
  }
};

export const getBookingStatusColor = (
  target: string,
  status: number,
  startTime: string | null = null
): string => {
  switch (status) {
    // seated, over-time
    case BOOKINGSTATUS.seated:
      return target + '-booking-seated';
    case BOOKINGSTATUS.overTime:
    case BOOKINGSTATUS.needAttention:
    case BOOKINGSTATUS.late:
      return target + '-booking-late';
    // partially seated
    case BOOKINGSTATUS.partiallySeated:
      return target + '-booking-partiallySeated';
    // billed
    case BOOKINGSTATUS.billed:
      return target + '-booking-billed';
    // finished, no show, cancelled
    case BOOKINGSTATUS.finished:
    case BOOKINGSTATUS.noShow:
    case BOOKINGSTATUS.cancelled:
      return target + '-booking-finished';
    // unconfirmed
    case BOOKINGSTATUS.unconfirmed:
      return target + '-booking-unconfirmed';
    case BOOKINGSTATUS.upcoming:
      if (startTime) {
        const currentTime = new Date().getTime();
        const start = new Date(startTime).getTime();
        if (currentTime > start) {
          return target + '-booking-late';
        }
      }
      return target + '-booking-upcoming';
    default:
      return target + '-white';
  }
};

export const getSpecificShift = (shifts: any[], shiftId: number) => {
  if (!shifts || !Array.isArray(shifts)) {
    return null;
  }
  const shift = shifts.filter((e) => {
    return e.id === Number(shiftId);
  });
  return shift[0] || null;
};

export const hasConflictBooking = (
  table: any,
  tables: any,
  bookings: any,
  item?: any
) => {
  let conflictTables = [];
  if (!Array.isArray(bookings)) return false;

  const checkConflict = (tableId: number) => {
    const __bookings = bookings
      .filter((e) => e.status !== BOOKINGSTATUS.cancelled)
      .filter((e) => e.status !== BOOKINGSTATUS.finished)
      .filter((e) => e.table.some((c: any) => c.id === tableId))
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

    let prevBooking = null;
    for (let i = 0; i < __bookings.length; i++) {
      const booking = __bookings[i];
      if (prevBooking) {
        const prevEnd = new Date(prevBooking.end_time).getTime();
        const currentStart = new Date(booking.start_time).getTime();
        if (currentStart < prevEnd) {
          conflictTables.push(booking);
        }
      }
      prevBooking = booking;
    }
  };

  if (tables && Array.isArray(tables)) {
    tables.forEach((t) => checkConflict(t.id));
  }

  if (table) {
    checkConflict(table.id);
  }

  return conflictTables.length > 0;
};

/**
 * Calculates the total for a given split number from split item assignments.
 * @param splitItemAssignments Object mapping split numbers to arrays of assignments
 * @param splitNumber The split number to calculate the total for
 * @returns The total price for the split
 */
export function getSplitTotal(
  splitItemAssignments: SplitItemAssignments,
  splitNumber: number
): number {
  const assignments = splitItemAssignments[splitNumber] || [];
  console.log(assignments, 'assignments');
  return assignments.reduce(
    (total, assignment) => total + assignment.totalPrice,
    0
  );
}

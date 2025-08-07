import moment from 'moment';
import {
  BOOKINGSTATUS,
  TABLETYPE,
  RECURRINGTYPE,
  RECURRINGVALUE
} from '@/utils/enum';

// Table images
import singleTable from '@/public/images/booking/tables/single-table.png';
import twoSingleTable from '@/public/images/booking/tables/two-single-table.png';
import threeSingleTable from '@/public/images/booking/tables/three-single-table.png';
import singlePairTable from '@/public/images/booking/tables/single-pair-table.png';
import twoSinglePairTable from '@/public/images/booking/tables/two-single-pair-table.png';
import threeSinglePairTable from '@/public/images/booking/tables/three-single-pair-table.png';
import fourSinglePairTable from '@/public/images/booking/tables/four-single-pair-table.png';
import fourPersonSingleTable from '@/public/images/booking/tables/four-person-single-table.png';
import fourPersonRoundTable from '@/public/images/booking/tables/four-person-round-table.png';
import sixPersonRoundTable from '@/public/images/booking/tables/six-person-round-table.png';
import eightPersonRoundTable from '@/public/images/booking/tables/eight-person-round-table.png';
import tenPersonRoundTable from '@/public/images/booking/tables/ten-person-round-table.png';
import halfSeatRoundTable from '@/public/images/booking/tables/half-seat-round-table.png';
import twoPersonRoundTable from '@/public/images/booking/tables/two-person-round-table.png';

// Booking Status Icons
import bookingStatusBilled from '@/public/images/booking/booking-details/booking-status-billed-icon.png';
import bookingStatusCancelled from '@/public/images/booking/booking-details/booking-status-cancelled-icon.png';
import bookingStatusLate from '@/public/images/booking/booking-details/booking-status-late-icon.png';
import bookingStatusNoShow from '@/public/images/booking/booking-details/booking-status-no-show-icon.png';
import bookingStatusPartialSeated from '@/public/images/booking/booking-details/booking-status-partial-seated-icon.png';
import bookingStatusSeated from '@/public/images/booking/booking-details/booking-status-seated-icon.png';
import bookingStatusUnseat from '@/public/images/booking/booking-details/booking-status-unseat-icon.png';
import bookingStatusFinished from '@/public/images/booking/booking-details/booking-status-finished-icon.png';
import { isArray } from 'lodash';

export const reactNode = process.env.REACT_APP_NODE;
export const apiUrl = process.env.REACT_APP_API_URL; // 'https://qa-api.wabify.com';
export const stripeKey = process.env.REACT_APP_STRIPE_KEY; // 'pk_test_51HkK5eKgSTe7cdQ2pLYOU2VrSH8VyKIKqPxcxnzRcFlXsB21yMP6q122IeNpnIapVluwZlJ4NsDmGRe5qFUvNN08003E2TQHyo';

const _radToDeg = (rad) => {
  let deg = Math.ceil((rad * 180) / Math.PI);
  if (deg >= 360) {
    deg = deg - 360;
  }
  return deg;
};

export const getBookingStatus = (status) => {
  switch (status) {
    case BOOKINGSTATUS.upcoming:
      return {
        name: 'Upcoming',
        icon: bookingStatusUnseat,
        value: BOOKINGSTATUS.upcoming
      };
    case BOOKINGSTATUS.partiallySeated:
      return {
        name: 'Partial Seated',
        icon: bookingStatusPartialSeated,
        value: BOOKINGSTATUS.partiallySeated
      };
    case BOOKINGSTATUS.late:
      return {
        name: 'Late',
        icon: bookingStatusLate,
        value: BOOKINGSTATUS.late
      };
    case BOOKINGSTATUS.noShow:
      return {
        name: 'No Show',
        icon: bookingStatusNoShow,
        value: BOOKINGSTATUS.noShow
      };
    case BOOKINGSTATUS.cancelled:
      return {
        name: 'Cancelled',
        icon: bookingStatusCancelled,
        value: BOOKINGSTATUS.cancelled
      };
    case BOOKINGSTATUS.unconfirmed:
      return {
        name: 'Unconfirmed',
        icon: bookingStatusUnseat,
        value: BOOKINGSTATUS.unconfirmed
      };
    case BOOKINGSTATUS.overTime:
      return {
        name: 'Overtime',
        icon: bookingStatusLate,
        value: BOOKINGSTATUS.overTime
      };
    case BOOKINGSTATUS.seated:
      return {
        name: 'Seated',
        icon: bookingStatusSeated,
        value: BOOKINGSTATUS.seated
      };
    case BOOKINGSTATUS.unseat:
      return {
        name: 'Unseat',
        icon: bookingStatusUnseat,
        value: BOOKINGSTATUS.unseat
      };
    case BOOKINGSTATUS.billed:
      return {
        name: 'Billed',
        icon: bookingStatusBilled,
        value: BOOKINGSTATUS.billed
      };
    case BOOKINGSTATUS.unbill:
      return {
        name: 'Unbilled',
        icon: bookingStatusUnseat,
        value: BOOKINGSTATUS.unbill
      };
    case BOOKINGSTATUS.finished:
      return {
        name: 'Finished',
        icon: bookingStatusFinished,
        value: BOOKINGSTATUS.finished
      };
    default:
      return {
        name: 'Unconfirmed',
        icon: bookingStatusUnseat,
        value: BOOKINGSTATUS.unconfirmed
      };
  }
};

export const getBookingStatusOptions = (status) => {
  switch (status) {
    case BOOKINGSTATUS.upcoming:
      return [
        {
          name: 'Partial Seat',
          icon: bookingStatusPartialSeated,
          value: BOOKINGSTATUS.partiallySeated
        },
        {
          name: 'Late',
          icon: bookingStatusLate,
          value: BOOKINGSTATUS.late
        },
        {
          name: 'No Show',
          icon: bookingStatusNoShow,
          value: BOOKINGSTATUS.noShow
        },
        {
          name: 'Cancelled',
          icon: bookingStatusCancelled,
          value: BOOKINGSTATUS.cancelled
        }
      ];
    case BOOKINGSTATUS.late:
      return [
        {
          name: 'Partial Seat',
          icon: bookingStatusPartialSeated,
          value: BOOKINGSTATUS.partiallySeated
        },
        {
          name: 'No Show',
          icon: bookingStatusNoShow,
          value: BOOKINGSTATUS.noShow
        },
        {
          name: 'Cancelled',
          icon: bookingStatusCancelled,
          value: BOOKINGSTATUS.cancelled
        }
      ];
    case BOOKINGSTATUS.needAttention:
      return [
        {
          name: 'Late',
          icon: bookingStatusLate,
          value: BOOKINGSTATUS.late
        },
        {
          name: 'No Show',
          icon: bookingStatusNoShow,
          value: BOOKINGSTATUS.noShow
        },
        {
          name: 'Cancelled',
          icon: bookingStatusCancelled,
          value: BOOKINGSTATUS.cancelled
        }
      ];
    case BOOKINGSTATUS.unconfirmed:
      return [
        {
          name: 'Cancel',
          icon: bookingStatusCancelled,
          value: BOOKINGSTATUS.cancelled
        },
        {
          name: 'Confirm',
          icon: bookingStatusNoShow,
          value: BOOKINGSTATUS.upcoming
        }
      ];
    case BOOKINGSTATUS.overtime:
      return [
        {
          name: 'Billed',
          icon: bookingStatusBilled,
          value: BOOKINGSTATUS.billed
        },
        {
          name: 'Unseat',
          icon: bookingStatusUnseat,
          value: BOOKINGSTATUS.upcoming
        }
      ];
    case BOOKINGSTATUS.billed:
      return [
        {
          name: 'Unbill',
          icon: bookingStatusUnseat,
          value: BOOKINGSTATUS.unbill
        }
      ];
    case BOOKINGSTATUS.seated:
      return [
        {
          name: 'Billed',
          icon: bookingStatusBilled,
          value: BOOKINGSTATUS.billed
        },
        {
          name: 'Unseat',
          icon: bookingStatusUnseat,
          value: BOOKINGSTATUS.upcoming
        }
      ];
    case BOOKINGSTATUS.partiallySeated:
      return [
        {
          name: 'Seat',
          icon: bookingStatusSeated,
          value: BOOKINGSTATUS.seated
        },
        {
          name: 'Unseat',
          icon: bookingStatusUnseat,
          value: BOOKINGSTATUS.upcoming
        }
      ];
    default:
      return [
        {
          name: 'Late',
          icon: bookingStatusLate,
          value: BOOKINGSTATUS.late
        },
        {
          name: 'No Show',
          icon: bookingStatusNoShow,
          value: BOOKINGSTATUS.noShow
        },
        {
          name: 'Cancelled',
          icon: bookingStatusCancelled,
          value: BOOKINGSTATUS.cancelled
        }
      ];
  }
};

export const radToDeg = (rad) => {
  return _radToDeg(rad);
};
export const getRadHeight = (rad, tableType) => {
  let radToDeg = _radToDeg(rad);
  let width = getTableWidth(tableType);
  let height = getTableHeight(tableType);

  switch (radToDeg) {
    case 0:
    case 180:
      return height;
    default:
      return width;
  }
};

export const getRadWidth = (rad, tableType) => {
  let radToDeg = _radToDeg(rad);
  let width = getTableWidth(tableType);
  let height = getTableHeight(tableType);

  switch (radToDeg) {
    case 0:
    case 180:
      return width;
    default:
      return height;
  }
};

export const getPositionTop = (rad, tableType) => {
  let radToDeg = _radToDeg(rad);
  let width = getTableWidth(tableType);
  let height = getTableHeight(tableType);

  switch (radToDeg) {
    case 0:
      return 0;
    case 90:
      return 0;
    case 180:
      return height;
    default:
      return width;
  }
};

export const getPositionLeft = (rad, tableType) => {
  let radToDeg = _radToDeg(rad);
  let width = getTableWidth(tableType);
  let height = getTableHeight(tableType);

  switch (radToDeg) {
    case 0:
      return 0;
    case 90:
      return height;
    case 180:
      return width;
    default:
      return 0;
  }
};

export const filterTableByFloor = (floorId, tables) => {
  return tables.filter((e) => e.floor_id === floorId);
};

export const getAllTablesOnFloors = (floors) => {
  let tables = [];

  floors.map((e) => {
    tables = tables.concat(e.tables);
  });

  return tables;
};

export const getAllTime = (shifts, selectedDate) => {
  let times = [];
  const currentHoursInSecs =
    moment().seconds() + moment().minutes() * 60 + moment().hours() * 3600;
  if (isArray(shifts)) {
    shifts.forEach((shift) => {
      let totalShiftHours = (shift.end_time - shift.start_time) / 900;
      let totalshiftByHalfHour = totalShiftHours;

      if (totalShiftHours > 1) {
        for (let i = 0; i <= totalshiftByHalfHour; i++) {
          const min = i * 900;
          const totalTime = shift.start_time + min;
          const currentDate = moment().format('yyyy-MM-DD');
          if (currentDate === selectedDate) {
            if (totalTime >= currentHoursInSecs) {
              times = [...times, totalTime];
            }
          } else {
            times = [...times, totalTime];
          }
        }
      }
    });
  } else {
    let shift = shifts;
    if (shift !== undefined) {
      let totalShiftHours = (shift.end_time - shift.start_time) / 900;
      let totalshiftByHalfHour = totalShiftHours;

      if (totalShiftHours > 1) {
        for (let i = 0; i <= totalshiftByHalfHour; i++) {
          const min = i * 900;
          const totalTime = shift.start_time + min;
          const currentDate = moment().format('yyyy-MM-DD');
          if (currentDate === selectedDate) {
            if (totalTime >= currentHoursInSecs) {
              times = [...times, totalTime];
            }
          } else {
            times = [...times, totalTime];
          }
        }
      }
    }
  }

  return times;
};

export const displayPickerHourMinutes = (d) => {
  d = Number(d);
  let h = Math.floor(d / 3600);
  let m = Math.floor((d % 3600) / 60);

  let hDisplay = h > 0 ? h : '0';
  let mDisplay = m > 0 ? m : '00';

  return hDisplay + ' h ' + mDisplay + ' m';
};

export const getRemainingTime = (start_time, end_time, status, no_limit) => {
  const currentHoursInSecs =
    moment().seconds() + moment().minutes() * 60 + moment().hours() * 3600;
  if (no_limit) {
    return '----';
  }

  if (status === BOOKINGSTATUS.seated) {
    const remainingSecs = end_time - currentHoursInSecs;

    return displayPickerHourMinutes(remainingSecs);
  } else {
    if (status === BOOKINGSTATUS.overTime) {
      const remainingSecs = end_time - currentHoursInSecs;

      return displayPickerHourMinutes(remainingSecs);
    } else {
      const remainingSecs = end_time - start_time;
      return displayPickerHourMinutes(remainingSecs);
    }
  }
};

export const getTimeStr = (d) => {
  d = Number(d);
  let h = Math.floor(d / 3600);
  let m = Math.floor((d % 3600) / 60);

  let hDisplay = h > 0 ? h : '';
  let mDisplay = m > 0 ? m : '0';

  hDisplay = hDisplay > 12 ? hDisplay - 12 : hDisplay;
  hDisplay = hDisplay < 10 ? '0' + hDisplay : hDisplay;
  mDisplay = mDisplay < 10 ? '0' + mDisplay : mDisplay;

  return hDisplay + ':' + mDisplay + (h >= 12 ? ' PM' : ' AM');
};

// ex:targetDate = "2024-10-16 01:24:23"
export const formatTimeStr = (targetDate = null) => {
  const date = targetDate ? new Date(targetDate) : new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

export const updateDateTime = (date, time) => {
  const _date = moment(date);
  const newHours = time / 3600;
  const newMinutes = (time % 3600) / 60;

  return _date
    .hours(newHours)
    .minutes(newMinutes)
    .format('yyyy-MM-DD HH:mm:ss');
};

export const getCurrentShift = (shifts) => {
  const currentHoursInSecs =
    moment().seconds() + moment().minutes() * 60 + moment().hours() * 3600;
  const shift = shifts.filter(
    (e) =>
      e.start_time <= currentHoursInSecs && e.end_time >= currentHoursInSecs
  )[0];

  return shift === null || shift === undefined ? shifts[1] : shift;
};

export const getShiftByTime = (time, shifts) => {
  const shift = shifts.filter(
    (e) => e.start_time <= time && e.end_time >= time
  )[0];
  return shift === null || shift === undefined ? shifts[1] : shift;
};

export const tableNamePositionLeftTranslate = (tableType) => {
  switch (tableType) {
    case TABLETYPE.fourPersonRoundTable:
    case TABLETYPE.sixPersonRoundTable:
    case TABLETYPE.eightPersonRoundTable:
    case TABLETYPE.halfSeatRoundTable:
    case TABLETYPE.twoPersonRoundTable:
    case TABLETYPE.tenPersonRoundTable:
      return '-50%';
    default:
      return 0;
  }
};

export const getBookingOnTable = (tableId, bookings, selectedShift) => {
  if (bookings === null) {
    return null;
  }
  const booking = bookings
    ?.filter((booking) => {
      return (
        booking.table.some((table) => table.id === tableId) &&
        !(
          booking.status === BOOKINGSTATUS.finished ||
          booking.status === BOOKINGSTATUS.cancelled ||
          booking.status === BOOKINGSTATUS.noShow
        ) &&
        (booking.shift_id === selectedShift.id ||
          (booking.end_time > selectedShift.start_time &&
            booking.end_time <= selectedShift.end_time))
      );
    })
    .reduce((earliestBooking, currentBooking) => {
      if (!earliestBooking) return currentBooking;
      return earliestBooking.start_time < currentBooking.start_time
        ? earliestBooking
        : currentBooking;
    }, null);
  return booking;
};

export const getBookingsOnTable = (tableId, bookings) => {
  if (bookings === null) {
    return null;
  }
  let booking = [];
  booking = bookings.filter((booking) => {
    return booking.table.some((table) => table.id === tableId);
  });

  return booking.length === 0 ? null : booking;
};

export const getShiftIndex = (prop, value, shifts) => {
  for (var i = 0; i < shifts.length; i++) {
    if (shifts[i][prop] === value) {
      return i;
    }
  }
  return -1;
};

export const filterShifts = (shifts, selectedDate) => {
  return shifts.filter((i) => i.day_of_week.includes(selectedDate));
};

export const getBookingOnTableByIndex = (tableId, bookings, index) => {
  const _bookings = bookings.filter((booking) => {
    return (
      booking.table.some((table) => table.id === tableId) &&
      !(
        booking.status === BOOKINGSTATUS.finished ||
        booking.status === BOOKINGSTATUS.cancelled ||
        booking.status === BOOKINGSTATUS.noShow
      )
    );
  });

  return _bookings.length === 0
    ? null
    : _bookings.sort((a, b) => a.start_time < b.start_time)[index] ?? null;
};

export const tableNamePositionLeft = (tableType, tableRotate = 0) => {
  switch (tableType) {
    case TABLETYPE.fourPersonRoundTable:
    case TABLETYPE.sixPersonRoundTable:
    case TABLETYPE.eightPersonRoundTable:
    case TABLETYPE.twoPersonRoundTable:
    case TABLETYPE.tenPersonRoundTable:
      return '50%';
    case TABLETYPE.halfSeatRoundTable:
      if (tableRotate === 0) {
        return '45%';
      }
      return '50%';
    default:
      return 2;
  }
};

export const tableNamePositionMarginTop = (tableType, rad) => {
  let radToDeg = _radToDeg(rad);
  let tableNamePositionMarginTop = 0;
  switch (tableType) {
    case TABLETYPE.singleTable:
    case TABLETYPE.twoSingleTable:
    case TABLETYPE.threeSingleTable:
      switch (radToDeg) {
        case 90:
          tableNamePositionMarginTop = 5;
          break;
        case 180:
          tableNamePositionMarginTop = 10;
          break;
        case 270:
          tableNamePositionMarginTop = 10;
          break;
        default:
          break;
      }
      break;
    case TABLETYPE.singlePairTable:
    case TABLETYPE.twoSinglePairTable:
    case TABLETYPE.threeSinglePairTable:
    case TABLETYPE.fourSinglePairTable:
      switch (radToDeg) {
        case 90:
        case 270:
          tableNamePositionMarginTop = 10;
          break;
        case 180:
          tableNamePositionMarginTop = 7;
          break;
        case 0:
          tableNamePositionMarginTop = 2;
          break;
        default:
          break;
      }
      break;
    case TABLETYPE.fourPersonSingleTable:
      tableNamePositionMarginTop = 10;
      break;
    case TABLETYPE.fourPersonRoundTable:
    case TABLETYPE.sixPersonRoundTable:
    case TABLETYPE.eightPersonRoundTable:
    case TABLETYPE.halfSeatRoundTable:
    case TABLETYPE.twoPersonRoundTable:
    case TABLETYPE.tenPersonRoundTable:
      tableNamePositionMarginTop = 15;
      break;
    default:
      break;
  }
  return tableNamePositionMarginTop * adjNum;
};

export const tableNamePositionMarginLeft = (tableType, rad) => {
  let radToDeg = _radToDeg(rad);

  switch (tableType) {
    case TABLETYPE.singleTable:
    case TABLETYPE.twoSingleTable:
    case TABLETYPE.threeSingleTable:
      switch (radToDeg) {
        case 90:
          return 5;
        case 180:
          return 7;
        case 270:
          return 0;
        default:
          break;
      }
      break;
    case TABLETYPE.singlePairTable:
    case TABLETYPE.twoSinglePairTable:
    case TABLETYPE.threeSinglePairTable:
    case TABLETYPE.fourSinglePairTable:
      switch (radToDeg) {
        case 90:
          return 0;
        case 270:
          return 9;
        case 180:
        case 0:
          return 8;
        default:
          break;
      }
      break;
    case TABLETYPE.fourPersonSingleTable:
      return 6;
    case TABLETYPE.fourPersonRoundTable:
    case TABLETYPE.sixPersonRoundTable:
    case TABLETYPE.eightPersonRoundTable:
    case TABLETYPE.halfSeatRoundTable:
    case TABLETYPE.twoPersonRoundTable:
      return 0;
    case TABLETYPE.tenPersonRoundTable:
      return 0;
    default:
      break;
  }
  return '';
};

// Get Booking time only
export const getTimeOnly = (date) => {
  return moment(date, 'yyyy-MM-dd hh:mm:ss').format('hh:mm A');
};

export const getBookingTimeOnly = (booking) => {
  if (booking === null) {
    return '';
  }
  return moment(booking.start_date, 'yyyy-MM-dd hh:mm:ss').format('hh:mm A');
};

const adjNum = 0.6;

// Get Table Size
export const getTableWidth = (tableType) => {
  let tableWidth;
  switch (tableType) {
    case TABLETYPE.singleTable:
    case TABLETYPE.twoSingleTable:
    case TABLETYPE.threeSingleTable:
      tableWidth = 89;
      break;
    case TABLETYPE.singlePairTable:
    case TABLETYPE.twoSinglePairTable:
    case TABLETYPE.threeSinglePairTable:
    case TABLETYPE.fourSinglePairTable:
    case TABLETYPE.fourPersonSingleTable:
      tableWidth = 100;
      break;
    case TABLETYPE.fourPersonRoundTable:
    case TABLETYPE.sixPersonRoundTable:
    case TABLETYPE.eightPersonRoundTable:
    case TABLETYPE.halfSeatRoundTable:
    case TABLETYPE.twoPersonRoundTable:
      tableWidth = 131;
      break;
    case TABLETYPE.tenPersonRoundTable:
      tableWidth = 136;
      break;
    default:
      break;
  }
  return tableWidth * adjNum;
};

export const getTableHeight = (tableType) => {
  let tableHeight;
  switch (tableType) {
    case TABLETYPE.singleTable:
      tableHeight = 78;
      break;
    case TABLETYPE.twoSingleTable:
      tableHeight = 156;
      break;
    case TABLETYPE.threeSingleTable:
      tableHeight = 234;
      break;
    case TABLETYPE.singlePairTable:
      tableHeight = 80;
      break;
    case TABLETYPE.twoSinglePairTable:
      tableHeight = 160;
      break;
    case TABLETYPE.threeSinglePairTable:
      tableHeight = 240;
      break;
    case TABLETYPE.fourSinglePairTable:
      tableHeight = 320;
      break;
    case TABLETYPE.fourPersonSingleTable:
      tableHeight = 100;
      break;
    case TABLETYPE.fourPersonRoundTable:
    case TABLETYPE.sixPersonRoundTable:
    case TABLETYPE.eightPersonRoundTable:
    case TABLETYPE.tenPersonRoundTable:
      tableHeight = 131;
      break;
    case TABLETYPE.halfSeatRoundTable:
      tableHeight = 146;
      break;
    case TABLETYPE.twoPersonRoundTable:
      tableHeight = 116;
      break;
    default:
      break;
  }
  return tableHeight * adjNum;
};

// Get Table Img
export const getTableImg = (tableType) => {
  switch (tableType) {
    case TABLETYPE.singleTable:
      return singleTable;
    case TABLETYPE.twoSingleTable:
      return twoSingleTable;
    case TABLETYPE.threeSingleTable:
      return threeSingleTable;
    case TABLETYPE.singlePairTable:
      return singlePairTable;
    case TABLETYPE.twoSinglePairTable:
      return twoSinglePairTable;
    case TABLETYPE.threeSinglePairTable:
      return threeSinglePairTable;
    case TABLETYPE.fourSinglePairTable:
      return fourSinglePairTable;
    case TABLETYPE.fourPersonSingleTable:
      return fourPersonSingleTable;
    case TABLETYPE.fourPersonRoundTable:
      return fourPersonRoundTable;
    case TABLETYPE.sixPersonRoundTable:
      return sixPersonRoundTable;
    case TABLETYPE.eightPersonRoundTable:
      return eightPersonRoundTable;
    case TABLETYPE.tenPersonRoundTable:
      return tenPersonRoundTable;
    case TABLETYPE.halfSeatRoundTable:
      return halfSeatRoundTable;
    case TABLETYPE.twoPersonRoundTable:
      return twoPersonRoundTable;
    default:
      break;
  }
};

// Get Guest full name
export const getFullname = (guest) => {
  if (guest === null || guest === undefined || !guest) {
    return 'Walk In';
  }

  const firstName = guest.first_name;
  const lastName = guest.last_name === null ? ' ' : guest.last_name;

  return firstName + ' ' + lastName;
};

// Get Table Name
export const getFloorName = (floorId, floors) => {
  const floor = floors.filter((e) => e.id === floorId)[0];
  if (floor) {
    return floor.floor_name;
  } else {
    return '';
  }
};

// Get Table Size
export const getTableSize = (booking) => {
  const { party_size } = booking;

  return party_size === 1 ? party_size + ' guest' : party_size + ' guests';
};

// Get Guest Phone Number
export const getGuestPhoneNum = (guest) => {
  if (guest === null) {
    return ' ';
  }

  return guest.phone;
};

export const sectionStatus = [
  BOOKINGSTATUS.late,
  BOOKINGSTATUS.upcoming,
  BOOKINGSTATUS.seated,
  BOOKINGSTATUS.unconfirmed,
  BOOKINGSTATUS.partiallySeated,
  BOOKINGSTATUS.finished,
  BOOKINGSTATUS.cancelled,
  BOOKINGSTATUS.noShow
];
export const sectionStatusName = [
  'Late',
  'Upcoming',
  'Seated',
  'Unconfirmed',
  'Partially Seated',
  'Finished',
  'Cancelled',
  'No Show'
];

// Sort booking by section status
export const sortBookingBySection = (bookings, keyword = '') => {
  let section = [];

  sectionStatus.map((val, idx) => {
    let statusName = sectionStatusName[idx];
    const _bookings = bookings?.filter((o) => {
      if (o.guest === null) {
        return false;
      }
      let fullName = o.guest.first_name + ' ' + o.guest.last_name;
      return fullName.toLowerCase().includes(keyword.toLowerCase());
    });
    let bookingByStatus = _bookings?.filter((item) => item.status === val);
    let bookingSortedByTime = bookingByStatus?.sort((a, b) =>
      a.start_time > b.start_time ? 1 : -1
    );
    let partySize = 0;
    bookingSortedByTime?.forEach((item) => {
      partySize += item.party_size;
    });
    let tableCount = 0;
    bookingSortedByTime?.forEach((item) => {
      tableCount += item.table.length;
    });

    let obj = {
      sectionName: statusName,
      bookings: bookingByStatus === null ? [] : bookingSortedByTime,
      totalPartySize: bookingByStatus === null ? 0 : partySize,
      totalTable: bookingByStatus === null ? 0 : tableCount
    };

    section = [...section, obj];
    return section;
  });

  section = section.filter((item) => item.bookings?.length !== 0);

  return section;
};

// Sort Booking by status
export const sortBookingByStatus = (bookings, option, keyword = '') => {
  const selectedOption = parseInt(option);
  const _bookings = bookings.filter((o) => {
    if (o.guest === null) {
      return false;
    }
    let fullName = o.guest.first_name + ' ' + o.guest.last_name;
    return fullName.toLowerCase().includes(keyword.toLowerCase());
  });
  const newBookings = []
    .concat(_bookings)
    .sort((a, b) => a.start_time < b.start_time);

  switch (selectedOption) {
    case 1:
    case 2:
      const active = newBookings.filter(
        (item) =>
          item.status === BOOKINGSTATUS.seated ||
          item.status === BOOKINGSTATUS.upcoming ||
          item.status === BOOKINGSTATUS.waitList ||
          item.status === BOOKINGSTATUS.billed ||
          item.status === BOOKINGSTATUS.overTime ||
          item.status === BOOKINGSTATUS.late ||
          item.status === BOOKINGSTATUS.unseat ||
          item.status === BOOKINGSTATUS.unconfirmed ||
          item.status === BOOKINGSTATUS.partiallySeated
      );

      const inactive = newBookings.filter(
        (item) =>
          item.status === BOOKINGSTATUS.finished ||
          item.status === BOOKINGSTATUS.noShow ||
          item.status === BOOKINGSTATUS.cancelled
      );

      let newSortedBookings = [];
      newSortedBookings = newSortedBookings.concat(active, inactive);

      if (selectedOption === 2) {
        let sortedBookingByStatus = [];
        sortedBookingByStatus = sortedBookingByStatus.concat(
          newSortedBookings.sort((a, b) => (a.status > b.status ? 1 : -1))
        );
        return sortedBookingByStatus;
      }

      return newSortedBookings;
    case 4:
      const alerts = newBookings.filter(
        (item) =>
          item.status === BOOKINGSTATUS.waitList ||
          item.status === BOOKINGSTATUS.needAttention ||
          item.status === BOOKINGSTATUS.late ||
          item.status === BOOKINGSTATUS.finished ||
          item.status === BOOKINGSTATUS.noShow ||
          item.status === BOOKINGSTATUS.cancelled ||
          item.status === BOOKINGSTATUS.unconfirmed
      );
      return alerts;

    default:
      break;
  }
};

export function calculateElapsedPercentageByDate(startDate, endDate) {
  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();
  const currentTime = Date.now();

  const totalDuration = endTime - startTime;
  const elapsed = currentTime - startTime;

  if (elapsed >= totalDuration) {
    return 100;
  } else if (elapsed <= 0) {
    return 0;
  }

  return (elapsed / totalDuration) * 100;
}

export const getNearestAvailableDate = (
  expStartDate,
  expEndDate,
  expDaysOfWeek,
  expRecurringType,
  expRecurringValue
) => {
  let start = moment(expStartDate).startOf('date');
  let current = moment(new Date()).startOf('date');
  let end = moment(expEndDate).startOf('date');

  if (expRecurringType === RECURRINGTYPE.weekly) {
    if (end.isValid()) {
      let startDay = start.dayOfYear();
      let endDay = end.dayOfYear();
      let currentDay = current.dayOfYear();
      if (startDay < currentDay) {
        for (let i = currentDay; i <= endDay; i++) {
          let newDate = moment().dayOfYear(i);
          let weekNumber = newDate.isoWeekday();
          if (expDaysOfWeek.includes(weekNumber)) {
            if (i === currentDay) continue;
            return newDate.toDate();
          }
        }
      } else {
        return expStartDate;
      }
    } else {
      let currentDay = current.dayOfYear() + 1;
      let currentWeek = current.dayOfYear() + 6;
      for (let i = currentDay; i <= currentWeek; i++) {
        let newDate = moment().dayOfYear(i);
        let weekNumber = newDate.isoWeekday();
        if (expDaysOfWeek.includes(weekNumber)) {
          return newDate.toDate();
        }
      }
    }
  }
  if (expRecurringType === RECURRINGTYPE.monthly) {
    if (expRecurringValue === RECURRINGVALUE.everyDayOfMonth) {
      if (end.isValid()) {
        let monthStart = start.month();
        let monthEnd = end.month();
        let monthNow = current.month();
        if (start < current) {
          for (let i = monthStart; i <= monthEnd; i++) {
            let month = moment().month(i).day('Monday');
            if (month.month() === monthNow) {
              return month.add(7, 'days').toDate();
            }
          }
        } else {
          return expStartDate;
        }
      } else {
        if (start < current) {
          let monthStart = start.month();
          let nextMonth = current.month() + 1;
          let monthNow = current.month();
          for (let i = monthStart; i <= nextMonth; i++) {
            let month = moment().month(i).day('Monday');
            if (month.month() === monthNow) {
              return month.add(7, 'days').toDate();
            }
          }
        } else {
          return expStartDate;
        }
      }
    }
    if (expRecurringValue === RECURRINGVALUE.everyDateOfMonth) {
      let currentMonth = current.month();
      let startDate = start.date(); // 1 - 31
      let endMonth = end.month();
      let nearestDate = {};
      if (end.isValid()) {
        if (start < current) {
          for (let i = currentMonth; i <= endMonth; i++) {
            nearestDate = moment().month(i).date(startDate).toDate();
          }
          return nearestDate;
        } else {
          return expStartDate;
        }
      } else {
        let nextMonth = current.month() + 1;
        if (start < current) {
          for (let i = currentMonth; i <= nextMonth; i++) {
            nearestDate = moment().month(i).date(startDate).toDate();
          }
          return nearestDate;
        } else {
          return expStartDate;
        }
      }
    }
  }
  if (expRecurringType === RECURRINGTYPE.annually) {
    if (expRecurringValue === RECURRINGVALUE.none) {
      if (end.isValid()) {
        let currentY = current.year();
        let endY = end.year();
        if (start < current) {
          if (currentY <= endY) {
            return current.add(1, 'd');
          }
        } else {
          if (start < end) {
            return current.add('d');
          }
        }
      } else {
        if (start < current) {
          return current.add(1, 'd');
        } else {
          return expStartDate;
        }
      }
    }
    if (expRecurringValue === RECURRINGVALUE.everyMonthDateOfYear) {
      if (end.isValid()) {
        if (current < end) {
          return start.add(1, 'y').toDate();
        } else {
          return expStartDate;
        }
      } else {
        if (start < current) {
          return start.add(1, 'y').toDate();
        } else {
          return expStartDate;
        }
      }
    }
  }
  if (expRecurringType === RECURRINGTYPE.none) {
    if (end.isValid()) {
      if (start < current) {
        if (current < end) {
          return current.add(1, 'd').toDate();
        }
      } else {
        if (start > current) {
          return expStartDate;
        } else {
          return null;
        }
      }
    } else {
      if (start < current) {
        return current.add(1, 'd').toDate();
      } else {
        return expStartDate;
      }
    }
  }
};

import moment from 'moment';

type DayOfWeek = number; // 1 (Monday) to 7 (Sunday) from moment's isoWeekday()
type Shift = {
  id: number;
  start_time: number; // in seconds since midnight
  end_time: number; // in seconds since midnight
  day_of_week: DayOfWeek[]; // array of isoWeekday numbers
};

export const useCurrentShiftId = (shifts: Shift[]): number => {
  const getCurrentTimeInSeconds = (): number => {
    const now = new Date();
    return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  };

  const filterShifts = (shifts: Shift[], selectedDate: DayOfWeek): Shift[] => {
    return shifts.filter((shift) => shift.day_of_week.includes(selectedDate));
  };

  const getCurrentShiftId = (): number => {
    const currentTimeInSeconds = getCurrentTimeInSeconds();
    const todayIsoWeekday = moment().isoWeekday() as DayOfWeek;
    const filteredShifts = filterShifts(shifts, todayIsoWeekday);

    for (const shift of filteredShifts) {
      const { start_time, end_time } = shift;

      if (start_time < end_time) {
        // Normal shift
        if (
          currentTimeInSeconds >= start_time &&
          currentTimeInSeconds < end_time
        ) {
          return shift.id;
        }
      } else {
        // Overnight shift
        if (
          currentTimeInSeconds >= start_time ||
          currentTimeInSeconds < end_time
        ) {
          return shift.id;
        }
      }
    }

    return 0;
  };

  return getCurrentShiftId();
};

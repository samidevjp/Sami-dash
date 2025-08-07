import React, { useState } from 'react';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface CalendarMonthProps {
  month?: Date;
  selectMonth: (date: Date) => void;
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  month,
  selectMonth
}) => {
  // Ensure the month prop is in a valid format
  const initialMonth = moment(month, moment.ISO_8601, true).isValid()
    ? moment(month)
    : moment();

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedMonthStr, setSelectedMonthStr] = useState(
    initialMonth.format('MMMM')
  );
  const [selectedYearStr, setSelectedYearStr] = useState(
    initialMonth.format('YYYY')
  );

  const prevMonth = () => {
    const previousMonth = moment(selectedMonth).subtract(1, 'month');
    setSelectedMonth(previousMonth);
    setSelectedMonthStr(previousMonth.format('MMMM'));
    setSelectedYearStr(previousMonth.format('YYYY'));
    selectMonth(previousMonth.toDate());
  };

  const nextMonth = () => {
    const nextMonth = moment(selectedMonth).add(1, 'month');
    setSelectedMonth(nextMonth);
    setSelectedMonthStr(nextMonth.format('MMMM'));
    setSelectedYearStr(nextMonth.format('YYYY'));
    selectMonth(nextMonth.toDate());
  };

  return (
    <div className="user-select-none flex h-16 w-full justify-between">
      <div className="relative flex h-16 w-[66%] items-center justify-around rounded-lg bg-secondary">
        <Button
          variant="ghost"
          onClick={prevMonth}
          className="h-full p-4 hover:bg-transparent"
        >
          <ChevronLeft />
        </Button>
        <p className="flex-grow-1 text-center text-base">{selectedMonthStr}</p>
        <Button
          variant="ghost"
          onClick={nextMonth}
          className="h-full p-4 hover:bg-transparent"
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="flex h-16 w-[31%] items-center justify-center rounded-lg bg-secondary">
        <p className="text-base ">{selectedYearStr}</p>
      </div>
    </div>
  );
};

export default CalendarMonth;

import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/src/style.css';
import '@/styles/calendar.css';

interface BookingCalendarProps {
  bookingDate: Date;
  month: Date;
  handleSelectDate: (date: Date) => void;
  idDisabledBeforeDate?: boolean;
  closedDatesMapRef?: Map<string, string>;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookingDate,
  month,
  handleSelectDate,
  idDisabledBeforeDate = false,
  closedDatesMapRef
}) => {
  const handleDayClick = (day: any, modifiers: any = null) => {
    if (modifiers?.disabled) {
      return;
    }
    handleSelectDate(day);
  };

  const disabledDays: Date[] = [];

  if (closedDatesMapRef) {
    closedDatesMapRef.forEach((dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      // Month is 0-indexed
      disabledDays.push(new Date(year, month - 1, day));
    });
  }

  if (idDisabledBeforeDate) {
    disabledDays.push({ before: new Date() } as any);
  }

  return (
    <DayPicker
      mode="single"
      month={month}
      selected={bookingDate}
      onSelect={handleDayClick}
      showOutsideDays={true}
      className="booking-calendar w-full rounded-lg bg-muted py-12"
      style={{ margin: 0 }}
      disableNavigation={true}
      disabled={disabledDays}
    />
  );
};

export default BookingCalendar;

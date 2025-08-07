import React, { useState } from 'react';
import CalendarMonth from '@/components/pos/calendar-month';
import BookingCalendar from '@/components/pos/booking-calendar';
import { Dialog, DialogContent } from '../ui/dialog';

interface SelectBookingCalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  openBookingCalendar: boolean;
  handleCloseSelectedBookingCalendar: (open: boolean) => void;
}

const SelectBookingCalendar: React.FC<SelectBookingCalendarProps> = ({
  selectedDate,
  setSelectedDate,
  openBookingCalendar,
  handleCloseSelectedBookingCalendar
}) => {
  const [bookingDate, setBookingDate] = useState(selectedDate);
  const [month, setMonth] = useState(selectedDate);

  const handleSelectDate = (date: Date) => {
    setBookingDate(date);
    selectMonth(date);
    setSelectedDate(date);
    handleCloseSelectedBookingCalendar(!openBookingCalendar);
  };

  const selectMonth = (selectedMonth: Date) => {
    setMonth(selectedMonth);
  };

  return (
    <Dialog
      open={openBookingCalendar}
      onOpenChange={() => handleCloseSelectedBookingCalendar(false)} // Close when clicking outside
      modal
    >
      <DialogContent>
        <div className="h-full w-full outline-none backdrop-blur-md backdrop-filter">
          <div className="relative h-full w-full">
            <div className="mb-2 mt-4 w-full">
              <CalendarMonth selectMonth={selectMonth} />
            </div>
            <BookingCalendar
              bookingDate={bookingDate}
              month={month}
              handleSelectDate={handleSelectDate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectBookingCalendar;

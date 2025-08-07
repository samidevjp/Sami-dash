import moment from 'moment';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface BookingCalendarArrowProps {
  arrowType: string;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const BookingCalendarArrow: React.FC<BookingCalendarArrowProps> = ({
  arrowType,
  selectedDate,
  setSelectedDate
}) => {
  const nextDate = () => {
    setSelectedDate(
      moment(formatDateShort(selectedDate)).add(1, 'day').toDate()
    );
  };

  const prevDate = () => {
    setSelectedDate(
      moment(formatDateShort(selectedDate)).subtract(1, 'day').toDate()
    );
  };

  return (
    <div>
      {arrowType === 'left' ? (
        <ChevronLeft onClick={prevDate} className="cursor-pointer text-sm" />
      ) : (
        <ChevronRight onClick={nextDate} className="cursor-pointer text-sm" />
      )}
    </div>
  );
};

export default BookingCalendarArrow;

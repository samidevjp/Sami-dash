import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
export default function DateRangePicker({ onDateRangeChange }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  useEffect(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(
      today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
    );
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    const initioalDateRange = { from: sunday, to: saturday };
    setDateRange(initioalDateRange);
    onDateRangeChange(initioalDateRange);
  }, []);
  const openDateRangeCalendar = () => {
    setIsOpen(true);
  };
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-AU', { month: 'long', day: 'numeric' });
  };
  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range) {
      onDateRangeChange(range);
    }
  };
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="neo-outer-glow w-80 rounded-full bg-secondary px-8 py-2 text-base "
          onClick={openDateRangeCalendar}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from && dateRange.to
            ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
            : `date range`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

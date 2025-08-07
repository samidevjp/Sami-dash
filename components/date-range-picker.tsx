'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import * as React from 'react';
import { DateRange, Matcher } from 'react-day-picker';

export function CalendarDateRangePicker({
  className,
  onDateChange,
  initialDateRange,
  disabled
}: {
  className?: string;
  onDateChange: (date: DateRange | undefined) => void;
  initialDateRange: DateRange | undefined;
  disabled?: Matcher | Matcher[];
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDateRange
  );

  React.useEffect(() => {
    setDate(initialDateRange);
  }, [initialDateRange]);

  const handleDateChange = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    onDateChange(selectedDate);
  };

  const handleClear = () => {
    setDate(undefined);
    onDateChange(undefined);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
              disabled={disabled}
            />
            <Button onClick={handleClear} className="mt-3 w-full">
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

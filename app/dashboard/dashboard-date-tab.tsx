import React from 'react';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface Props {
  activeTab: string;
  dateRange: any;
  setDateRange: (range: any) => void;
  setTempRange: (range: any) => void;
  handleDateChange: (direction: 'prev' | 'next') => void;
  getFilterDateLabel: () => string;
  filter: string;
  updateFilter: (value: string) => void;
  dayViewFilter: any;
  setDayViewFilter: (value: any) => void;
  filterTypes: { value: string; label: string }[];
  isRangeSelected: boolean;
}

const DashboardDateTab: React.FC<Props> = ({
  activeTab,
  dateRange,
  setDateRange,
  setTempRange,
  isRangeSelected,
  handleDateChange,
  getFilterDateLabel,
  filter,
  updateFilter,
  dayViewFilter,
  setDayViewFilter,
  filterTypes
}) => {
  if (activeTab === 'overview') {
    return (
      <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:items-center">
        <div className="mb-4 w-fit rounded-md bg-muted px-4 py-2 text-sm font-medium">
          📅 Showing data for:{' '}
          {isRangeSelected
            ? `${moment(dateRange?.from).format('D MMM')} – ${moment(
                dateRange?.to
              ).format('D MMM')}`
            : `${moment(dateRange?.from).format('dddd, D MMM')}`}
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => handleDateChange('prev')}
              className="px-2"
            >
              <ChevronLeft />
            </Button>
            <div
              className={`w-full rounded-lg py-2 text-center md:w-60 ${
                isRangeSelected
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-secondary'
              }`}
            >
              <span className="text-sm font-medium">
                {moment(dateRange?.from).isSame(dateRange?.to, 'day')
                  ? moment(dateRange?.from).format('ddd, D MMM')
                  : `${moment(dateRange?.from).format('MMM D')}`}
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={() => handleDateChange('next')}
              className="px-2"
            >
              <ChevronRight />
            </Button>
          </div>

          <div className="flex justify-center gap-2 pr-2 md:items-center">
            <CalendarDateRangePicker
              onDateChange={(range) => {
                setTempRange(range);
                if (range?.from && range?.to) {
                  setDateRange(range);
                }
              }}
              initialDateRange={undefined}
              disabled={{ after: new Date() }}
              className={`w-full rounded-lg py-2 text-center  ${
                !isRangeSelected ? 'text-muted-foreground' : ''
              }`}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'analytics') {
    return (
      <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:items-center md:gap-4">
        <div className="mb-4 w-fit rounded-md bg-muted px-4 py-2 text-sm font-medium">
          📅 Showing data for: {getFilterDateLabel()}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'today' ? 'default' : 'outline'}
            onClick={() => {
              updateFilter('today');
            }}
          >
            Today
          </Button>
          <Button
            variant={filter === '7 days' ? 'default' : 'outline'}
            onClick={() => {
              updateFilter('7 days');
            }}
          >
            7 days
          </Button>
          <Button
            variant={filter === '14 days' ? 'default' : 'outline'}
            onClick={() => {
              updateFilter('14 days');
            }}
          >
            14 days
          </Button>
          <Button
            variant={filter === '30 days' ? 'default' : 'outline'}
            onClick={() => {
              updateFilter('30 days');
            }}
          >
            30 days
          </Button>
        </div>
      </div>
    );
  }

  if (activeTab === 'sales') {
    return (
      <div className="md:flex md:items-center md:justify-between">
        <div className="mb-4 w-fit rounded-md bg-muted px-4 py-2 text-sm font-medium">
          📅 Showing data for: {getFilterDateLabel()}
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <Select
              value={dayViewFilter.filter_type}
              onValueChange={(value) =>
                setDayViewFilter({
                  ...dayViewFilter,
                  filter_type: value
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                {filterTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CalendarDateRangePicker
              onDateChange={(range) => {
                if (range?.from && range?.to) {
                  setDayViewFilter({
                    ...dayViewFilter,
                    date_range: `${formatDateShort(
                      range.from
                    )},${formatDateShort(range.to)}`,
                    filter: ''
                  });
                }
              }}
              initialDateRange={undefined}
              disabled={{ after: new Date() }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'today' ? 'default' : 'outline'}
              onClick={() => {
                updateFilter('today');
              }}
            >
              Today
            </Button>
            <Button
              variant={filter === '7 days' ? 'default' : 'outline'}
              onClick={() => {
                updateFilter('7 days');
              }}
            >
              7 days
            </Button>
            <Button
              variant={filter === '14 days' ? 'default' : 'outline'}
              onClick={() => {
                updateFilter('14 days');
              }}
            >
              14 days
            </Button>
            <Button
              variant={filter === '30 days' ? 'default' : 'outline'}
              onClick={() => {
                updateFilter('30 days');
              }}
            >
              30 days
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default DashboardDateTab;

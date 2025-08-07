import React, { useState } from 'react';
import { BOOKINGSTATUS } from '@/utils/enum';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface ReservationDropDownProps {
  statusOption: any;
  selectedOption: any;
  setSelectedOption: any;
  startDate: any;
  hideLeftIcon: any;
  bookingStatus?: any;
}

const ReservationDropDown: React.FC<ReservationDropDownProps> = ({
  statusOption,
  selectedOption,
  setSelectedOption,
  hideLeftIcon,
  bookingStatus
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSetSelectedOption = (item: any) => {
    setIsOpen(!isOpen);
    setSelectedOption(item);
  };

  const getTextStyle = (value: number) => {
    if (value === BOOKINGSTATUS.overTime) {
      return `text-booking-overtime`;
    }
    if (value === BOOKINGSTATUS.finished) {
      return 'text-gray-600';
    }
    if (
      value === BOOKINGSTATUS.cancelled ||
      bookingStatus === BOOKINGSTATUS.cancelled
    ) {
      return 'text-gray-500';
    }
    return 'inherit';
  };

  return (
    <>
      <div className="flex items-center justify-center">
        {!hideLeftIcon && (
          <Image
            className="mr-2"
            src={selectedOption.icon}
            width="20"
            height="20"
            alt="checker"
          />
        )}
        <span
          className={`tableName overflow-hidden truncate ${getTextStyle(
            selectedOption.value
          )}`}
        >
          {selectedOption === null
            ? '- No Selected Status -'
            : typeof selectedOption === 'object'
            ? selectedOption.name
            : selectedOption}
        </span>
      </div>
      <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className="absolute left-0 top-0 w-full opacity-0"
            variant="ghost"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {statusOption.map((item: any, index: number) => (
            <DropdownMenuItem
              onSelect={() => handleSetSelectedOption(item)}
              key={index}
            >
              {item.icon && (
                <Image
                  className="mr-2"
                  src={item.icon}
                  width="20"
                  height="20"
                  alt="checker"
                />
              )}
              {typeof item === 'object' ? item.name : item}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ReservationDropDown;

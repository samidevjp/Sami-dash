import React, { useState } from 'react';
import {
  getTimeOnly,
  getFullname,
  getGuestPhoneNum,
  getTableSize,
  getFloorName,
  sortBookingBySection,
  filterShifts
} from '@/utils/Utility';
import { BOOKINGSTATUS, BOOKINGTYPE } from '@/utils/enum';
import billedIcon from '@/public/images/booking/left-panel-menu/billed-icon.png';
import experienceIcon from '@/public/images/booking/create-booking/booking-option-experience-icon.png';
import widgetIcon from '@/public/images/booking/widget-icon.png';
import Image from 'next/image';
import { Booking } from '@/hooks/useBookings';
import {
  CircleAlert,
  NotebookText,
  Printer,
  Ratio,
  UsersRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import moment from 'moment';
import {
  getBookingStatusColor,
  getNameStatusColor,
  hasConflictBooking
} from '@/utils/common';
import { printBookings } from '@/utils/printBookings';
const iconStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8
};
const IconItem = ({
  width,
  totalPartySize,
  tableLength,
  selectedOptionName,
  className
}: {
  width: string;
  totalPartySize: number;
  tableLength: number;
  selectedOptionName?: string;
  className?: string;
}) => (
  <div className={`flex w-full items-center justify-between ${className}`}>
    {selectedOptionName && (
      <p className="text-base leading-5">
        <span className="text-[10px]">Sort By:</span> <br />
        {selectedOptionName}
      </p>
    )}
    <div
      className="flex justify-end gap-4"
      style={{
        width: width
      }}
    >
      <div style={iconStyle}>
        <UsersRound width={24} />
        <span className="text-lg">{totalPartySize}</span>
      </div>
      <div style={iconStyle}>
        <Ratio size={24} />
        <span className="text-lg">{tableLength}</span>
      </div>
    </div>
  </div>
);
interface bookingItemProps {
  item: any;
  selectedBooking: any;
  handleBookingSelect: any;
  floors: any;
  bookingsList: any;
}
const BookingItem: React.FC<bookingItemProps> = ({
  item,
  selectedBooking,
  handleBookingSelect,
  floors,
  bookingsList
}) => (
  <li
    onClick={() => handleBookingSelect(item)}
    className={`booking-list-item cursor-pointer bg-transparent p-2 transition-all duration-300 hover:bg-muted/60
      ${
        selectedBooking !== null && selectedBooking.id === item.id
          ? 'bg-muted/60'
          : ''
      }
      ${
        BOOKINGSTATUS.finished === item.status ||
        BOOKINGSTATUS.cancelled === item.status ||
        BOOKINGSTATUS.billed === item.status
          ? 'opacity-60'
          : ''
      }
    `}
    key={item.id}
  >
    <div className="booking-list-item-container flex w-full justify-between">
      <div className="flex items-center">
        <div
          className={`
            booking-list-item-time flex h-[60px] w-[60px] items-center justify-center rounded bg-reservationIcon p-2 text-center text-sm font-bold
            ${item.status === BOOKINGSTATUS.cancelled ? 'bg-cancelled' : ''}
          `}
        >
          <span>{getTimeOnly(item.start_date)}</span>
        </div>
        <div className="ml-2 max-w-32 font-medium">
          <div className="customer-name">
            <span className={`${getNameStatusColor(item.status)}`}>
              {getFullname(item.guest)}
            </span>
          </div>
          {getGuestPhoneNum(item.guest) !== '' && (
            <div>
              <span className="text-xs text-secondary-foreground">
                {getGuestPhoneNum(item.guest)}
              </span>
            </div>
          )}
          <div>
            {item.status === BOOKINGSTATUS.partiallySeated && (
              <span className={`text-xs text-booking-partiallySeated`}>
                ( {item.partial_seated} ) &nbsp;
              </span>
            )}
            <span className="text-xs text-secondary-foreground">
              {getTableSize(item) + ' / ' + getFloorName(item.floor_id, floors)}
            </span>
          </div>
        </div>
      </div>
      <div className="booking-list-item-table text-right">
        <span
          className={`border p-1 text-xs font-bold ${getBookingStatusColor(
            'text',
            item.status,
            item.start_date
          )} ${getBookingStatusColor(
            'border',
            item.status,
            item.start_date
          )} rounded`}
        >
          {item.table.length > 1
            ? item.table[0].name + '+'
            : item.table.length > 0
            ? item.table[0].name
            : ''}
        </span>

        <div className="booking-list-item-icons mt-4 flex items-center justify-end gap-1">
          {item.status !== BOOKINGSTATUS.cancelled &&
            item.status !== BOOKINGSTATUS.finished &&
            hasConflictBooking(null, item.table, bookingsList) && (
              <CircleAlert className="text-red" size={18} />
            )}
          {item.reservation_note !== null && <NotebookText width={18} />}
          {item.status === BOOKINGSTATUS.billed && (
            <Image src={billedIcon} width="18" height="18" alt="checker" />
          )}
          {item.type === BOOKINGTYPE.widget && (
            <span>
              <Image src={widgetIcon} width="18" height="18" alt="checker" />
            </span>
          )}
          {item.type === BOOKINGTYPE.experience && (
            <Image src={experienceIcon} width="18" height="18" alt="checker" />
          )}
        </div>
      </div>
    </div>
  </li>
);

interface BookingListProps {
  filteredBookingList: any;
  allBookingsDevideByShift: Booking[];
  selectedBooking: any;
  selectedBookingHandler: any;
  floors: any[];
  keyword: string;
  selectedOption: string;
  selectedOptionName: string;
  shifts?: any[];
  allBookings: any[];
  selectedDate: Date;
}

const BookingList: React.FC<BookingListProps> = ({
  filteredBookingList,
  allBookingsDevideByShift,
  selectedBooking,
  selectedBookingHandler,
  floors,
  keyword,
  selectedOption,
  selectedOptionName,
  shifts = [],
  allBookings,
  selectedDate
}) => {
  const tailwindBookingListSection =
    'h-12 px-2 font-medium flex items-center mb-2 border-b';
  const [printDropdownOpen, setPrintDropdownOpen] = useState(false);

  const handleBookingSelect = (booking: Booking) => {
    selectedBookingHandler(selectedBooking?.id === booking.id ? null : booking);
  };

  // Function to print bookings based on the selected shift
  const handlePrint = (shiftName: string, shiftId?: number) => {
    printBookings(shiftName, shiftId, allBookings, filteredShiftsData);
  };

  const filteredShiftsData = filterShifts(
    shifts,
    moment(selectedDate).isoWeekday()
  );

  // Get unique shift names from active bookings for dropdown menu
  const getUniqueShifts = () => {
    return (
      filteredShiftsData?.map((shift: any) => ({
        id: shift.id,
        name: shift.name
      })) || []
    );
  };

  const renderBookingItems = (bookingList: any) => (
    <div>
      <div className={tailwindBookingListSection}>
        <IconItem
          width="50%"
          totalPartySize={
            bookingList.length &&
            bookingList.reduce(
              (total: any, item: any) =>
                item.status !== BOOKINGSTATUS.cancelled
                  ? total + item.party_size
                  : total,
              0
            )
          }
          tableLength={
            bookingList.length &&
            bookingList.reduce(
              (total: any, item: any) =>
                item.status !== BOOKINGSTATUS.cancelled
                  ? total + item.table.length
                  : total,
              0
            )
          }
          selectedOptionName={selectedOptionName}
        />
        <div className="ml-2">
          <DropdownMenu
            open={printDropdownOpen}
            onOpenChange={setPrintDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Printer size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePrint('All Day')}>
                Print All Day
              </DropdownMenuItem>
              {getUniqueShifts().map((shift: any) => (
                <DropdownMenuItem
                  key={shift.id}
                  onClick={() => handlePrint(shift.name, shift.id)}
                >
                  Print {shift.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ul>
        {bookingList.length > 0 &&
          bookingList.map((item: any) => (
            <BookingItem
              key={item.id}
              item={item}
              selectedBooking={selectedBooking}
              handleBookingSelect={handleBookingSelect}
              floors={floors}
              bookingsList={filteredBookingList}
            />
          ))}
      </ul>
    </div>
  );

  return (
    <div className="booking-list mb-2 max-h-[520px] min-h-[480px] w-full select-none overflow-y-auto">
      {parseInt(selectedOption) !== 3 ? (
        renderBookingItems(filteredBookingList)
      ) : (
        <ul>
          {sortBookingBySection(allBookingsDevideByShift, keyword).length > 0 &&
            sortBookingBySection(allBookingsDevideByShift, keyword).map(
              (section, index) => (
                <li className="mb-8" key={section.sectionName}>
                  <div className={tailwindBookingListSection}>
                    <div className="flex-1">
                      <div>
                        <span>{section.sectionName}</span>
                      </div>
                      <div className="text-[10px]">
                        <span>By schedule time</span>
                      </div>
                    </div>
                    <IconItem
                      width="auto"
                      totalPartySize={section.totalPartySize}
                      tableLength={section.totalTable}
                      className="!w-auto"
                    />
                    {index === 0 && (
                      <div className="ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // For sections, we need to find the corresponding shift ID
                            const shift = shifts.find(
                              (s: any) => s.name === section.sectionName
                            );
                            if (shift) {
                              handlePrint(section.sectionName, shift.id);
                            } else {
                              handlePrint(section.sectionName);
                            }
                          }}
                        >
                          <Printer size={18} />
                        </Button>
                      </div>
                    )}
                  </div>
                  <ul>
                    {section?.bookings?.map((item: any) => (
                      <BookingItem
                        key={item.id}
                        item={item}
                        selectedBooking={selectedBooking}
                        handleBookingSelect={handleBookingSelect}
                        floors={floors}
                        bookingsList={allBookingsDevideByShift}
                      />
                    ))}
                  </ul>
                </li>
              )
            )}
        </ul>
      )}
    </div>
  );
};

export default BookingList;

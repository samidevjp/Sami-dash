import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import ReservationDropDown from '@/components/pos/reservation-drop-down';
import EditPartySizeTableModal from '@/components/pos/edit-party-size-table-modal';
import ReservationButton from '@/components/pos/reservation-button';
import PartialPartySize from '@/components/pos/partial-party-size';
import EditBookingTimeModal from '@/components/pos/edit-booking-time-modal';
import EditSessionTimeModal from '@/components/pos/edit-session-time-modal';
import btnTimelineIcon from '@/public/images/booking/btn-timeline-icon.png';
import { debounce } from 'lodash';

import {
  getBookingStatus,
  getRemainingTime,
  getTimeStr,
  updateDateTime
} from '@/utils/Utility';
import { BOOKINGSTATUS, TABLELOCKSTATUS } from '@/utils/enum';
import { Textarea } from '../ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

const cardStyle =
  'border bg-secondary border-border w-full p-2 text-center cursor-pointer overflow-visible relative text-sm rounded-lg';

interface BookingControlPanelProps {
  selectedBooking: any;
  statusOption: any;
  floor: any;
  handleSetOpenCalendar: any;
  editPartySizeTableHandle: any;
  selectedStatusOption: any;
  partyPartySizeHandler: any;
  openPartialPartySize: any;
  setOpenPartialPartySize: any;
  statusBtnOnClickHandler: any;
  setSelectedBooking: any;
  handleUpdateBooking: any;
  timeList: any;
  setIsSaving: any;
  setGuest: any;
  guest: any;
}

const BookingControlPanel: React.FC<BookingControlPanelProps> = ({
  selectedBooking,
  statusOption,
  floor,
  handleSetOpenCalendar,
  editPartySizeTableHandle,
  selectedStatusOption,
  partyPartySizeHandler,
  openPartialPartySize,
  setOpenPartialPartySize,
  statusBtnOnClickHandler,
  setSelectedBooking,
  handleUpdateBooking,
  timeList,
  setIsSaving,
  setGuest,
  guest
}) => {
  const [selectTableStatusBoxVisible, setSelectTableStatusBoxVisible] =
    useState(false);

  const [editSessionTimeOpen, setEditSessionTimeOpen] = useState(false);
  const handleOpenEditSessionTime = () => {
    if (!editSessionTimeOpen) {
      setEditSessionTimeOpen(true);
    }
  };

  const [partySizeOpen, setPartySizeOpen] = useState(false);
  const [bookingTimeOpen, setBookingTimeOpen] = useState(false);
  const [note, setNote] = useState(selectedBooking.reservation_note || '');
  const updateTableLockStatus = (tableLockStatus: number) => {
    let booking = selectedBooking;
    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }
    booking = { ...booking, table_lock: tableLockStatus };
    setSelectedBooking(booking);
    handleUpdateBooking(booking);
    setSelectTableStatusBoxVisible(false);
  };
  useEffect(() => {
    if (
      selectedBooking.reservation_note !== undefined &&
      selectedBooking.reservation_note !== null
    ) {
      setNote(selectedBooking.reservation_note);
    }
  }, [selectedBooking]);

  const debouncedSave = useCallback(
    debounce((value) => updateValue(value, 1), 1500),
    []
  );

  const handleChange = (event: any) => {
    const { value } = event.target;
    setNote(value);
    debouncedSave(value);
  };

  const updateValue = (val: any, type: number) => {
    let booking = selectedBooking;
    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }

    setIsSaving(true);

    switch (type) {
      case 1:
        booking = { ...booking, reservation_note: val };

        setSelectedBooking(booking);
        handleUpdateBooking(booking);
        break;
      case 2:
        setGuest({ ...guest, general_note: val });
        break;
      case 3:
        setGuest({ ...guest, special_relationship: val });
        break;
      case 4:
        setGuest({ ...guest, seating_preference: val });
        break;
      case 5:
        setGuest({ ...guest, food_drink_preference: val });
        break;
    }
  };
  const getBookingStatusButton = (status: number) => {
    switch (status) {
      case BOOKINGSTATUS.waitList:
      case BOOKINGSTATUS.upcoming:
      case BOOKINGSTATUS.all:
      case BOOKINGSTATUS.late:
      case BOOKINGSTATUS.partiallySeated:
        return {
          title: 'Seat',
          value: BOOKINGSTATUS.seated
        };
      case BOOKINGSTATUS.finished:
      case BOOKINGSTATUS.cancelled:
      case BOOKINGSTATUS.noShow:
        return {
          title: 'Revert',
          value: BOOKINGSTATUS.upcoming
        };
      default:
        return {
          title: 'Finished',
          value: BOOKINGSTATUS.finished
        };
    }
  };

  const handleOpenEditPartySize = () => {
    if (!partySizeOpen) {
      setPartySizeOpen(true);
    }
  };

  const handleCloseEditPartySize = () => {
    if (partySizeOpen) {
      setPartySizeOpen(false);
    }
  };

  const handleOpenEditTimeBooking = () => {
    if (!bookingTimeOpen) {
      setBookingTimeOpen(true);
    }
  };

  const selectedTimeHandler = (time: any) => {
    let booking = selectedBooking;
    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }
    booking = {
      ...booking,
      start_time: time,
      end_time: time + booking.session_time,
      start_date: updateDateTime(booking.start_date, time),
      end_date: updateDateTime(booking.end_date, time + booking.session_time)
    };
    setSelectedBooking(booking);
    handleUpdateBooking(booking);
  };

  const selectedSessionTimeHandler = (time = null) => {
    setEditSessionTimeOpen(false);
    let booking = selectedBooking;
    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }
    if (time === null) {
      booking = {
        ...booking,
        end_date: moment(booking.start_date)
          .add(1, 'day')
          .subtract(1, 'minute')
          .format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment(booking.start_date)
          .add(1, 'day')
          .subtract(1, 'minute')
          .format('HHmm')
      };
    } else {
      const endDate = moment(booking.start_date)
        .add(time, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
      const momentDate = moment(endDate);
      booking = {
        ...booking,
        end_date: endDate,
        end_time:
          momentDate.hours() * 3600 +
          momentDate.minutes() * 60 +
          momentDate.seconds()
      };
    }
    setSelectedBooking(booking);
    handleUpdateBooking(booking);
  };

  return (
    <div className="bookingControlPanel">
      <div className="flex flex-wrap gap-2">
        <div className="controlPanel-timeWrapper w-full  sm:flex-[1_1_30%]">
          <div className={`${cardStyle} `} onClick={handleOpenEditTimeBooking}>
            <span className="header-text">
              {getTimeStr(selectedBooking.start_time)}
            </span>
          </div>
        </div>
        <div className="controlPanel-tableWrapper relative w-full sm:flex-[1_1_30%]">
          <div className={cardStyle}>
            <span>
              {selectedBooking && selectedBooking?.table?.length > 1
                ? `${selectedBooking?.table?.map((e: any) => e.name).join(',')}`
                : `${
                    selectedBooking?.table
                      ? selectedBooking?.table[0]?.name
                      : ''
                  }`}
            </span>
          </div>
          <DropdownMenu
            modal={false}
            open={selectTableStatusBoxVisible}
            onOpenChange={setSelectTableStatusBoxVisible}
          >
            <DropdownMenuTrigger asChild>
              <Button
                className="absolute left-0 top-0 w-full opacity-0"
                variant="ghost"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {selectedBooking.table_lock === TABLELOCKSTATUS.unlocked ? (
                <DropdownMenuItem
                  onSelect={() => updateTableLockStatus(TABLELOCKSTATUS.locked)}
                >
                  Lock booking table
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() =>
                    updateTableLockStatus(TABLELOCKSTATUS.unlocked)
                  }
                >
                  Unlock booking table
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={handleOpenEditPartySize}>
                Change table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="controlPanel-calendarWrapper w-full sm:flex-[1_1_30%]">
          <div className={cardStyle} onClick={handleSetOpenCalendar}>
            <span>
              {moment(selectedBooking.start_date).format('DD MMM YYYY')}
            </span>
          </div>
        </div>
        <div className="controlPanel-partysizeWrapper w-full sm:flex-[1_1_30%]">
          <div className={cardStyle} onClick={handleOpenEditPartySize}>
            <span className="header-text">{`${selectedBooking.party_size} ${
              selectedBooking.party_size > 1 ? 'guests' : 'guest'
            }`}</span>
          </div>
        </div>
        <div className="controlPanel-bookingSessionWrapper w-full sm:flex-[1_1_30%]">
          <div className={cardStyle} onClick={handleOpenEditSessionTime}>
            <span
              className={`header-text ${
                selectedBooking.status === BOOKINGSTATUS.overTime &&
                'text-booking-overtime'
              }`}
            >
              {getRemainingTime(
                selectedBooking.start_time,
                selectedBooking.end_time,
                selectedBooking.status,
                Boolean(selectedBooking.no_limit)
              )}
            </span>
          </div>
        </div>
        <div className="controlPanel-reservationDropdownWrapper w-full sm:flex-[1_1_30%]">
          <div className={`${cardStyle} dropdown-wrapper relative`}>
            <ReservationDropDown
              selectedOption={getBookingStatus(selectedBooking.status)}
              statusOption={statusOption}
              startDate={selectedBooking.start_date}
              hideLeftIcon={false}
              setSelectedOption={selectedStatusOption}
            />
            <PartialPartySize
              partyPartySizeHandler={partyPartySizeHandler}
              openPartialPartySize={openPartialPartySize}
              handleCloseSelectedBookingCalendar={setOpenPartialPartySize}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="rounded-lg">
            <ReservationButton
              onClickHandler={statusBtnOnClickHandler}
              selectedBookingStatus={getBookingStatusButton(
                selectedBooking.status
              )}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="rounded-lg">
            <Textarea
              id="note"
              name="note"
              className="min-h-40 bg-secondary"
              placeholder="Leave Note"
              onChange={handleChange}
              value={note}
            />
          </div>
        </div>
      </div>
      <EditBookingTimeModal
        bookingTimeOpen={bookingTimeOpen}
        setBookingTimeOpen={setBookingTimeOpen}
        selectedTimeHandler={selectedTimeHandler}
        timeList={timeList}
        btnTimelineIcon={btnTimelineIcon}
      />
      <EditSessionTimeModal
        editSessionTimeOpen={editSessionTimeOpen}
        setEditSessionTimeOpen={setEditSessionTimeOpen}
        selectedSessionTimeHandler={selectedSessionTimeHandler}
        modalTitle={'EDIT SESSION TIME'}
      />
      <EditPartySizeTableModal
        partySizeOpen={partySizeOpen}
        handleCloseEditPartySize={handleCloseEditPartySize}
        editPartySizeTableHandle={editPartySizeTableHandle}
        floor={floor}
        propSelectedTables={selectedBooking.table}
        startDate={selectedBooking.start_date}
        propPartySize={selectedBooking.party_size}
        startTime={selectedBooking.start_time}
      />
    </div>
  );
};

export default BookingControlPanel;

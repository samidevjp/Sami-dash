import React, { useEffect, useState } from 'react';
import {
  filterTableByFloor,
  getShiftByTime,
  filterShifts,
  getFullname,
  getAllTime
} from '@/utils/Utility';

import { BOOKINGSTATUS, BOOKINGTYPE } from '@/utils/enum';

// Components
import CalendarMonth from '@/components/pos/calendar-month';
import BookingCalendar from '@/components/pos/booking-calendar';
import PartySizeSelection from '@/components/pos/party-size-selection';
import TableFilter from '@/components/pos/table-filter';
import BookingButton from '@/components/pos/booking-button';
import TableList from '@/components/pos/table-list';
import TimeTable from '@/components/pos/time-table';
import BookingNotes from '@/components/pos/booking-notes';
import BookingEmployeeList from '@/components/pos/booking-employee-list';
import { v4 as uuid } from 'uuid';

import moment from 'moment';
import { isEmpty } from 'lodash';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';

import { Button } from '../ui/button';
import {
  LayoutGrid,
  Mail,
  MapPin,
  Phone,
  UserRound,
  UsersRound
} from 'lucide-react';
import { Input } from '../ui/input';
import { Dialog, DialogContent } from '../ui/dialog';
import TableFloorModal from './table-floor-modal';

const getStringTime = (d: number): string => {
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);

  const hDisplay = String(h).padStart(2, '0');
  const mDisplay = String(m).padStart(2, '0');

  return `${hDisplay}:${mDisplay}:00`;
};
interface Guest {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  company: string;
  state: string;
  general_note: string;
  birthdate: string;
  anniversary: string;
  special_relationship: string;
  id: number;
  address: string;
  city: string;
  food_drink_preference: string;
  postal: string;
  tags: string[];
  seating_preference: string;
}

export const createGuest = (
  guestName: string,
  phone: string,
  email: string = '',
  address: string = ''
): Guest => {
  const nameArray = guestName.split(' ');
  return {
    first_name: nameArray[0],
    last_name: nameArray[1] !== undefined ? nameArray[1] : '',
    phone: phone,
    email: email,
    company: '',
    state: '',
    general_note: '',
    birthdate: '',
    anniversary: '',
    special_relationship: '',
    id: 0,
    address: address || '',
    city: '',
    food_drink_preference: '',
    postal: '',
    tags: [],
    seating_preference: ''
  };
};
interface CreateBookingProps {
  allEmployees: any;
  allShifts: any;
  floors: any;
  guest?: any;
  handleCloseCreateBooking: () => void;
  isBookingModalOpen: boolean;
  selectedDate: Date;
  selectedShiftId: number | undefined;
  tableDetailsData: any;
  setIsBookingModalOpen: (isOpen: boolean) => void;
  updateData: () => void;
  closedDatesMapRef: Map<string, string>;
}

const CreateBooking = ({
  allEmployees,
  allShifts,
  floors,
  guest,
  handleCloseCreateBooking,
  isBookingModalOpen,
  selectedDate,
  selectedShiftId,
  tableDetailsData,
  setIsBookingModalOpen,
  updateData,
  closedDatesMapRef
}: CreateBookingProps) => {
  const [selectedShift, setSelectedShift] = useState(
    allShifts.find((shift: any) => shift.id === selectedShiftId)
  );
  const [employeeData, setEmployeeData] = useState(allEmployees[0]);
  const [isOpenBookingNoteModal, setIsOpenBookingNoteModal] = useState(false);
  const [createBookingEmployee, setCreateBookingEmployee] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [bookingDate, setBookingDate] = useState(selectedDate);
  const [selectedBookingType, setSelectedBookingType] = useState(
    BOOKINGTYPE.inhouse
  );
  const [selectedTime, setSelectedTime] = useState(0);
  const [toFilterFloor, setToFilterFloor] = useState(floors[0]);
  const [selectedTableIds, setSelectedTableIds] = useState<any>(
    tableDetailsData && tableDetailsData.id ? [tableDetailsData.id] : []
  );
  const [bookingTypeSelected, setBookingTypeSelected] = useState(false);
  const tableLockSelected = false;
  const [partySize, setPartySize] = useState(1);
  const [tableList, setTableList] = useState(null);
  const [tablesData, setTablesData] = useState([]);

  const [hasError, setHasError] = useState(false);
  const [bookingType, setBookingType] = useState('phone');
  const [bookingNote, setBookingNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const expNoOfTickets = 0;

  const [expId, setExpId] = useState(0);
  const { searchTables, createBooking, getBookings } = useApi();
  const [experienceShiftId, setExperienceShiftId] = useState(0);
  const [timeList, setTimeList] = useState<string[]>([]);
  const [allBookings, setAllbookings] = useState<any[]>([]);
  const formatDateLocal = (date: Date) => {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const localTime = new Date(date.getTime() - offsetMs);
    return localTime.toISOString().split('T')[0];
  };
  const handleGetBookings = async () => {
    const formattedDate = formatDateLocal(new Date(bookingDate));

    const response = await getBookings({
      date: formattedDate,
      shift_id: 0
    });

    setAllbookings(response?.data?.bookings);
  };

  const [bookedTableIds, setBookedTableIds] = useState<number[]>([]);

  useEffect(() => {
    setBookedTableIds([]);
    if (!allBookings?.length || !selectedTime) return;
    const selectedTableIds = allBookings
      .filter((booking: any) => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        const startSeconds =
          start.getHours() * 3600 +
          start.getMinutes() * 60 +
          start.getSeconds();
        const endSeconds =
          end.getHours() * 3600 + end.getMinutes() * 60 + end.getSeconds();
        return selectedTime >= startSeconds && selectedTime < endSeconds;
      })
      .flatMap((booking: any) => booking.table.map((table: any) => table.id));
    setBookedTableIds(selectedTableIds);
  }, [selectedTime, allBookings]);

  let _floor = floors[0];
  const inputContainer = 'w-full h-[60px] rounded-lg flex items-center px-4';

  const selectMonth = (selectedMonth: Date) => {
    setMonth(selectedMonth);
  };

  useEffect(() => {
    handleGetBookings();
    getTimeLists(selectedDate);
  }, [bookingDate]);

  const handleSelectedDate = (date: Date) => {
    setBookingDate(date);
  };

  useEffect(() => {
    if (guest !== undefined) {
      setGuestName(getFullname(guest));
      setGuestPhone(guest.phone);
      setGuestAddress(guest.address);
    }
  }, [guest]);

  const guestNameOnChange = (e: any) => {
    setGuestName(e.target.value);
  };

  const guestPhoneOnChange = (e: any) => {
    let number;
    if (e.target.validity.valid) {
      number = e.target.value;
    } else {
      setHasError(true);
      return;
    }
    if (hasError) {
      setHasError(false);
    }
    setGuestPhone(number);
  };

  const handleSelectedPartySize = (value: any) => {
    if (isNaN(value)) {
      setHasError(true);
      return;
    }

    if (hasError) {
      setHasError(false);
    }
    setPartySize(value);
  };

  const handleSelectFloor = (floor: any) => {
    _floor = floor;
    setToFilterFloor(floor);
    setTableList(filterTableByFloor(floor.id, tablesData));
  };

  const selectedTimeHandler = (time: any) => {
    const filteredShifts = filterShifts(
      allShifts,
      moment(bookingDate).isoWeekday()
    );
    setSelectedTime(time);
    setSelectedShift(getShiftByTime(time, filteredShifts));
  };

  const selecteBookingType = (type: number) => {
    switch (type) {
      case BOOKINGTYPE.inhouse:
        setSelectedBookingType(type);
        setBookingType('walkin');
        handleUnmountExp();
        break;
      case BOOKINGTYPE.phone:
        setSelectedBookingType(type);
        setBookingType('phone');
        handleUnmountExp();
        break;
      case BOOKINGTYPE.widget:
        setSelectedBookingType(type);
        setBookingType('network');
        handleUnmountExp();
        break;
    }
    setBookingTypeSelected(false);
  };

  const addNotes = () => {
    setIsOpenBookingNoteModal(true);
  };

  const handleCloseBookingNote = (e: any) => {
    if (isOpenBookingNoteModal) {
      setBookingNote(e);
      setIsOpenBookingNoteModal(false);
    }
  };

  const handleCloseBookingEmployee = () => {
    if (createBookingEmployee) {
      setCreateBookingEmployee(false);
    }
  };
  const { toast } = useToast();
  const saveBooking = async () => {
    if (isSaving) {
      return;
    }

    if (isEmpty(guestName)) {
      alert('Please enter guest name');
      return;
    }

    if (selectedTableIds === null) {
      alert('Please select table');
      return;
    }

    if (selectedTime === 0) {
      alert('Please select time');
      return;
    }

    setIsSaving(true);
    type CreateBookingParams = {
      shiftId: number;
      type: number;
      reservationNote: string;
      table_ids: any;
      table_lock: boolean;
      guest: any;
      bookingTaken: any;
      status: number;
      startDate: string;
      endDate: string;
      partySize: any;
      expId?: number;
      expNoOfTickets?: number;
    };

    const createBookingParameters = ({
      shiftId,
      type,
      reservationNote,
      table_ids,
      table_lock,
      guest,
      bookingTaken,
      status,
      startDate,
      endDate,
      partySize,
      expId = 0,
      expNoOfTickets = 0
    }: CreateBookingParams) => {
      const params: any = {
        shift_id: shiftId,
        id: 0,
        created_at: '',
        type,
        reservation_note: reservationNote,
        table_ids,
        table_lock,
        guest,
        no_limit: false,
        finished_date: '',
        booking_taken: bookingTaken,
        status,
        start_date: startDate,
        end_date: endDate,
        party_size: partySize,
        partial_seated: 0,
        uuid: uuid()
      };

      if (expId > 0) {
        params.experience_id = expId;
        params.experience_no_of_tickets = expNoOfTickets;
      }

      return params;
    };
    console.log(selectedShift);
    const startDate =
      moment(bookingDate).format('yyyy-MM-DD') +
      ` ${getStringTime(selectedTime)}`;

    const endDate =
      moment(bookingDate).format('yyyy-MM-DD') +
      ` ${getStringTime(selectedTime + selectedShift.turn_time)}`;
    const param = createBookingParameters({
      shiftId: selectedShift.id,
      type: selectedBookingType,
      reservationNote: bookingNote,
      table_ids: selectedTableIds,
      table_lock: tableLockSelected,
      guest: createGuest(guestName, guestPhone, guestMail, guestAddress),
      bookingTaken: employeeData ?? allEmployees[0],
      status: BOOKINGSTATUS.upcoming,
      startDate,
      endDate,
      partySize,
      expId,
      expNoOfTickets
    });

    try {
      const booking = await createBooking(param);
      if (booking) {
        setIsSaving(false);
        toast({
          title: 'Success',
          variant: 'success',

          description: 'Create Booking'
        });
        handleCloseCreateBooking();
      }
      updateData();
    } catch (err) {
      console.error('Error: ', err);
      toast({
        title: 'Error',
        variant: 'destructive',
        // @ts-ignore
        description: err?.message || ''
      });
      setIsSaving(false);
    }
  };

  useEffect(() => {
    handleSearchTables();
  }, [partySize, selectedTime]);
  const [isTableSeaching, setIsTableSeaching] = useState<boolean>(false);
  const [guestMail, setGuestMail] = useState('');
  const handleSearchTables = async () => {
    if (Number(partySize) === 0 || selectedTime === 0) {
      setHasError(true);
      return;
    }
    setIsTableSeaching(true);
    try {
      const param = {
        party_size: partySize,
        booking_time: selectedTime,
        booking_date: moment(bookingDate).format('yyyy-MM-DD'),
        show_suggested: false,
        show_all: false
      };

      const tables = await searchTables(param);
      if (tables) {
        setTablesData(tables);
        setTableList(
          filterTableByFloor(
            toFilterFloor === undefined ? _floor.id : toFilterFloor.id,
            tables
          )
        );
      }
    } catch (err) {
      console.error('Error: ', err);
    }
    setIsTableSeaching(false);
  };

  useEffect(() => {
    if (selectedShift === null) {
      setSelectedShift(
        allShifts.find((shift: any) => shift.id === selectedShiftId)
      );
    }
  }, [floors, selectedShiftId, selectedShift, hasError]);

  const [isOpenFloorPlan, setIsOpenFloorPlan] = useState<boolean>(false);

  const handleUnmountExp = () => {
    handleSelectedDate(new Date());
    setExpId(0);
    setExperienceShiftId(0);
    setSelectedShift(
      allShifts.find((shift: any) => shift.id === selectedShiftId)
    );
  };

  const getTimeLists = (date: Date) => {
    const filteredShiftsData = filterShifts(
      allShifts,
      moment(date).isoWeekday()
    );
    if (experienceShiftId === 0) {
      setTimeList(
        getAllTime(filteredShiftsData, moment(date).format('yyyy-MM-DD'))
      );
    } else {
      setTimeList(
        getAllTime(
          filteredShiftsData.find((e: any) => e.id === experienceShiftId),
          moment(date).format('yyyy-MM-DD')
        )
      );
    }
  };
  const [isAllSelected, setIsAllSelected] = useState(false);
  useEffect(() => {
    if (selectedDate && selectedTime !== 0 && selectedTableIds.length > 0) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedDate, selectedTime, selectedTableIds]);

  return (
    <Dialog
      open={isBookingModalOpen}
      onOpenChange={() => setIsBookingModalOpen(!isBookingModalOpen)}
    >
      <DialogContent className="-webkit-backdrop-blur-3xl h-[90%] min-w-[90%] overflow-auto backdrop-blur-3xl">
        <div className="relative h-full w-full outline-none backdrop-blur">
          <div className="mx-auto ">
            <div className="text-center text-2xl font-bold">Make a Booking</div>

            {/* Booking fields */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-1 rounded-lg bg-secondary text-right sm:col-span-1">
                <div className={`${inputContainer} float-right`}>
                  <UserRound size={24} className="mr-6" />
                  <Input
                    placeholder="Enter guest name"
                    className="border-none shadow-none focus-visible:ring-0"
                    value={guestName}
                    onChange={guestNameOnChange}
                  />
                </div>
              </div>
              <div className="col-span-1 flex gap-2 sm:col-span-1">
                <div className="flex-1 rounded-lg bg-secondary">
                  <div className={inputContainer}>
                    <Phone size={24} className="mr-6" />
                    <Input
                      placeholder="Contact number"
                      className="border-none shadow-none focus-visible:ring-0"
                      value={guestPhone}
                      onChange={guestPhoneOnChange}
                      type="tel"
                    />
                  </div>
                </div>
                <div className="flex-1 rounded-lg bg-secondary">
                  <div className={inputContainer}>
                    <Mail size={24} className="mr-6" />
                    <Input
                      placeholder="Email"
                      className="border-none shadow-none focus-visible:ring-0"
                      value={guestMail}
                      onChange={(e) => setGuestMail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div className="rounded-lg bg-secondary">
                <div className={inputContainer}>
                  <MapPin size={24} className="mr-6" />
                  <Input
                    placeholder="Guest Address (Optional)"
                    className="border-none shadow-none focus-visible:ring-0"
                    value={guestAddress}
                    onChange={(e) => setGuestAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Date selection */}
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-1 sm:col-span-1">
                <div className="flex justify-end">
                  <CalendarMonth month={month} selectMonth={selectMonth} />
                </div>
              </div>
              <div className="col-span-1 rounded-lg bg-secondary sm:col-span-1">
                <div className={inputContainer}>
                  <UsersRound size={24} className="mr-6" />
                  <Input
                    placeholder="Party Size"
                    className="border-none shadow-none focus-visible:ring-0"
                    value={partySize}
                    onChange={(event) =>
                      setPartySize(
                        parseInt(event.target.value ? event.target.value : '')
                      )
                    }
                    type="number"
                  />
                </div>
              </div>
            </div>

            {/* Calendar selection */}
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-1 sm:col-span-1">
                <div className="flex justify-end">
                  <BookingCalendar
                    bookingDate={bookingDate}
                    month={month}
                    handleSelectDate={handleSelectedDate}
                    idDisabledBeforeDate={true}
                    closedDatesMapRef={closedDatesMapRef}
                  />
                </div>
                <div className="flex justify-end">
                  {timeList.length > 0 && (
                    <TimeTable
                      selectedTimeHandler={selectedTimeHandler}
                      timeList={timeList}
                    />
                  )}
                </div>
              </div>
              <div className="col-span-1 sm:col-span-1">
                <div className="p-1">
                  <PartySizeSelection
                    handleSelectedPartySize={handleSelectedPartySize}
                    partySize={12}
                    propSelectedPartySize={partySize}
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <TableFilter
                    handleSelectFloor={handleSelectFloor}
                    floor={floors}
                  />
                  <div
                    className="flex cursor-pointer flex-col items-center"
                    onClick={() => setIsOpenFloorPlan(true)}
                  >
                    <LayoutGrid />
                    <p className="text-xs">Floor Plan</p>
                  </div>
                </div>
                {isOpenFloorPlan && (
                  <TableFloorModal
                    open={isOpenFloorPlan}
                    setOpenTableFloorModal={setIsOpenFloorPlan}
                    tables={tablesData}
                    floors={floors}
                    setSelectedTableIds={setSelectedTableIds}
                    selectedTableIds={selectedTableIds}
                    closedDatesMapRef={closedDatesMapRef}
                  />
                )}
                <div className="mt-4">
                  <TableList
                    isMultipleTable={true}
                    selectedTableIds={selectedTableIds}
                    floors={floors}
                    tables={tableList}
                    bookedTableIds={bookedTableIds}
                    setSelectedTableIds={setSelectedTableIds}
                    isLoading={isTableSeaching}
                  />
                </div>
                <div className="relative mt-4 flex w-full justify-end gap-4">
                  <Button
                    onClick={() => setCreateBookingEmployee(true)}
                    variant="outline"
                    className="block max-w-40 overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {employeeData === undefined
                      ? allEmployees[0].first_name +
                        ' ' +
                        allEmployees[0].last_name
                      : employeeData.first_name + ' ' + employeeData.last_name}
                  </Button>
                  <BookingButton
                    clickHandler={addNotes}
                    propIsSelected={bookingNote === '' ? false : true}
                    buttonOnly={true}
                    canSelect={false}
                    icon="note"
                  />
                  <BookingNotes
                    handleCloseBookingNote={handleCloseBookingNote}
                    isOpenBookingNoteModal={isOpenBookingNoteModal}
                    setIsOpenBookingNoteModal={setIsOpenBookingNoteModal}
                  />
                  <BookingButton
                    isSelectedHandler={setBookingTypeSelected}
                    buttonOnly={true}
                    propIsSelected={bookingTypeSelected}
                    icon={bookingType}
                  />
                  <BookingEmployeeList
                    selectedEmployee={
                      employeeData === undefined
                        ? allEmployees[0]
                        : employeeData
                    }
                    employees={allEmployees}
                    handleCloseBookingEmployee={handleCloseBookingEmployee}
                    createBookingEmployee={createBookingEmployee}
                    setEmployeeData={setEmployeeData}
                  />
                  {bookingTypeSelected && (
                    <div className="absolute -top-10 right-0 flex gap-2">
                      <BookingButton
                        value={BOOKINGTYPE.phone}
                        clickHandler={selecteBookingType}
                        buttonOnly={true}
                        canSelect={false}
                        icon="phone"
                      />
                      <BookingButton
                        value={BOOKINGTYPE.inhouse}
                        clickHandler={selecteBookingType}
                        buttonOnly={true}
                        canSelect={false}
                        icon="walkin"
                      />
                      <BookingButton
                        value={BOOKINGTYPE.widget}
                        clickHandler={selecteBookingType}
                        buttonOnly={true}
                        canSelect={false}
                        icon="network"
                      />
                    </div>
                  )}
                </div>
                <Button
                  className="mt-4 h-10 w-full"
                  onClick={saveBooking}
                  disabled={!isAllSelected}
                  variant="submit"
                >
                  Create Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBooking;

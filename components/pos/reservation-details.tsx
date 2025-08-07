import React, { useEffect, useRef, useState } from 'react';
import {
  getFullname,
  updateDateTime,
  getNearestAvailableDate,
  getAllTime,
  filterShifts
} from '@/utils/Utility.js';
import { BOOKINGSTATUS, BOOKINGTYPE } from '@/utils/enum';
import moment from 'moment';
import TicketQuantity from '@/components/pos/ticket-quantity';
import { useApi } from '@/hooks/useApi';
import {
  Dialog,
  DialogTitle,
  Alert,
  AlertTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import BookingControlPanel from '@/components/pos/booking-control-panel';
import { Plus, X } from 'lucide-react';
import BookingExperience from './booking-experience';
import SelectBookingCalendar from './select-booking-calendar';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import GuestInfoModal from './guest-info-modal';
import VisitTable from './visit-table';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import AllGuestsModal from './all-guests-modal';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem
} from '../ui/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import TransactionThumb from '@/app/dashboard/transactions/TransactionThumb';
import TransactionModal from '@/app/dashboard/transactions/TransactionModal';

interface ReservationDetailsProps {
  floors: any;
  selectedBooking: any;
  setSelectedBooking: any;
  statusOption: any;
  saveBookingHandler: any;
  shifts: any;
  experienceList: any;
  reservationDetailWidth: number;
  exceptSlideHeight: number;
  updateData: any;
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({
  floors,
  selectedBooking,
  setSelectedBooking,
  statusOption,
  saveBookingHandler,
  shifts,
  experienceList,
  reservationDetailWidth,
  exceptSlideHeight,
  updateData
}) => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [guest, setGuest] = useState(selectedBooking.guest);
  const [isSaving, setIsSaving] = useState(false);
  const [openPartialPartySize, setOpenPartialPartySize] = useState(false);
  const [openEditName, setOpenEditName] = useState(false);
  const [timeList, setTimeList] = useState([]);

  // Booking Experience
  const [bookingExperience, setBookingExperience] = useState(false);
  const [alertHandler, setAlertHandler] = useState(false);
  const [expDaysOfWeek, setExpDaysOfWeek] = useState([]);
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expRecurringType, setExpRecurringType] = useState(-2);
  const [expRecurringValue, setExpRecurringValue] = useState(-1);
  const [expShiftId, setExpShiftId] = useState(0);
  const [expName, setExpName] = useState('');
  const [expId, setExpId] = useState(0);
  const [expHandler, setExpHandler] = useState(false);
  const [ticketQuantityOpen, setTicketQuantityOpen] = useState(false);
  const [hideShiftAlert, setHideShiftAlert] = useState(false);
  const [dialogAlertMessage, setdialogAlertMessage] = useState<any>();

  const [bookingHistory, setBookingHistory] = useState<any>([
    { label: 'On Account Spend', value: '$ 0.00' },
    { label: 'On-Going Spend', value: '$ 0.00' },
    { label: 'Avg Spend', value: '$ 0.00' },
    { label: 'Total Spend', value: '$ 0.00' },
    { label: 'Total Visits', value: 0 },
    { label: 'Avg Turn Time', value: '0 h' },
    { label: 'No Shows', value: 0 }
  ]);

  const {
    getExperienceAssign,
    getBookingHistory,
    updateBooking,
    getTotalVisits,
    uploadGuestPhoto,
    getGuestDocket,
    getBusinessProfile
  } = useApi();

  useEffect(() => {
    handleGetHistory();
  }, [selectedBooking]);
  const formatDuration = (time: any) => {
    const duration = moment.duration(time, 'seconds');
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.minutes());
    return `${hours}h${minutes}m`;
  };
  const HISTORYTYPE = {
    ACCOUNT_SPEND: 1,
    ON_GOING_SPEND: 2,
    TOTAL_SPEND: 4,
    TOTAL_VISITS: 5
  };
  const handleGetHistory = async () => {
    if (!guest) {
      console.log('Guest is not available');
      return;
    }
    try {
      const response = await getBookingHistory({ id: guest.id });
      const historyData = response.data;
      setBookingHistory([
        {
          label: 'On Account Spend',
          value:
            Number(historyData.on_account_spend) === 0
              ? '$ 0'
              : `$ ${Number(historyData.on_account_spend).toFixed(2)}`,
          type: HISTORYTYPE.ACCOUNT_SPEND
        },
        {
          label: 'On-Going Spend',
          value: `$ ${historyData.on_going_spend}`,
          type: HISTORYTYPE.ON_GOING_SPEND
        },
        {
          label: 'Avg Spend',
          value: `$ ${Number(historyData.avg_spend).toFixed(2)}`
        },
        {
          label: 'Total Spend',
          value: `$ ${historyData.total_spend}`,
          type: HISTORYTYPE.TOTAL_SPEND
        },
        {
          label: 'Total Visits',
          value: historyData.total_visits,
          type: HISTORYTYPE.TOTAL_VISITS
        },
        {
          label: 'Avg Turn Time',
          value:
            Number(historyData.avg_turn_time) === 0
              ? '0 h'
              : formatDuration(historyData.avg_turn_time)
        },
        {
          label: 'No Shows',
          value: String(historyData.no_shows)
        }
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetOpenCalendar = () => {
    if (!openCalendar) {
      setOpenCalendar(true);
    }
  };

  const handleOpenEditName = () => {
    if (!openEditName) {
      setOpenEditName(true);
    }
  };

  const handleCloseEditName = (guest: any) => {
    setGuest(guest);
    if (openEditName) {
      setOpenEditName(false);
    }
    let booking = selectedBooking;
    booking = { ...booking, guest: guest };

    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }
    setSelectedBooking(booking);
    handleUpdateBooking(booking);
  };
  const editPartySizeTableHandle = (partySize: any, tables: any) => {
    let booking = selectedBooking;

    booking = { ...booking, party_size: partySize, table: tables };

    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table?.map((e: any) => e.id);
    }

    setSelectedBooking(booking);

    handleUpdateBooking(booking);
  };

  const partyPartySizeHandler = (partySize: any) => {
    let booking = selectedBooking;
    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }

    booking = {
      ...booking,
      status: BOOKINGSTATUS.partiallySeated,
      partial_seated: partySize
    };
    setSelectedBooking(booking);
    handleUpdateBooking(booking);
  };

  const selectedStatusOption = (option: any) => {
    if (option.value === BOOKINGSTATUS.partiallySeated) {
      setOpenPartialPartySize(true);
      return;
    }

    let booking = selectedBooking;
    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }

    booking = { ...booking, status: option.value };
    setSelectedBooking(booking);

    handleUpdateBooking(booking);
  };

  const updateSelectedDate = (date: any) => {
    let booking = selectedBooking;

    const filteredShifts = filterShifts(shifts, moment(date).isoWeekday());
    const nearestDateShift = filteredShifts.filter(
      (item: any) => item.id === expShiftId
    );
    const expData = experienceList.filter((item: any) => item.id === expId);

    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }
    if (booking.experience_id > 0) {
      if (nearestDateShift.length > 0) {
        booking = {
          ...booking,
          start_time: booking.start_time,
          end_time: booking.start_time + booking.session_time,
          start_date: updateDateTime(date, booking.start_time),
          end_date: updateDateTime(
            date,
            booking.end_time + booking.session_time
          )
        };
      } else {
        setExpName(expData[0].exp_name);
        setHideShiftAlert(true);
        return;
      }
    } else {
      booking = {
        ...booking,
        start_time: booking.start_time,
        end_time: booking.start_time + booking.session_time,
        start_date: updateDateTime(date, booking.start_time),
        end_date: updateDateTime(date, booking.end_time + booking.session_time)
      };
    }

    setSelectedBooking(booking);
    handleUpdateBooking(booking);
  };

  const updateSelectedBookingType = (type: any) => {
    let booking = selectedBooking;
    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }
    switch (type) {
      case BOOKINGTYPE.inhouse:
        if (selectedBooking.experience_id > 0) {
          handleUnmountExp();
          booking = {
            ...booking,
            type: type,
            experience_id: null,
            experience_no_of_tickets: null
          };
        } else {
          booking = {
            ...booking,
            type: type
          };
        }
        break;
      case BOOKINGTYPE.phone:
        if (selectedBooking.experience_id > 0) {
          handleUnmountExp();
          booking = {
            ...booking,
            type: type,
            experience_id: null,
            experience_no_of_tickets: null
          };
        } else {
          booking = {
            ...booking,
            type: type
          };
        }
        break;
      case BOOKINGTYPE.widget:
        if (selectedBooking.experience_id > 0) {
          handleUnmountExp();
          booking = {
            ...booking,
            type: type,
            experience_id: null,
            experience_no_of_tickets: null
          };
        } else {
          booking = {
            ...booking,
            type: type
          };
        }
        break;
      case BOOKINGTYPE.experience:
        handleOpenBookingExperience();
        break;
    }

    setSelectedBooking(booking);

    handleUpdateBooking(booking);
  };

  const updateSelectedExperience = (value: any) => {
    let booking = selectedBooking;
    if (expShiftId > 0) {
      const shift = shifts.filter((item: any) => item.id === expShiftId)[0];
      const startTime = shift.start_time;
      const endTime = shift.end_time;
      const sessionTime = shift.session_time;

      let ticketNo = parseInt(value);
      let nearestDate = getNearestAvailableDate(
        expStartDate,
        expEndDate,
        expDaysOfWeek,
        expRecurringType,
        expRecurringValue
      );

      let filteredShifts = filterShifts(
        shifts,
        moment(nearestDate).isoWeekday()
      );
      let nearestDateShift = filteredShifts.filter(
        (item: any) => item.id === expShiftId
      );
      let expData = experienceList.filter((item: any) => item.id === expId);

      if (nearestDateShift.length > 0) {
        if (nearestDateShift[0].id === expShiftId) {
          if (booking.table_ids === undefined) {
            booking['table_ids'] = booking.table.map((e: any) => e.id);
          }
          if (expId === booking.experience_id) {
            if (ticketNo > 0) {
              booking = {
                ...booking,
                experience_no_of_tickets:
                  booking.experience_no_of_tickets + ticketNo
              };
            } else {
              booking = {
                ...booking,
                experience_no_of_tickets: booking.experience_no_of_tickets
              };
            }
          } else {
            if (ticketNo > 0) {
              if (booking.experience_no_of_tickets === 0) {
                booking = {
                  ...booking,
                  type: 3,
                  status: BOOKINGSTATUS.upcoming,
                  shift_id: expShiftId,
                  experience_id: expId,
                  experience_no_of_tickets: ticketNo,
                  start_time: startTime,
                  end_time: startTime + sessionTime,
                  start_date: updateDateTime(nearestDate, booking.start_time),
                  end_date: updateDateTime(nearestDate, endTime + sessionTime)
                };
              } else {
                booking = {
                  ...booking,
                  status: BOOKINGSTATUS.upcoming,
                  shift_id: expShiftId,
                  experience_id: expId,
                  experience_no_of_tickets:
                    booking.experience_no_of_tickets + ticketNo,
                  start_time: startTime,
                  end_time: startTime + sessionTime,
                  start_date: updateDateTime(nearestDate, startTime),
                  end_date: updateDateTime(nearestDate, endTime + sessionTime)
                };
              }
            } else {
              booking = {
                ...booking,
                status: BOOKINGSTATUS.upcoming,
                shift_id: expShiftId,
                experience_id: expId,
                experience_no_of_tickets: booking.experience_no_of_tickets,
                start_time: startTime,
                end_time: startTime + sessionTime,
                start_date: updateDateTime(nearestDate, startTime),
                end_date: updateDateTime(nearestDate, endTime + sessionTime)
              };
            }
            timeListHandler(nearestDate);
          }
          setSelectedBooking(booking);
          handleUpdateBooking(booking);
        }
      } else {
        setExpName(expData[0].exp_name);
        setHideShiftAlert(true);
        if (booking.experience_id > 0) {
          handleUnmountExp();
          expGetAssign(booking.experience_id);
        } else {
          handleUnmountExp();
        }
      }
    }
  };

  const statusBtnOnClickHandler = (item: any) => {
    let booking = selectedBooking;
    booking = { ...booking, status: item.value };

    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }

    setSelectedBooking(booking);

    handleUpdateBooking(booking);
  };

  const handleUpdateBooking = async (booking: any, updateGuest?: any) => {
    try {
      const payloadGuest = updateGuest || booking.guest || guest;
      const response = await updateBooking({ ...booking, guest: payloadGuest });
      saveBookingHandler();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseReservationDetails = () => {
    setSelectedBooking(null);
    setExpHandler(false);
    setExpDaysOfWeek([]);
    setExpStartDate('');
    setExpEndDate('');
    setExpRecurringType(-2);
    setExpRecurringValue(-1);
    setExpShiftId(0);
  };

  const handleUnmountExp = () => {
    setExpHandler(false);
    setExpDaysOfWeek([]);
    setExpStartDate('');
    setExpEndDate('');
    setExpRecurringType(-2);
    setExpRecurringValue(-1);
    setExpShiftId(0);
    setExpId(0);
  };

  const handleCloseShiftAlert = () => {
    setHideShiftAlert(!hideShiftAlert);
  };

  const handleOpenBookingExperience = () => {
    setBookingExperience(true);
  };

  const handleCloseBookingExperience = () => {
    if (bookingExperience) {
      setBookingExperience(false);
    }
  };

  const handleTicketQuantitySubmit = (value: any) => {
    setTicketQuantityOpen(false);
    updateSelectedExperience(value);
  };

  const timeListHandler = (date: any) => {
    const filteredShiftsData = filterShifts(shifts, moment(date).isoWeekday());
    if (expShiftId > 0) {
      setTimeList(
        // @ts-ignore
        getAllTime(
          filteredShiftsData.find((e: any) => e.id === expShiftId),
          moment(date).format('yyyy-MM-DD')
        )
      );
    } else {
      setTimeList(
        // @ts-ignore
        getAllTime(filteredShiftsData, moment(date).format('yyyy-MM-DD'))
      );
    }
  };

  const experienceData = experienceList.filter(
    (item: any) => item.id === selectedBooking.experience_id
  );

  const expGetAssign = async (id: number) => {
    setExpId(id);
    try {
      const response = await getExperienceAssign({ experience_id: id });
      if (response.data) {
        if (response.data.connection === null) {
          setdialogAlertMessage({
            title: 'Missing Details',
            body: (
              <div>
                Please enter details for &apos;No Shift ID <br />
                Experience&apos; experience. (eg: Start Date, <br /> Shift,..
                etc)
              </div>
            )
          });
          setAlertHandler(true);
        } else {
          setExpDaysOfWeek(response.data.connection.day_of_week);
          setExpStartDate(response.data.connection.start_date);
          setExpEndDate(response.data.connection.end_date);
          setExpRecurringType(response.data.connection.recurring_type);
          setExpRecurringValue(response.data.connection.recurring_value);
          setExpShiftId(response.data.connection.shift_id);
          setExpHandler(true);
        }
      }
    } catch (err) {
      console.error('Error: ', err);
    }
  };

  useEffect(() => {
    handleUnmountExp();
    if (selectedBooking.experience_id > 0) {
      expGetAssign(selectedBooking.experience_id);
      timeListHandler(selectedBooking.start_date);
    } else {
      handleUnmountExp();
    }
  }, [selectedBooking]);
  const [totalVisits, setTotalVisits] = useState<any>(null);
  const handleGetTotalVisits = async () => {
    const reseponse = await getTotalVisits({ id: guest.id });
    if (reseponse) {
      setTotalVisits(reseponse);
    }
  };
  useEffect(() => {
    if (guest) {
      handleGetTotalVisits();
      handleGetDockets();
    }
    if (guest && isSaving) {
      setIsSaving(false);
      let booking = { ...selectedBooking, guest: guest };

      setSelectedBooking(booking);
      handleUpdateBooking(booking);
    }
  }, [guest]);
  useEffect(() => {
    timeListHandler(selectedBooking.start_date);
  }, [expShiftId]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<any>({});
  const handleOpenHistoryDetail = async (type?: number) => {
    if (!type) return;
    setSelectedType(type);
    setIsOpen(true);
  };
  const [isOpenTagDialog, setIsOpenTagDialog] = useState(false);
  const openAddNewTag = () => {
    setIsOpenTagDialog(true);
  };
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(guest?.string_tags || []);
  const handleCreateTag = () => {
    setTags([...tags, newTag]);
    setIsOpenTagDialog(false);
    let booking = selectedBooking;
    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }
    const updateGuest = { ...guest, string_tags: [...tags, newTag] };
    setSelectedBooking({ ...booking, guest: updateGuest });

    handleUpdateBooking(booking, updateGuest);
  };

  const handleRemoveTab = (tag: string) => {
    let newArray = tags.filter((item) => item !== tag);
    setTags(newArray);
    let booking = selectedBooking;
    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }
    const updateGuest = { ...guest, string_tags: newArray };
    setSelectedBooking({ ...booking, guest: updateGuest });

    handleUpdateBooking(booking, updateGuest);
  };

  const [isOpenAllGuestsModal, setIsOpenAllGuestsModal] = useState(false);

  const changeGuest = (guest: any) => {
    let booking = selectedBooking;
    if (booking.table_ids === undefined) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }
    setGuest(guest);
    setSelectedBooking({ ...booking, guest: guest });
    handleUpdateBooking(booking, guest);
    setIsOpenAllGuestsModal(false);
    setIsDropdownOpen(false);
    updateData();
  };

  const [onGoingDockets, setOnGoingtDockets] = useState<any>(null);
  const [onAccountDockets, setOnAccountDockets] = useState<any>(null);
  const [paidDockets, setPaidDockets] = useState<any>(null);

  const handleGetDockets = async () => {
    const going_reseponse = await getGuestDocket({
      id: guest.id,
      docket_type: 'on_going'
    });
    if (going_reseponse) {
      setOnGoingtDockets(going_reseponse.data);
    }
    const account_reseponse = await getGuestDocket({
      id: guest.id,
      docket_type: 'on_account'
    });
    if (account_reseponse) {
      setOnAccountDockets(account_reseponse.data);
    }
    const paid_reseponse = await getGuestDocket({
      id: guest.id,
      docket_type: 'paid'
    });
    if (account_reseponse) {
      setPaidDockets(paid_reseponse?.data);
    }
  };

  const [changedFile, setChangedFile] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleUpploadGuestPhoto = async (e: any) => {
    try {
      const file = e.target.files[0];
      setChangedFile(URL.createObjectURL(file));
      await uploadGuestPhoto({
        id: guest.id,
        image: file.name,
        photo: file
      });
    } catch (error) {
      console.error(error);
    }
    setIsDropdownOpen(false);
  };

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
  const openModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };
  const [businessProfile, setBusinessProfile] = useState<any | null>(null);

  const asyncBusinessProfile = async () => {
    try {
      const response = await getBusinessProfile();
      setBusinessProfile(response.data.business_profile);
    } catch (error) {
      console.error('error', error);
    }
  };
  const guestInfo = useRef<HTMLInputElement | null>(null);
  const [docketHeight, setDocketHeight] = useState<string>('');
  useEffect(() => {
    if (guestInfo.current) {
      setDocketHeight(
        `calc(100vh - ${guestInfo.current.offsetHeight} - ${exceptSlideHeight})`
      );
    }
  }, [guestInfo]);

  useEffect(() => {
    asyncBusinessProfile();
  }, []);
  return (
    <div className="reservation-det-wrapper z-10 flex h-full w-full flex-col overflow-hidden rounded-lg bg-backgroundPos">
      <div
        ref={guestInfo}
        className="user-select-none flex-direction-row relative flex max-w-full items-center gap-2 rounded-xl border border-border bg-tertiary p-4"
      >
        <div className="flex items-center gap-2 rounded-sm">
          <div className="relative flex items-center gap-2">
            {guest.photo || changedFile ? (
              <>
                <label className="flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full">
                  <Image
                    src={
                      changedFile
                        ? changedFile
                        : `${process.env.NEXT_PUBLIC_IMG_URL + guest.photo}`
                    }
                    alt="User"
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                  />
                </label>
              </>
            ) : (
              <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-green">
                <Plus size={14} style={{ color: '#2b772e' }} />
              </div>
            )}
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e: any) => handleUpploadGuestPhoto(e)}
            />
            <DropdownMenu
              modal={false}
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  className="absolute left-0 top-0 w-full opacity-0"
                  variant="ghost"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => setIsOpenAllGuestsModal(true)}
                >
                  Change Guest
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    document.getElementById('file-upload')?.click()
                  }
                >
                  Upload Photo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <div
              className="cursor-pointer"
              onClick={() => setOpenEditName(true)}
            >
              <p className="text-base font-bold">{getFullname(guest)}</p>
              <p className="text-xs">{guest?.phone || 'No Phone available'}</p>
              <p className="text-xs">{guest?.email || 'No email available'}</p>
            </div>
            <div className="mt-2 flex gap-2 ">
              {tags.length > 0 && (
                <ul className="flex gap-2">
                  {tags.map((tag, index) => (
                    <li
                      className="flex h-5 items-center gap-1 rounded-full border border-primary bg-tertiary px-2 text-[10px]"
                      key={index}
                    >
                      {tag.slice(0, 10)}
                      <X
                        size={10}
                        className="cursor-pointer"
                        onClick={() => handleRemoveTab(tag)}
                      />
                    </li>
                  ))}
                </ul>
              )}
              <div
                onClick={openAddNewTag}
                className="flex h-5 w-7 cursor-pointer items-center justify-center rounded-full bg-primary"
              >
                <Plus className="text-white" size={10} />
              </div>
              <Modal
                isOpen={isOpenTagDialog}
                description="Please enter you desired tags for this guest"
                onClose={() => setIsOpenTagDialog(false)}
                title="Add New Tags"
              >
                <div className="space-y-4">
                  <Input
                    placeholder="Enter new tag"
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button variant="submit" onClick={handleCreateTag}>
                      Add
                    </Button>
                  </div>
                </div>
              </Modal>
            </div>
          </div>
        </div>
        <X
          className="absolute right-4 top-4 cursor-pointer"
          onClick={() => setSelectedBooking(null)}
        />

        {selectedBooking.experience_id > 0 && (
          <div
            onClick={handleOpenBookingExperience}
            className="absolute right-20 cursor-pointer font-normal"
            style={{
              fontSize: '.7em'
            }}
          >
            {selectedBooking.experience_no_of_tickets}x{' '}
            {experienceData[0].exp_name}
          </div>
        )}

        <BookingExperience
          bookingExperience={bookingExperience}
          handleCloseBookingExperience={handleCloseBookingExperience}
          setTicketQuantityOpen={setTicketQuantityOpen}
          experienceList={experienceList}
          expGetAssign={expGetAssign}
        />
        <TicketQuantity
          ticketQuantityOpen={ticketQuantityOpen}
          setTicketQuantityOpen={setTicketQuantityOpen}
          experienceData={
            experienceList.filter((item: any) => item.id === expId)[0]
          }
          handleTicketQuantitySubmit={handleTicketQuantitySubmit}
        />
      </div>

      {isOpen ? (
        <>
          <div className="p-4">
            <div className="flex">
              <h3 className="text-xl">
                {selectedType === HISTORYTYPE.ACCOUNT_SPEND
                  ? 'Account'
                  : selectedType === HISTORYTYPE.ON_GOING_SPEND
                  ? 'On Going'
                  : selectedType === HISTORYTYPE.TOTAL_SPEND
                  ? 'Paid'
                  : selectedType === HISTORYTYPE.TOTAL_VISITS
                  ? 'History'
                  : ''}
              </h3>
              <X
                className="ml-auto cursor-pointer"
                onClick={() => setIsOpen(false)}
              />
            </div>
            <div
              style={{ width: docketHeight }}
              className="mt-4 h-screen overflow-y-auto pb-32"
            >
              {selectedType === HISTORYTYPE.TOTAL_VISITS ? (
                <ul className="mt-4">
                  {totalVisits.upcoming.length > 0 && (
                    <VisitTable
                      title="Upcoming"
                      visits={totalVisits.upcoming}
                    />
                  )}
                  {totalVisits.history.length > 0 && (
                    <VisitTable
                      className="mt-4"
                      title="History"
                      visits={totalVisits.history}
                    />
                  )}
                </ul>
              ) : (
                <ul className="grid grid-cols-2 gap-4 pb-36 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {(() => {
                    const docketsMap = {
                      [HISTORYTYPE.ON_GOING_SPEND]: onGoingDockets,
                      [HISTORYTYPE.TOTAL_SPEND]: paidDockets,
                      [HISTORYTYPE.ACCOUNT_SPEND]: onAccountDockets
                    };

                    const transactions = docketsMap[selectedType];

                    if (transactions?.length > 0) {
                      return transactions?.map(
                        (transaction: any, idx: number) => (
                          <li
                            key={`${transaction.order_id}-${idx}`}
                            className="mb-5 cursor-pointer"
                            onClick={() => openModal(transaction)}
                          >
                            <TransactionThumb
                              transaction={transaction}
                              businessProfile={businessProfile}
                            />
                          </li>
                        )
                      );
                    } else {
                      return (
                        <div
                          className="ml-2 cursor-pointer"
                          onClick={() => setSelectedType(null)}
                        >
                          <p className="text-blue text-sm">
                            No available dockets
                          </p>
                        </div>
                      );
                    }
                  })()}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto p-2">
            {bookingHistory.length &&
              bookingHistory.map((item: any, index: number) => (
                <div
                  className={`min-w-36 rounded-lg border border-border bg-tertiary p-2 text-center ${
                    item?.type ? 'cursor-pointer' : ''
                  }`}
                  key={index}
                  onClick={() => handleOpenHistoryDetail(item?.type)}
                >
                  <div className="p-0 text-left">
                    <p className="text-sm">{item.label}</p>
                    <p>{item.value}</p>
                  </div>
                </div>
              ))}
          </div>
          <div className="flex-grow">
            <div
              className={`flex h-full gap-1 ${
                reservationDetailWidth < 700 ? 'flex-col' : ''
              }`}
            >
              <div
                className={`w-full rounded-lg border border-border bg-tertiary p-4`}
              >
                <div className="w-full">
                  <BookingControlPanel
                    selectedBooking={selectedBooking}
                    statusOption={statusOption}
                    floor={floors}
                    handleSetOpenCalendar={handleSetOpenCalendar}
                    editPartySizeTableHandle={editPartySizeTableHandle}
                    selectedStatusOption={selectedStatusOption}
                    partyPartySizeHandler={partyPartySizeHandler}
                    setSelectedBooking={setSelectedBooking}
                    openPartialPartySize={openPartialPartySize}
                    setOpenPartialPartySize={setOpenPartialPartySize}
                    statusBtnOnClickHandler={statusBtnOnClickHandler}
                    handleUpdateBooking={handleUpdateBooking}
                    timeList={timeList}
                    setIsSaving={setIsSaving}
                    setGuest={setGuest}
                    guest={guest}
                    key={selectedBooking.id}
                  />
                </div>
              </div>
              {/* <div
                className={`bg-tertiary w-1/3 flex-grow rounded-lg border border-border ${
                  reservationDetailWidth < 700 ? 'w-full' : ''
                }`}
              >
                <div className="w-full p-4">
                  <p>GUEST NOTES</p>
                </div>
              </div> */}
            </div>
          </div>
        </>
      )}

      <GuestInfoModal
        isOpen={openEditName}
        onClose={() => setOpenEditName(false)}
        onSave={handleCloseEditName}
        initialGuestInfo={guest}
      />

      <AlertDialog open={alertHandler}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogAlertMessage?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAlertMessage?.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                setAlertHandler(false);
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SelectBookingCalendar
        selectedDate={new Date(selectedBooking.start_date)}
        openBookingCalendar={openCalendar}
        setSelectedDate={updateSelectedDate}
        handleCloseSelectedBookingCalendar={setOpenCalendar}
      />
      {isModalOpen && selectedTransaction && (
        <TransactionModal
          isModalOpen={isModalOpen}
          selectedTransaction={selectedTransaction}
          businessProfile={businessProfile}
          handlePrint={() => console.log('delete this later')}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
      {isOpenAllGuestsModal && (
        <AllGuestsModal
          isOpenAllGuestsModal={isOpenAllGuestsModal}
          setIsOpenAllGuestsModal={setIsOpenAllGuestsModal}
          changeGuest={changeGuest}
        />
      )}
      {hideShiftAlert === true && (
        <Dialog open={true} onClose={handleCloseShiftAlert}>
          <DialogTitle>
            <Alert severity="error">
              <AlertTitle>Oops...</AlertTitle>
            </Alert>
          </DialogTitle>
          <DialogContent>
            <p className="font-bold text-red">No shift available</p>
            <p> for </p>
            <p className="font-bold">{expName}</p>
            <p> Please select another experience or </p>
            <p className="text-red">edit shift for</p>
            <p className="font-bold">{expName}</p>
            <p className="text-red"> on settings</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseShiftAlert} color="primary" autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};
export default ReservationDetails;

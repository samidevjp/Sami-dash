'use client';
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef
} from 'react';
import PageContainer from '@/components/layout/page-container';
import { useSession } from 'next-auth/react';
import { TableContext } from '@/hooks/useBookings';
import { v4 as uuid } from 'uuid';
import { Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragEndEvent
} from '@dnd-kit/core';

import TableComponent from '@/components/TableComponent/TableComponent';
import CreateBooking from '@/components/pos/create-booking';
import BookingCalendarArrow from '@/components/pos/booking-calendar-arrow';
import SelectBookingCalendar from '@/components/pos/select-booking-calendar';
import ShiftIndicator from '@/components/pos/shift-indicator';
import ShiftSelector from '@/components/pos/shift-selector';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/hooks/bookingStore';
import { useCurrentShiftId } from '@/hooks/getCurrentShiftId';
import ProductAndOrder from '@/components/pos/product-order';
import { Dialog, DialogOverlay } from '@/components/ui/dialog';
import { Clock3, Minus, Plus } from 'lucide-react';
import { useShiftStore } from '@/hooks/useShiftStore';
import { useShiftsStore } from '@/hooks/useShiftsStore';
import { useEmployee } from '@/hooks/useEmployee';
import TableDetails from '@/components/pos/table-details';
import {
  getBookingsOnTable,
  getBookingStatusOptions,
  sortBookingByStatus
} from '@/utils/Utility';
import BookingList from '@/components/pos/booking-list';
import SegmentedControl from '@/components/pos/segmented-control';
import '@/styles/booking.css';
import ReservationDetails from '@/components/pos/reservation-details';
import { useFloor } from '@/hooks/floorStore';
import { useProducts } from '@/hooks/useProducts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import PhoneOrderListModal from '@/components/pos/phone-order-list-modal';
import { useBookingVisibility } from '@/hooks/useBookingVisibility';
import { usePermissionsStore } from '@/hooks/usePermissionsStore';
import { Floor } from '@/types';
import { useInternetConnection } from '@/providers/InternetConnectionProvider';
import { Modal } from '@/components/ui/modal';
import { db } from '@/lib/db';

export default function FloorPlan() {
  const { permissions: accountPermissions } = usePermissionsStore();
  const hasPOSPermission = accountPermissions?.mainNav?.pos;
  const { isOnline } = useInternetConnection();

  const {
    allBookingsDevideByShift,
    activeBookings,
    filteredTable,
    allBookings,
    updateData,
    hookCreateBooking,
    latestData
  } = useContext(TableContext);
  const now = new Date();
  const [floors, setFloors] = useState<Floor[]>([]);
  const router = useRouter();
  const {
    getExperienceList,
    getFloors,
    createBooking: apiCreateBooking,
    getPhoneOrderList,
    getProducts,
    getShifts,
    getSpecialDays,
    addBookingOrder,
    addProductToBumpOrder
  } = useApi();

  const { data: session } = useSession();
  const { shifts: allShifts, setShifts } = useShiftsStore();
  const currentShift: number = useCurrentShiftId(allShifts);
  const { floor, setFloor, setTable } = useFloor();

  const { setSelectedShiftId } = useShiftStore();
  const { currentEmployee, allEmployees } = useEmployee();
  const { setProducts } = useProducts();

  const [allCategories, setAllCategories] = useState<any[]>([]);
  const contactNumber = 'No phone number';

  const guestName = 'Walk In';
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { isVisible: isSidebarVisible, toggle: toggleSidebarVisibility } =
    useBookingVisibility();
  const [movedTablePositions, setMovedTablePositions] = useState<{
    [key: number]: { x: number; y: number };
  }>({});
  const partySize = 2;
  const [scale, setScale] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date(now));
  const [selectedFloor, setSelectedFloor] = useState<number>(floors[0]?.id);
  const [selectedShift, setSelectedShift] = useState<number | undefined>(
    currentShift
  );
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([0]);
  const [showFloors, setShowFloors] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [tables, setTables] = useState<any[]>([]);
  const { setBooking, removeBooking } = useBooking();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [updateCategories, setUpdateCategories] = useState<any>(false);

  // date selector
  const [openBookingCalendar, setOpenBookingCalendar] = useState(false);
  const [isChangingTable, setIsChangingTable] = useState(false);
  const [selectedTableBookingData, setSelectedTableBookingData] = useState([]);
  const [showTableDetails, setShowTableDetails] = useState(false);
  const [tableDetailsData, setTableDetailsData] = useState<any>(null);
  const swiperRef = useRef<any>(null);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [experienceList, setExperienceList] = useState<any>([]);

  const [phoneOrderList, setPhoneOrderList] = useState([]);
  const [isSpecialDay, setIsSpecialDay] = useState(false);
  const [localOrders, setLocalOrders] = useState<any>([]);
  const [isLocalOrdersModalOpen, setIsLocalOrdersModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] =
    useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleteAllConfirmModalOpen, setIsDeleteAllConfirmModalOpen] =
    useState(false);

  // Utility function to get table name by ID
  const getTableNameById = useCallback(
    (tableId: number) => {
      const table = tables.find((table) => table.id === tableId);
      return table ? table.name : `Table ${tableId}`;
    },
    [tables]
  );

  useEffect(() => {
    init();
  }, []);

  const closedDatesMapRef = useRef<Map<string, string>>(new Map());

  const init = async () => {
    if (!currentEmployee) {
      router.push('/pin');
    }
    getShift();
    const savedPositions = localStorage.getItem('tablePositions');
    if (savedPositions) {
      setMovedTablePositions(JSON.parse(savedPositions));
    }
    const response = await getSpecialDays();

    response.special_days.forEach((day: any) => {
      const startDate = day.start_date?.slice(0, 10);
      const endDate = day.end_date?.slice(0, 10);

      if (startDate === endDate) {
        closedDatesMapRef.current.set(startDate, day.name);
      } else {
        let current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
          const dateStr = current.toISOString().slice(0, 10);
          closedDatesMapRef.current.set(dateStr, day.name);
          current.setDate(current.getDate() + 1);
        }
      }
    });
  };

  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toLocaleDateString('en-CA');
      setIsSpecialDay(closedDatesMapRef.current.has(dateString));
    }
  }, [selectedDate]);

  const getShift = async () => {
    try {
      const response = await getShifts();
      if (response.shifts) {
        setShifts(response.shifts);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetExperienceList = async () => {
    try {
      const response = await getExperienceList();
      if (response.experiences) {
        setExperienceList(response.experiences);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFetchItems = async () => {
    try {
      const response = await getProducts();

      setAllCategories(
        response.data.menu.sort((a: any, b: any) => a.order - b.order) || []
      );
      setProducts(response.data.menu);
    } catch (err) {
      console.error('An error occurred:', err);
    }
  };
  const handleFetchFloors = async () => {
    try {
      if (floor && floor.length > 1) {
        setFloors(floor);
        setSelectedFloor(floor[0].id);
        setTables(floor.map((floor: Floor) => floor.tables).flat());
      } else {
        const response = await getFloors();
        setFloors(response.data.floors);
        setSelectedFloor(response.data.floors[0].id);
        setFloor(response.data.floors || null);
        setTable(
          response.data.floors.map((floor: Floor) => floor.tables).flat()
        );
        setTables(
          response.data.floors.map((floor: Floor) => floor.tables).flat()
        );
      }
    } catch (err) {
      console.error('An error occurred:', err);
    }
  };

  const saveBookingHandler = () => {
    handleFetchFloors();
    handleFetchItems();
    updateData(selectedDate, selectedShift);
  };
  const getPhoneOrderListData = async () => {
    try {
      const response = await getPhoneOrderList();
      setPhoneOrderList(response.data.phoneOrders);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      await handleFetchFloors();
      await handleFetchItems();
      await handleGetExperienceList();
      await getPhoneOrderListData();
    };
    fetchData();
  }, [updateCategories]);

  useEffect(() => {
    updateData(selectedDate, selectedShift);
    if (allShifts) {
      setSelectedShiftId(selectedShift ? selectedShift : currentShift);
    }
  }, [selectedDate, selectedShift]);

  const handleSelectFloor = (floorId: number) => {
    setSelectedFloor(floorId);
  };

  const handleCreateWalkInBooking = async (tableId?: any) => {
    if (!guestName || !partySize) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Please fill in all fields.'
      });
      return;
    }
    if (!tableId) return;
    const table = tables.find((t) => t.id === tableId);
    const startDate = new Date();
    const finishDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const params = {
      start_date: formatDate(startDate),
      partial_seated: 0,
      reservation_note: '',
      uuid: uuid(),
      booking_taken: currentEmployee,
      table_lock: false,
      status: 4,
      table_ids: [table.id],
      no_limit: false,
      floor_id: selectedFloor,
      table_id: table.id,
      end_date: formatDate(finishDate),
      id: 0,
      created_at: '',
      finished_date: '',
      guest: {
        photo: '',
        birthdate: '',
        card_exp: '',
        card_brand: '',
        card_last_4: '',
        anniversary: '',
        last_name: guestName.split(' ')[1] || '',
        general_note: '',
        string_tags: [],
        company: '',
        id: 0,
        special_relationship: '',
        postal: '',
        city: '',
        first_name: guestName.split(' ')[0] || 'Walk',
        email: '',
        tags: [],
        phone: contactNumber,
        state: '',
        food_drink_preference: '',
        address: '',
        seating_preference: ''
      },
      table: [table],
      party_size: partySize,
      shift_id: currentShift,
      type: 1
    };

    if (!table) return;
    try {
      const bookingCreated = await hookCreateBooking(
        params,
        session?.user.token
      );
      // walk-in does not require date
      updateData();
      setIsBookingModalOpen(false);
      toast({
        title: 'Success',
        description:
          'Booking created successfully for table ' +
          table.name +
          ' at ' +
          formatDate(startDate),
        variant: 'success'
      });
      return true;
    } catch (err) {
      console.error('Error creating booking', err);
      toast({
        title: 'Error',
        description: 'An error occurred while creating the booking.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleMoveBooking = async (booking: any, newTable: any) => {
    if (!booking) return;
    const params = {
      start_date: booking.start_date,
      partial_seated: booking.partial_seated,
      reservation_note: booking.reservation_note,
      uuid: booking.uuid,
      booking_taken: booking.booking_taken,
      table_lock: booking.table_lock,
      status: booking.status,
      table_ids: [newTable.id],
      no_limit: booking.no_limit,
      table_id: newTable.id,
      end_date: booking.end_date,
      id: booking.id,
      created_at: booking.created_at,
      finished_date: booking.finished_date,
      guest: booking.guest,
      table: [newTable],
      party_size: booking.party_size,
      shift_id: booking.shift_id,
      type: booking.type
    };
    try {
      const updatedBooking = await apiCreateBooking(params);
      updateData();
    } catch (err) {
      console.error('Error moving booking', err);
    }
  };

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleProductOrderModalOpen = (tableId: number) => {
    setSelectedTableId(tableId);
    setIsPaymentModalOpen(true);
  };

  const handleTableClick = async (tableId: number) => {
    if (!isSidebarVisible) {
      const targetBooking = activeBookings.find((b: any) =>
        b.table.some((t: any) => t.id === tableId)
      );
      if (!targetBooking) {
        try {
          setTimeout(async () => {
            const bookingCreated = await handleCreateWalkInBooking(tableId);
            if (!bookingCreated) {
              toast({
                title: 'Error',
                description: 'Error creating booking',
                variant: 'destructive'
              });
              return;
            } else {
              handleProductOrderModalOpen(tableId);
            }
          }, 100);

          return;
        } catch (err) {
          console.error(err);
        }
        return;
      }
      setBooking(targetBooking);
      handleProductOrderModalOpen(tableId);
    } else if (isChangingTable) {
      if (selectedTableIds.includes(tableId)) {
        setSelectedTableIds(selectedTableIds.filter((id) => id !== tableId));
      } else {
        setSelectedTableIds([...selectedTableIds, tableId]);
      }
    }
  };
  const renderTableCards = useCallback(
    (tables: any[], bookings: any[]) => {
      return tables.map((table: any) => {
        const movedPosition = movedTablePositions[table.id];
        const position = movedPosition || { x: table.pos_x, y: table.pos_y };
        return (
          <div
            key={table.id}
            style={{
              position: 'absolute',
              top: position.y * 0.6,
              left: position.x * 0.6,
              cursor: 'pointer'
            }}
            onClick={() => handleTableClick(table.id)}
          >
            <TableComponent
              bookings={bookings}
              latestData={latestData}
              selectedTableIds={selectedTableIds}
              showTimeline={showTimeline}
              table={table}
              showTableDetailsHandler={showTableDetailsHandler}
            />
          </div>
        );
      });
    },
    [
      isSidebarVisible,
      showTimeline,
      updateData,
      movedTablePositions,

      handleTableClick
    ]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (
      active?.data?.current?.type === 'Table' &&
      active.rect?.current?.translated
    ) {
      const { left: x, top: y } = active.rect.current.translated;
      const tableId = active.id as number;
      // Calculate the movement delta
      const valueToTake = window.innerWidth > 768 ? 150 : 20;
      const deltaX = x - valueToTake;
      const deltaY = y - valueToTake;

      setMovedTablePositions((prev) => ({
        ...prev,
        [tableId]: {
          x: deltaX,
          y: deltaY
        }
      }));
    }
    if (
      active?.data?.current?.type === 'Booking' &&
      over &&
      over?.data?.current?.type === 'Table'
    ) {
      const booking = active?.data.current.booking;
      const toTableId = over.data.current.table;
      handleMoveBooking(booking, toTableId);
    }
  };

  const handleZoomOut = () => {
    setScale((scale) => scale - 0.1);
  };

  const handleZoomIn = () => {
    setScale((scale) => scale + 0.1);
  };

  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true);
  };
  const formatDate2Digit = (date: any) => {
    if (!date) return selectedDate;
    if (typeof date === 'string') {
      date = new Date(date);
    }
    const options = { weekday: 'long', day: '2-digit', month: 'short' };
    const dateStr = date.toLocaleDateString('en-AU', options);

    return dateStr.replace(/(\w+)( \d{2} )/, '$1,$2');
  };

  const [filteredBookingList, setFilteredBookingList] = useState<any>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedOption, setSelectedOption] = useState('1');

  const setFilteredBookingListHandler = (index: string, value: string) => {
    const safeBookingsList = allBookingsDevideByShift ?? [];
    const filteredBookings = safeBookingsList.filter((e) => e.guest);
    const sortedBookings = sortBookingByStatus(filteredBookings, index, value);
    setFilteredBookingList(sortedBookings);
  };
  const handleChange = (e: any) => {
    setKeyword(e.target.value);
    if (Number(selectedOption) !== 3) {
      setFilteredBookingListHandler(selectedOption, e.target.value);
    }
  };
  const [selectedOptionName, setSelectedOptionName] = useState('Time');

  useEffect(() => {
    setFilteredBookingListHandler(selectedOption, '');
  }, [allBookingsDevideByShift]);

  const selectedSegment = (index: string) => {
    setSelectedOption(index);
    setFilteredBookingListHandler(index, keyword);
    switch (index) {
      case '1':
        setSelectedOptionName('Time');
        break;
      case '2':
        setSelectedOptionName('Status');
        break;
      case '4':
        setSelectedOptionName('Alerts');
        break;
    }
  };
  const getSelectedTableBookingData = (val: any) => {
    let data = [];
    data = getBookingsOnTable(val.id, activeBookings);
    if (data !== null) {
      setSelectedTableBookingData(data);
      setTableDetailsData(null);
    } else if (data === null) {
      setSelectedTableBookingData([]);
      setTableDetailsData(val);
    }
  };
  const changeTableIdHandler = (value: any) => {
    let table_ids: any = [];
    if (selectedTableIds[0] > 0) {
      if (isChangingTable) {
        if (selectedTableIds.length >= 1) {
          if (selectedTableIds.includes(value.id)) {
            table_ids = selectedTableIds.filter((e) => e !== value.id);
            setSelectedTableIds(table_ids);
          } else {
            table_ids = [...selectedTableIds].concat(value.id);
            setSelectedTableIds(table_ids);
          }
        }
      } else {
        if (selectedTableIds[0] === value.id) {
          table_ids = [0];
          setSelectedTableIds(table_ids);
        } else {
          table_ids = [value.id];
          setSelectedTableIds(table_ids);
        }
      }
    } else {
      table_ids = [value.id];
      setSelectedTableIds(table_ids);
    }
  };
  const showTableDetailsHandler = (propTable: any) => {
    if (showTableDetails) {
      if (isChangingTable) {
        changeTableIdHandler(propTable);
      } else {
        if (propTable.id === undefined) {
          setShowTableDetails(!showTableDetails);
          changeTableIdHandler(propTable);
        } else {
          if (selectedTableIds[0] === propTable.id) {
            setShowTableDetails(!showTableDetails);
            changeTableIdHandler(propTable);
          } else {
            setShowTableDetails(showTableDetails);
            getSelectedTableBookingData(propTable);
            changeTableIdHandler(propTable);
          }
        }
      }
    } else {
      setShowTableDetails(!showTableDetails);
      changeTableIdHandler(propTable);
      getSelectedTableBookingData(propTable);
    }
  };
  const [slideClass, setSlideClass] = useState('slide-in');

  const handleSlideChange = (swiper: any) => {
    if (swiper.activeIndex === 0) {
      setSelectedBooking(null);
    }
    if (swiper.activeIndex === 1) {
      setSlideClass('slide-out');
    } else {
      setSlideClass('slide-in');
    }
  };
  const sidebar = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [reservationDetailWidth, setReservationDetailWidth] = useState(300);

  const handleResize = () => {
    if (contentRef?.current?.offsetWidth && sidebar?.current?.offsetWidth) {
      setReservationDetailWidth(
        contentRef?.current?.offsetWidth - sidebar?.current?.offsetWidth
      );
    }
  };

  const [isOpenPhoneOrderModal, setIsOpenPhoneOrderModal] = useState(false);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebar, contentRef, selectedBooking]);

  const dateAndShift = useRef<HTMLInputElement | null>(null);
  const bottomButtons = useRef<HTMLInputElement | null>(null);
  const [exceptSlideHeight, setExceptSlideHeight] = useState(0);
  useEffect(() => {
    if (dateAndShift.current && bottomButtons.current) {
      setExceptSlideHeight(
        dateAndShift.current.offsetHeight + bottomButtons.current.offsetHeight
      );
    }
  }, [dateAndShift, bottomButtons]);

  // local order processing --------------------------------------------------
  useEffect(() => {
    const processLocalOrders = async () => {
      if (isOnline && localOrders.length > 0) {
        for (const localOrder of localOrders as any[]) {
          try {
            // get table id from local order
            const tableId = localOrder.tableId;
            if (!tableId) {
              console.log('No table ID found in local order');
              continue;
            }

            // get table booking data
            const tableBooking = activeBookings.find((b: any) =>
              b.table.some((t: any) => t.id === tableId)
            );

            if (!tableBooking) {
              console.log('No booking data found for table:', tableId);
              continue;
            }

            const updatedOrderListProducts = localOrder.products.map(
              (product: any) => ({
                ...product,
                isCancelled: false,
                is_deleted: false,
                is_pop_up: false,
                price_type: product.price_type || 1
              })
            );

            const param: any = {
              status: tableBooking.status || 0,
              table_id: tableId,
              booking_id: tableBooking.id,
              guest: tableBooking.guest,
              products: updatedOrderListProducts,
              pos_device_id: 7,
              employee_id: currentEmployee?.id
            };

            if (tableBooking.uuid) {
              param.booking_uuid = tableBooking.uuid;
            }
            if ((tableBooking as any).order_uuid) {
              param.uuid = (tableBooking as any).order_uuid;
            } else {
              param.uuid = uuid();
            }

            const response = await addBookingOrder(param);

            // add bump order
            const bumpProducts = localOrder.products.map((item: any) => {
              const base = {
                uuid: uuid(),
                id: item.id,
                created_at: item.created_at,
                quantity: item.quantity,
                category_id: item.category_id,
                note: item.note || '',
                price_type: item.price_type,
                bump_order_add_ons:
                  item.addOns?.map((addOn: any) => ({
                    id: addOn.id,
                    quantity: addOn.quantity
                  })) || [],
                status: 'active'
              };
              if (item.price_type === 2) {
                return {
                  ...base,
                  total_weight: item.total_weight,
                  based_weight: item.based_weight
                };
              }
              return base;
            });

            const param2 = {
              uuid: uuid(),
              booking_id: tableBooking.id,
              status: 'active',
              order_type: 'walk in',
              order_date: formatDate(new Date()),
              bump_order_products: bumpProducts,
              order_number: (tableBooking as any).order_id || 0,
              order_index: -1,
              phone_order_id: 1,
              guest: {
                id: tableBooking.guest.id,
                seating_preference:
                  (tableBooking.guest as any).seating_preference || '',
                special_relationship:
                  (tableBooking.guest as any).special_relationship || '',
                last_name: tableBooking.guest.last_name || 'In',
                company: (tableBooking.guest as any).company || 'Wabi',
                phone: tableBooking.guest.phone || '12345'
              },
              customer: null,
              employee_id: currentEmployee?.id
            };

            const response2 = await addProductToBumpOrder(param2);

            // delete local order
            await db.orders.delete(localOrder.id);
          } catch (error) {
            console.error('Error processing local order:', error);
            toast({
              title: 'Error',
              variant: 'destructive',
              description: 'Failed to process local order'
            });
          }
        }
        // update data after local order processing
        updateData();
        setLocalOrders([]);
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Order synced successfully'
        });
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.3;
        audio.play();
      }
    };
    processLocalOrders();
  }, [isOnline]);

  // get local orders --------------------------------------------------
  useEffect(() => {
    const fetchLocalOrders = async () => {
      try {
        const orders = await db.orders.toArray();
        setLocalOrders(orders as any);
      } catch (error) {
        console.error('Error fetching local orders:', error);
      }
    };

    fetchLocalOrders();
  }, [isOnline]);

  // get local orders
  useEffect(() => {
    const fetchLocalOrders = async () => {
      try {
        const updatedOrders = await db.orders.toArray();

        setLocalOrders?.(updatedOrders);
      } catch (error) {
        console.error('Error fetching local orders:', error);
      }
    };

    if (!isOnline) {
      fetchLocalOrders();
    }
    // Set up interval to refresh local orders
    const interval = setInterval(fetchLocalOrders, 3000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const syncLocalOrder = async (localOrder: any) => {
    try {
      // get table id from local order
      const tableId = localOrder.tableId;
      if (!tableId) {
        console.log('No table ID found in local order');
        return;
      }

      // get table booking data
      const tableBooking = activeBookings.find((b: any) =>
        b.table.some((t: any) => t.id === tableId)
      );

      if (!tableBooking) {
        console.log('No booking data found for table:', tableId);
        return;
      }

      const updatedOrderListProducts = localOrder.products.map(
        (product: any) => ({
          ...product,
          isCancelled: false,
          is_deleted: false,
          is_pop_up: false,
          price_type: product.price_type || 1
        })
      );

      const param: any = {
        status: tableBooking.status || 0,
        table_id: tableId,
        booking_id: tableBooking.id,
        guest: tableBooking.guest,
        products: updatedOrderListProducts,
        pos_device_id: 7,
        employee_id: currentEmployee?.id
      };

      if (tableBooking.uuid) {
        param.booking_uuid = tableBooking.uuid;
      }
      if ((tableBooking as any).order_uuid) {
        param.uuid = (tableBooking as any).order_uuid;
      } else {
        param.uuid = uuid();
      }

      const response = await addBookingOrder(param);

      // add bump order
      const bumpProducts = localOrder.products.map((item: any) => {
        const base = {
          uuid: uuid(),
          id: item.id,
          created_at: item.created_at,
          quantity: item.quantity,
          category_id: item.category_id,
          note: item.note || '',
          price_type: item.price_type || 1,
          bump_order_add_ons:
            item.addOns?.map((addOn: any) => ({
              id: addOn.id,
              quantity: addOn.quantity
            })) || [],
          status: 'active'
        };
        if (item.price_type === 2) {
          return {
            ...base,
            total_weight: item.total_weight,
            based_weight: item.based_weight
          };
        }
        return base;
      });

      const param2 = {
        uuid: uuid(),
        booking_id: tableBooking.id,
        status: 'active',
        order_type: 'walk in',
        order_date: formatDate(new Date()),
        bump_order_products: bumpProducts,
        order_number: (tableBooking as any).order_id || 0,
        order_index: -1,
        phone_order_id: 1,
        guest: {
          id: tableBooking.guest.id,
          seating_preference:
            (tableBooking.guest as any).seating_preference || '',
          special_relationship:
            (tableBooking.guest as any).special_relationship || '',
          last_name: tableBooking.guest.last_name || 'In',
          company: (tableBooking.guest as any).company || 'Wabi',
          phone: tableBooking.guest.phone || '12345'
        },
        customer: null,
        employee_id: currentEmployee?.id
      };

      const response2 = await addProductToBumpOrder(param2);

      // delete local order
      await db.orders.delete(localOrder.id);

      // update local orders state
      setLocalOrders((prev: any[]) =>
        prev.filter((order: any) => order.id !== localOrder.id)
      );

      toast({
        title: 'Success',
        description: 'Order synced successfully',
        variant: 'success'
      });
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.3;
      audio.play();
      // update data after sync
      updateData();
    } catch (error) {
      console.error('Error syncing local order:', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Failed to sync order'
      });
    }
  };

  const syncAllLocalOrders = async () => {
    setIsSyncing(true);
    for (const localOrder of localOrders) {
      await syncLocalOrder(localOrder);
    }
    setIsSyncing(false);
  };
  const deleteAllLocalOrders = async () => {
    try {
      await db.orders.clear();
      setLocalOrders([]);
      toast({
        title: 'Success',
        description: 'All unsynced orders have been deleted.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting all local orders:', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Failed to delete all unsynced orders.'
      });
    } finally {
      setIsDeleteAllConfirmModalOpen(false);
    }
  };

  // Function to delete local order
  const deleteLocalOrder = async (localOrder: any) => {
    try {
      await db.orders.delete(localOrder.id);

      // update local orders state
      setLocalOrders((prev: any[]) =>
        prev.filter((order: any) => order.id !== localOrder.id)
      );

      toast({
        title: 'Success',
        description: 'Order deleted successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting local order:', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Failed to delete order'
      });
    }
  };

  const handleDeleteClick = (order: any) => {
    setOrderToDelete(order);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      await deleteLocalOrder(orderToDelete);
      setIsDeleteConfirmModalOpen(false);
      setOrderToDelete(null);
    }
  };

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <PageContainer scrollable>
          <div className="space-y-2">
            <div
              ref={bottomButtons}
              className="fixed bottom-0 right-0 z-50 flex items-center gap-4 pb-4 pr-4"
            >
              {hasPOSPermission && (
                <>
                  {localOrders.length > 0 && (
                    <Button
                      variant={'danger'}
                      onClick={() => setIsLocalOrdersModalOpen(true)}
                    >
                      Unsynced Orders: {localOrders.length}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="bg-tertiary p-2"
                    onClick={toggleSidebarVisibility}
                  >
                    {isSidebarVisible ? 'Hide Bookings' : 'Show Bookings'}
                  </Button>
                </>
              )}
              <Button
                variant="secondary"
                className="rounded-lg bg-tertiary p-1"
                onClick={handleZoomOut}
              >
                <Minus />
              </Button>
              <Button
                variant="secondary"
                className="rounded-lg bg-tertiary p-1"
                onClick={handleZoomIn}
              >
                <Plus />
              </Button>
              <DropdownMenu
                modal={false}
                open={showFloors}
                onOpenChange={setShowFloors}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="bg-tertiary">
                    {floors.map(
                      (floor) => floor.id === selectedFloor && floor.floor_name
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {floors.map((floor: any) => (
                    <DropdownMenuItem
                      key={floor.id}
                      onClick={() => {
                        handleSelectFloor(floor.id);
                        setShowFloors(false);
                      }}
                      className={`block w-full cursor-pointer p-2 text-left ${
                        selectedFloor === floor.id ? 'text-primary' : ''
                      }`}
                    >
                      {floor.floor_name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="secondary"
                className="bg-tertiary px-2 py-1"
                onClick={() => setShowTimeline(!showTimeline)}
              >
                <Clock3 style={{ width: '24px' }} />
              </Button>
            </div>
            {/* Date and Shift Section */}
            <div
              ref={dateAndShift}
              className="flex flex-col space-y-2 py-2 md:flex-row md:items-center md:justify-between md:space-y-0"
            >
              <div className="flex w-full items-center justify-center text-sm md:text-base">
                <BookingCalendarArrow
                  arrowType="left"
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
                <div className="mx-0 md:mx-4">
                  <div
                    className="flex h-6 w-36 cursor-pointer items-center justify-center rounded-2xl bg-gray-dark font-medium shadow md:h-8 md:w-48"
                    onClick={() => setOpenBookingCalendar(true)}
                  >
                    <label className="cursor-pointer">
                      {formatDate2Digit(selectedDate)}
                    </label>
                  </div>
                  <SelectBookingCalendar
                    selectedDate={selectedDate}
                    openBookingCalendar={openBookingCalendar}
                    setSelectedDate={setSelectedDate}
                    handleCloseSelectedBookingCalendar={() =>
                      setOpenBookingCalendar(false)
                    }
                  />
                </div>
                <div className="mx-0 md:mx-4">
                  <ShiftIndicator
                    selectedShift={selectedShift}
                    setSelectedDate={setSelectedDate}
                    isSpecialDay={isSpecialDay}
                  />
                </div>
                <ShiftSelector
                  selectedDate={selectedDate}
                  selectedShift={selectedShift}
                  setSelectedShift={setSelectedShift}
                  shifts={allShifts}
                  isSpecialDay={isSpecialDay}
                  closedDatesMapRef={closedDatesMapRef.current}
                />
                <BookingCalendarArrow
                  arrowType="right"
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </div>
              <div className="flex justify-center gap-2">
                {isSidebarVisible ? (
                  <Button
                    variant="secondary"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary p-1.5 md:h-10 md:w-10 md:p-2"
                    onClick={handleOpenBookingModal}
                  >
                    <Plus width={20} />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      className="h-8 rounded-lg bg-tertiary px-2 text-sm md:h-10 md:min-w-28 md:p-2 md:text-base"
                      onClick={() => router.push('/quick-sale')}
                    >
                      Quick Sale
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-8 rounded-lg bg-tertiary px-2 text-sm !leading-4 md:h-10 md:min-w-28 md:p-2 md:text-base"
                      onClick={() => setIsOpenPhoneOrderModal(true)}
                    >
                      Phone Order
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div
              ref={contentRef}
              className="relative flex w-full flex-col md:flex-row"
            >
              {/* Left Sidebar */}
              <div
                ref={sidebar}
                className={`${
                  isSidebarVisible
                    ? 'relative top-0 w-80 min-w-80 opacity-100 lg:max-w-96'
                    : 'absolute top-40 w-0 min-w-0 opacity-0 md:relative'
                } h-fit overflow-hidden rounded-lg transition-all duration-500 ease-in-out`}
              >
                <div className="overflow-hidden rounded-lg border bg-tertiary p-4">
                  <TableDetails
                    updateData={updateData}
                    floors={floors}
                    setIsBookingModalOpen={setIsBookingModalOpen}
                    isChangingTable={isChangingTable}
                    saveBookingHandler={saveBookingHandler}
                    selectedBooking={selectedBooking}
                    selectedBookingHandler={setSelectedBooking}
                    selectedShiftId={selectedShift}
                    selectedTableBookingData={selectedTableBookingData}
                    selectedTableIds={selectedTableIds}
                    setIsChangingTable={setIsChangingTable}
                    setSelectedTableIds={setSelectedTableIds}
                    setShowTableDetails={setShowTableDetails}
                    showTableDetails={showTableDetails}
                    showTableDetailsHandler={showTableDetailsHandler}
                    tableDetailsData={tableDetailsData}
                    allShifts={allShifts}
                    handleCreateWalkInBooking={handleCreateWalkInBooking}
                  />

                  <div className="booking-list-container w-full">
                    <div className="bg-search-bar inline-flex h-10 w-full rounded-lg text-right">
                      <Input
                        className="w-full bg-secondary"
                        name="name"
                        onChange={(e) => handleChange(e)}
                      />
                    </div>
                  </div>
                  <BookingList
                    selectedOption={selectedOption}
                    filteredBookingList={filteredBookingList}
                    floors={floors}
                    selectedDate={selectedDate}
                    allBookings={allBookings}
                    allBookingsDevideByShift={allBookingsDevideByShift}
                    keyword={keyword}
                    selectedBooking={selectedBooking}
                    selectedBookingHandler={setSelectedBooking}
                    selectedOptionName={selectedOptionName}
                    shifts={allShifts}
                  />
                  <div className="booking-list-container-footer">
                    <SegmentedControl selectedSegment={selectedSegment} />
                  </div>
                </div>
                {selectedBooking !== null && !isChangingTable && (
                  <div
                    className="fixed bottom-0 right-0 top-20 z-50 mr-4"
                    style={{
                      width: `calc(${reservationDetailWidth}px)`,
                      height: `calc(100vh - ${exceptSlideHeight}px)`
                    }}
                  >
                    <Swiper
                      ref={swiperRef}
                      modules={[Mousewheel]}
                      spaceBetween={50}
                      slidesPerView={'auto'}
                      onSlideChange={handleSlideChange}
                      className={`swiper-container ${slideClass} h-full`}
                      initialSlide={1}
                      simulateTouch={true}
                      allowTouchMove={true}
                      onSwiper={(swiper) => setSwiperInstance(swiper)}
                    >
                      <SwiperSlide />
                      <SwiperSlide>
                        <ReservationDetails
                          key={selectedBooking?.id}
                          floors={floors}
                          selectedBooking={selectedBooking}
                          setSelectedBooking={setSelectedBooking}
                          statusOption={getBookingStatusOptions(
                            selectedBooking?.status
                          )}
                          saveBookingHandler={saveBookingHandler}
                          experienceList={experienceList}
                          shifts={allShifts}
                          reservationDetailWidth={reservationDetailWidth}
                          exceptSlideHeight={exceptSlideHeight}
                          updateData={updateData}
                        />
                      </SwiperSlide>
                      <SwiperSlide />
                    </Swiper>
                  </div>
                )}
              </div>

              <div
                className={`relative w-full md:${
                  isSidebarVisible ? 'w-3/4' : 'w-full'
                } transition-all duration-500 ease-in-out`}
              >
                <div className="relative mt-6 h-[calc(100vh-200px)] overflow-auto rounded-lg">
                  <div
                    className="h-full w-full origin-top-left p-4"
                    style={{ transform: `scale(${scale})` }}
                  >
                    {renderTableCards(
                      filteredTable(selectedFloor) || [],
                      activeBookings || []
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>

        {/* Modal for Adding Booking */}
        {isBookingModalOpen && (
          <CreateBooking
            allEmployees={allEmployees}
            allShifts={allShifts}
            floors={floors}
            handleCloseCreateBooking={() => setIsBookingModalOpen(false)}
            isBookingModalOpen={isBookingModalOpen}
            selectedDate={selectedDate}
            selectedShiftId={selectedShift}
            setIsBookingModalOpen={setIsBookingModalOpen}
            tableDetailsData={tableDetailsData}
            updateData={updateData}
            closedDatesMapRef={closedDatesMapRef.current}
          />
        )}
      </DndContext>
      {isOpenPhoneOrderModal && (
        <PhoneOrderListModal
          isOpenPhoneOrderModal={isOpenPhoneOrderModal}
          setIsOpenPhoneOrderModal={setIsOpenPhoneOrderModal}
          phoneOrderList={phoneOrderList}
          setPhoneOrderList={setPhoneOrderList}
          propAllCategories={allCategories}
          propSetAllCategories={setAllCategories}
        />
      )}
      <Dialog
        open={isPaymentModalOpen}
        onOpenChange={() => setIsPaymentModalOpen(!isPaymentModalOpen)}
        modal={true}
      >
        <DialogOverlay className="min-h-full min-w-full p-4 backdrop-blur-3xl">
          <ProductAndOrder
            selectedTableId={selectedTableId}
            onClose={() => {
              removeBooking();
              setIsPaymentModalOpen(!isPaymentModalOpen);
            }}
            updateData={updateData}
            propAllCategories={allCategories}
            propSetAllCategories={setAllCategories}
            tables={tables}
            setUpdateCategories={setUpdateCategories}
            booking={activeBookings.find(
              (booking) => booking?.table?.[0]?.id === selectedTableId
            )}
            localOrders={localOrders}
            setLocalOrders={setLocalOrders}
          />
        </DialogOverlay>
      </Dialog>

      <Modal
        title="Unsynced Orders"
        description="Orders that are saved locally and need to be synced"
        isOpen={isLocalOrdersModalOpen}
        onClose={() => setIsLocalOrdersModalOpen(false)}
        className="max-w-2xl"
      >
        <div className="mb-4 flex justify-end gap-4">
          <Button
            onClick={syncAllLocalOrders}
            disabled={isSyncing}
            className="w-32"
          >
            {isSyncing ? 'Syncing...' : 'Sync All'}
          </Button>
          <Button
            variant="danger"
            onClick={() => setIsDeleteAllConfirmModalOpen(true)}
            className="w-32"
          >
            Delete All
          </Button>
        </div>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {localOrders.map((order: any, index: number) => {
            const table = tables.find((table) => table.id === order.tableId);
            const tableName = table ? table.name : `Table ${order.tableId}`;

            return (
              <div
                key={order.id || index}
                className="rounded border bg-secondary shadow-sm"
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      <strong>Table:</strong> {tableName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Created At:</strong>{' '}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrderForDetail(order);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      See detail
                    </Button>
                    <Button onClick={() => syncLocalOrder(order)} size="sm">
                      Sync
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(order)}
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        title="Order Details"
        description="Detailed view of the order items"
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrderForDetail(null);
        }}
        className="max-w-2xl"
      >
        <div className="flex items-center justify-between p-3">
          <p className="text-sm">
            <strong>Table:</strong>{' '}
            {getTableNameById(selectedOrderForDetail?.tableId)}
          </p>
          <p className="text-sm">
            <strong>Status:</strong>{' '}
            {selectedOrderForDetail?.status || 'Active'}
          </p>
        </div>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto rounded-lg bg-secondary p-4">
          {selectedOrderForDetail?.products?.map(
            (product: any, productIndex: number) => (
              <div key={productIndex}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm">
                      {product.title || `Product ${productIndex + 1}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${product.price} × {product.quantity || 1}
                    </p>
                    {product.note && (
                      <p className="text-sm text-muted-foreground">
                        Note: {product.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      $
                      {((product.price || 0) * (product.quantity || 1)).toFixed(
                        2
                      )}
                    </p>
                  </div>
                </div>

                {/* If there are add-ons */}
                {product.addOns && product.addOns.length > 0 && (
                  <div className="border-t bg-muted/50 p-3">
                    <p className="mb-2 text-sm font-medium">Add-ons:</p>
                    <div className="space-y-2">
                      {product.addOns.map((addOn: any, addOnIndex: number) => (
                        <div
                          key={addOnIndex}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            • {addOn.name || `Add-on ${addOnIndex + 1}`}
                          </span>
                          <span>Qty: {addOn.quantity || 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
        {/* Total amount */}
        <div className="border-t pt-4">
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>
              $
              {selectedOrderForDetail?.products
                ?.reduce((total: number, product: any) => {
                  const productTotal =
                    (product.price || 0) * (product.quantity || 1);
                  return total + productTotal;
                }, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      </Modal>

      <Modal
        title="Confirm Delete"
        description="Are you sure you want to delete this order? This action cannot be undone."
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => {
          setIsDeleteConfirmModalOpen(false);
          setOrderToDelete(null);
        }}
        className="max-w-md"
      >
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setIsDeleteConfirmModalOpen(false);
              setOrderToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal
        title="Confirm Delete All"
        description="Are you sure you want to delete all unsynced orders? This action cannot be undone."
        isOpen={isDeleteAllConfirmModalOpen}
        onClose={() => setIsDeleteAllConfirmModalOpen(false)}
        className="max-w-md"
      >
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsDeleteAllConfirmModalOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteAllLocalOrders}>
            Delete All
          </Button>
        </div>
      </Modal>
    </>
  );
}

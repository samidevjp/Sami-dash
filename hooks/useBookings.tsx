import { formatDateShort } from '@/lib/utils';
import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useMemo
} from 'react';
import { useApi } from './useApi';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { getCurrentShift } from '@/utils/Utility';
import { BOOKINGSTATUS } from '@/utils/enum';
import { useShiftsStore } from './useShiftsStore';
import { getSpecificShift } from '@/utils/common';

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  quantity: number;
  is_printed: boolean;
  uuid: string;
}

export interface Booking {
  id: number;
  uuid: string;
  user_id: number;
  guest_id: number;
  taken_by: number;
  shift_id: number;
  floor_id: number;
  status: number;
  party_size: number;
  date: string;
  start_time: number;
  end_time: number;
  session_time: number;
  type: number;
  is_online_booking: number;
  created_at: string;
  updated_at: string;
  guest: Guest;
  table: {
    id: number;
    name: string;
  }[];
  start_date: string;
  end_date: string;
  products: Product[];
}

interface Order {
  id: number;
  order_id: number;
  transaction_id: string;
  sub_total: number;
  total: number;
  transaction_date: string;
  order_type: number;
  uuid: string;
  pos_device_id: number;
  payments: any[];
  tax: any;
  tip: any;
  discount: any;
  custom_amount: any;
  surcharge: any[];
  isActive: boolean;
  orders: any[];
  take_away: number;
}

interface TableContextProps {
  tablesData: any[];
  allBookings: Booking[];
  allBookingsDevideByShift: Booking[];
  activeBookings: Booking[];
  createdTodayBookings: any[];
  finishedBookings: Booking[];
  floorsName: { id: number; name: string }[];
  orders: Order[];
  latestData: any[];
  isUpdated: boolean;
  setTablesData: React.Dispatch<React.SetStateAction<any[]>>;
  updateData: (shiftId?: any, date?: any) => void;
  loading: boolean;
  filteredTable: (id: number) => any[];
  setFloors: React.Dispatch<React.SetStateAction<any[]>>;
  fetchData: (date?: any, shiftId?: any) => void;
  fetchBookings: () => void;
  updateProductPrintedStatus: (
    bookingId: number,
    productIds: string[],
    isPrinted: boolean
  ) => void;
  floors: any[];
  hookCreateBooking: (table: any, token: any) => any;
  setAllBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

const TableContext = createContext<TableContextProps>({} as TableContextProps);

interface TableProviderProps {
  children: ReactNode;
}

const TableProvider = ({ children }: TableProviderProps) => {
  const { getBookings, getOrders, getBookingOrderList, getFloors } = useApi();
  const { data: session } = useSession();
  const [tablesData, setTablesData] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allBookingsDevideByShift, setAllBookingsDevideByShift] = useState<
    Booking[]
  >([]);
  const { shifts } = useShiftsStore();
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [finishedBookings, setFinishedBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestData, setLatestData] = useState<any[]>([]);
  const [isUpdated, setIsUpdated] = useState(true);
  const [createdTodayBookings, setCreatedTodayBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [floors, setFloors] = useState<any[]>([]);
  if (!session) {
    return <>{children}</>;
  }
  const currentShiftId = getCurrentShift(shifts || []);

  const fetchData = useCallback(
    async (newDate?: any, shiftId?: any) => {
      let specificShift = currentShiftId;
      if (shiftId) {
        specificShift = getSpecificShift(shifts, shiftId);
      }
      setLoading(true);
      try {
        const date = formatDateShort(new Date(newDate || new Date()));
        const [bookingResponse, orderListResponse] = await Promise.all([
          getBookings({
            date,
            shift_id: 0 // Set shift_id to 0 to retrieve all bookings
          }),
          getBookingOrderList({
            date,
            shift_id: 0 // Set shift_id to 0 to retrieve all orders
          })
        ]);

        const latestEntries: { [key: string]: any } = {};
        orderListResponse.data.orders.forEach((entry: any) => {
          latestEntries[entry.booking_uuid] = entry;
        });

        const bookingsWithProducts = bookingResponse.data.bookings
          .filter((booking: any) => booking.date === date)
          .map((booking: any) => ({
            ...booking,
            products: latestEntries[booking.uuid]?.products || [],
            order_id: latestEntries[booking.uuid]?.id || 0,
            order_uuid: latestEntries[booking.uuid]?.uuid || 0
          }))
          .sort((a: any, b: any) => {
            if (a?.start_time < b?.start_time) return -1;
            if (a?.start_time > b?.start_time) return 1;
            return 0;
          });

        const activeBookings = bookingsWithProducts.filter(
          (booking: any) =>
            booking.guest !== null &&
            booking.status !== BOOKINGSTATUS.finished &&
            booking.status !== BOOKINGSTATUS.cancelled &&
            booking.status !== BOOKINGSTATUS.noShow &&
            // Filter by time range manually
            booking?.end_time > specificShift?.start_time &&
            booking?.start_time < specificShift?.end_time
        );

        const allBookingsDevideByShift = bookingsWithProducts.filter(
          (booking: any) =>
            booking?.end_time > specificShift?.start_time &&
            booking?.start_time < specificShift?.end_time
        );

        setAllBookingsDevideByShift(allBookingsDevideByShift);
        setAllBookings(bookingsWithProducts);
        setActiveBookings(activeBookings);
        setLatestData(Object.values(latestEntries));
        setIsUpdated(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    },
    [getBookings, getOrders, getBookingOrderList]
  );

  const fetchFloors = useCallback(async () => {
    try {
      const response = await getFloors();
      setFloors(response.data.floors);
    } catch (err) {
      console.error('Error fetching floors:', err);
    }
  }, [getFloors]);

  useEffect(() => {
    fetchFloors();
    fetchData();
  }, []);
  const floorsName = useMemo(
    () =>
      floors &&
      floors?.map((floor) => ({ id: floor.id, name: floor.floor_name })),
    [floors]
  );
  const updateData = useCallback(
    async (date?: any, shiftId?: any) => {
      await fetchData(date, shiftId);
    },
    [fetchData]
  );

  const filteredTable = useCallback(
    (id: number) => {
      const floor = floors.find((floor) => floor.id === id);
      return floor ? floor.tables : [];
    },
    [floors]
  );

  const updateProductPrintedStatus = useCallback(
    (bookingId: number, productIds: string[], isPrinted: boolean) => {
      setActiveBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                products: booking.products.map((product) =>
                  productIds.includes(product.uuid)
                    ? { ...product, is_printed: isPrinted }
                    : product
                )
              }
            : booking
        )
      );
    },
    []
  );

  const hookCreateBooking = async (params: any, token: any) => {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}booking/store`,
        params,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Error creating booking', err);
    }
  };

  return (
    <TableContext.Provider
      value={{
        tablesData,
        allBookings,
        allBookingsDevideByShift,
        activeBookings,
        createdTodayBookings,
        finishedBookings,
        floorsName,
        orders,
        latestData,
        isUpdated,
        loading,
        setTablesData,
        updateData,
        filteredTable,
        setFloors,
        fetchData,
        setAllBookings,
        fetchBookings: fetchData,
        updateProductPrintedStatus,
        floors,
        hookCreateBooking
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export { TableProvider, TableContext };

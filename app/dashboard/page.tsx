'use client';
import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  useCallback
} from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageContainer from '@/components/layout/page-container';
import { ItemSalesGrid } from '@/components/item-sales-grid';
import AnalyticsDashboard from '@/components/analytics-dashboard';
import SalesDashboard from '@/components/sales-dashboard';
import { SectionSalesCard } from '@/components/section-sales-card';
import { useEmployee } from '@/hooks/useEmployee';
import moment from 'moment';
import { TableContext } from '@/hooks/useBookings';
import { Modal } from '@/components/ui/modal';
import useInvoiceTotals from '@/hooks/useInvoiceTotals';
import { daysOfWeek } from '@/utils/enum';
import { Heading } from '@/components/ui/heading';
import IconBadge from '@/components/ui/iconBadge';
import { useShiftsStore } from '@/hooks/useShiftsStore';
import { useCurrentShiftId } from '@/hooks/getCurrentShiftId';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import {
  DollarSign,
  Users,
  Package,
  Clock,
  Table,
  CalendarCheck,
  BarChart,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

import { formatDateShort, formatNumberWithCommas } from '@/lib/utils';
import DashboardDateTab from './dashboard-date-tab';
import {
  OverviewSkeleton,
  AnalyticsSkeleton,
  SalesSkeleton
} from './loading-skeleton';
import { UpcomingBookings } from '@/components/upcoming-bookings';
import useInventoryStockValues from '@/hooks/useInventoryStock';
import { BookingStats } from '@/components/booking-stats';
import { SalesOverviewStats } from '@/components/sales-overview-stats';
import { InventoryOverviewStats } from '@/components/inventory-overview-stats';
import { TeamInsightsStats } from '@/components/team-insights-stats';
import { PayoutCard } from '@/components/payout-card';
import { useSession } from 'next-auth/react';
import { DateRange } from 'react-day-picker';
import { WagesVsSales } from '@/components/wages-vs-sales';

export default function DashboardPage() {
  const { data: session } = useSession();

  const router = useRouter();
  const { currentEmployee, allEmployees } = useEmployee();
  const {
    getAnalyticsData,
    getDayViewSales,
    timeSheets,
    getBookingCount,
    getDailySalesAll
  } = useApi();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [filter, setFilter] = useState('today');
  const [activeTab, setActiveTab] = useState('overview');
  const [dayViewSales, setDayViewSales] = useState<any>(null);
  const [dailySalesData, setDailySalesData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(moment().format('YYYY-MM-DD')),
    to: new Date(moment().format('YYYY-MM-DD'))
  });
  const { shifts } = useShiftsStore();
  const currentShiftId = useCurrentShiftId(shifts);
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(
    currentShiftId ? currentShiftId : shifts[0]?.id || null
  );
  const [dayViewFilter, setDayViewFilter] = useState<any>({
    filter_type: 'sales',
    date_range: '',
    currentDate: formatDateShort(dateRange?.from || new Date()),
    filter: 'today'
  });
  const { floorsName, latestData, activeBookings } = useContext(TableContext);
  const { invoiceTotals } = useInvoiceTotals();
  const [bookingCount, setBookingCount] = useState<any>(null);
  const [todayBookingData, setTodayBookingData] = useState<any[]>([]);
  const [comparisonBookingData, setComparisonBookingData] = useState<any[]>([]);
  const [isBreakdownOpen, setBreakdownOpen] = useState(false);
  const [ongoingSalesModalOpen, setOngoingSalesModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [upcomingModalOpen, setUpcomingModalOpen] = useState(false);
  const [teamInsightsModalOpen, setTeamInsightsModalOpen] = useState(false);
  const [topSellingItemsModalOpen, setTopSellingItemsModalOpen] =
    useState(false);
  const { categoryStockValues } = useInventoryStockValues();
  const [timeSheetData, setTimeSheetData] = useState<any>(null);
  const [tempRange, setTempRange] = useState<DateRange | undefined>();
  useEffect(() => {
    if (currentShiftId && !selectedShiftId) {
      setSelectedShiftId(currentShiftId);
    }
  }, [currentShiftId, selectedShiftId]);

  // ---------------- Change Date ---------------------------

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = dateRange?.from || new Date();
    const newMoment = moment(currentDate).add(
      direction === 'next' ? 1 : -1,
      'days'
    );
    if (newMoment.isAfter(moment(), 'day')) {
      return;
    }

    const newDate = newMoment.toDate();
    setTempRange(undefined);
    setDateRange({
      from: newDate,
      to: newDate
    });
  };

  // -------------- fetch daily sales data --------------
  useEffect(() => {
    if (
      currentEmployee?.role !== 'owner' &&
      currentEmployee?.role !== 'manager'
    ) {
      router.push('/pos');
      return;
    }

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const res = await getAnalyticsData({
          filter,
          analytics: {
            filter_type: 'sales',
            type: null,
            value: null
          }
        });

        const dayViewSales = await getDayViewSales(dayViewFilter);

        setAnalyticsData(res.data);
        setDayViewSales(dayViewSales);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchAnalyticsData();
  }, [filter, dayViewFilter, currentEmployee]);

  useEffect(() => {
    const fetchTimesheetData = async () => {
      try {
        setLoading(true);

        const startDate = formatDateShort(dateRange?.from || new Date());
        const endDate = formatDateShort(dateRange?.to || new Date());

        let dateRangeTimesheet =
          dateRange?.from && dateRange?.to
            ? `${startDate},${endDate}`
            : `${dayViewFilter.currentDate},${dayViewFilter.currentDate}`;

        const timesheetRes = await timeSheets({
          id: null,
          date_range: dateRangeTimesheet
        });

        setTimeSheetData(timesheetRes.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error fetching timesheet data:', error);
      }
    };

    fetchTimesheetData();
  }, [dateRange]);

  const fetchDailySalesData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    if (activeTab !== 'overview') return;
    try {
      const response = await getDailySalesAll({
        start_date: formatDateShort(dateRange?.from || new Date()),
        end_date: formatDateShort(dateRange?.to || new Date()),
        shift_id: 0
      });
      setDailySalesData(response.data);
    } catch (error) {
      console.error('Error fetching daily sales data:', error);
    }
  };

  useEffect(() => {
    fetchDailySalesData();
  }, [dateRange]);

  // Check if a range is selected

  const isRangeSelected = tempRange !== undefined;
  // Calculate ongoing sales from active bookings for the modal (legacy calculation)
  const ongoingSales = useMemo(() => {
    if (!latestData || !Array.isArray(latestData)) return 0;
    return latestData.reduce((acc, booking) => {
      if (booking.guest?.charges?.length === 0) {
        const productTotal = booking.products?.reduce(
          (sum: number, product: any) => {
            const basePrice = product.price * product.quantity;
            const addonsPrice = (product.addOns || []).reduce(
              (addonSum: number, addon: any) =>
                addonSum + addon.price * addon.quantity,
              0
            );
            return sum + basePrice + addonsPrice;
          },
          0
        );
        return acc + productTotal;
      }
      return acc;
    }, 0);
  }, [latestData]);

  // Utility function to get table name by ID
  const getTableNameById = useCallback(
    (tableId: number) => {
      if (!tableId) {
        return '-';
      }

      // Try to find table from activeBookings first
      const booking = activeBookings?.find((b: any) =>
        b.table.some((t: any) => t.id === tableId)
      );
      if (booking) {
        const table = booking.table.find((t: any) => t.id === tableId);
        if (table) {
          return table.name;
        }
      }
      return `Table ${tableId}`;
    },
    [activeBookings]
  );
  const upcomingBooking = useMemo(() => {
    const today = moment().format('YYYY-MM-DD');

    return activeBookings
      ?.filter(
        (booking) => booking?.is_online_booking === 1 && booking.date === today
      )
      .sort((a, b) => a.start_time - b.start_time);
  }, [activeBookings]);

  // -------------- fetch booking count --------------

  useEffect(() => {
    const fetchBookingCount = async () => {
      if (!dateRange?.from || !dateRange?.to) return;

      const startDate = moment(dateRange.from)
        .startOf('day')
        .format('YYYY-MM-DD HH:mm:ss');
      const endDate = moment(dateRange.to)
        .endOf('day')
        .format('YYYY-MM-DD HH:mm:ss');

      try {
        const fetchedBookingCount = await getBookingCount({
          startDateTime: startDate,
          endDateTime: endDate,
          display: 'full'
        });

        const onlineBookings = fetchedBookingCount.data.bookings.filter(
          (booking: { is_online_booking: number }) =>
            booking.is_online_booking === 1
        );

        setBookingCount(onlineBookings);
      } catch (err) {
        console.error('Error fetching booking count:', err);
      }
    };

    fetchBookingCount();
  }, [dateRange]);

  // -------------- fetch booking comparison data --------------
  useEffect(() => {
    const fetchBookingComparison = async () => {
      if (!dateRange?.from || !dateRange?.to) return;

      const start = moment(dateRange.from).startOf('day');
      const end = moment(dateRange.to).endOf('day');

      const rangeDays = end.diff(start, 'days') + 1;

      const comparisonStart = moment(start).subtract(rangeDays, 'days');
      const comparisonEnd = moment(start).subtract(1, 'day').endOf('day');

      try {
        const [currentRes, comparisonRes] = await Promise.all([
          getBookingCount({
            startDateTime: start.format('YYYY-MM-DD HH:mm:ss'),
            endDateTime: end.format('YYYY-MM-DD HH:mm:ss'),
            display: 'full'
          }),
          getBookingCount({
            startDateTime: comparisonStart.format('YYYY-MM-DD HH:mm:ss'),
            endDateTime: comparisonEnd.format('YYYY-MM-DD HH:mm:ss'),
            display: 'full'
          })
        ]);

        const currentBookings = currentRes.data.bookings.filter(
          (b: any) => b.is_online_booking === 1
        );
        const comparisonBookings = comparisonRes.data.bookings.filter(
          (b: any) => b.is_online_booking === 1
        );

        setTodayBookingData(currentBookings);
        setComparisonBookingData(comparisonBookings);
      } catch (error) {
        console.error('Booking comparison fetch failed:', error);
      }
    };

    fetchBookingComparison();
  }, [dateRange]);

  const getComparisonDateRangeLabel = () => {
    if (!dateRange?.from || !dateRange?.to) return '';
    const start = moment(dateRange.from).startOf('day');
    const end = moment(dateRange.to).endOf('day');
    const rangeDays = end.diff(start, 'days') + 1;
    const comparisonStart = moment(start).subtract(rangeDays, 'days');
    const comparisonEnd = moment(start).subtract(1, 'day');
    const formattedStart = comparisonStart.format('D MMM');
    const formattedEnd = comparisonEnd.format('D MMM');

    return `${formattedStart} – ${formattedEnd}`;
  };

  // Filter types for sales analytics
  const filterTypes = [
    { value: 'sales', label: 'Sales' },
    { value: 'cash', label: 'Cash' },
    { value: 'credit', label: 'Credit' },
    { value: 'windcave', label: 'Windcave' },
    { value: 'dine_in', label: 'Dine In' },
    { value: 'reservations', label: 'Reservations' },
    { value: 'phone_orders', label: 'Phone Orders' },
    { value: 'takeaway_orders', label: 'Takeaway Orders' }
  ];

  // Sales breakdown categories for detailed analysis
  const salesBreakdown = [
    { label: 'Credit', key: 'credit' },
    { label: 'Cash', key: 'cash' },
    { label: 'Amex', key: 'amex' },
    { label: 'Windcave', key: 'windcave' },
    { label: 'Uber Eats', key: 'uber eats' },
    { label: 'Tap to Pay', key: 'tap to pay' },
    { label: 'Via EFT', key: 'via eft' },
    { label: "Goff's Bar", key: "goff's bar" },
    { label: 'Voucher', key: 'voucher' }
  ];

  // Calculate total stock on hand from category values
  const stockOnHand = Object.values(categoryStockValues).reduce(
    (acc, val) => acc + val,
    0
  );

  // Calculate total party size for today's bookings
  const totalPartySizeToday = useMemo(
    () => todayBookingData.reduce((sum, b) => sum + b.party_size, 0),
    [todayBookingData]
  );

  // Calculate total party size for comparison period
  const totalPartySizeComparison = useMemo(
    () => comparisonBookingData.reduce((sum, b) => sum + b.party_size, 0),
    [comparisonBookingData]
  );

  // Calculate booking statistics
  const bookingCountToday = todayBookingData.length;
  const bookingCountComparison = comparisonBookingData.length;
  const bookingDifference = bookingCountToday - bookingCountComparison;
  const bookingPercentageChange =
    bookingCountComparison > 0
      ? `${((bookingDifference / bookingCountComparison) * 100).toFixed(1)}`
      : bookingCountToday > 0
      ? 100
      : 0;

  // Calculate party size statistics
  const partySizeDifference = totalPartySizeToday - totalPartySizeComparison;
  const percentageChange =
    totalPartySizeComparison > 0
      ? `${((partySizeDifference / totalPartySizeComparison) * 100).toFixed(1)}`
      : totalPartySizeToday > 0
      ? 100
      : 0;

  // Process received bookings data
  const recievedBooking = useMemo(() => {
    if (!bookingCount) return null;
    return bookingCount;
  }, [bookingCount]);

  // Calculate total booking party size
  const totalBookingPartySize = useMemo(() => {
    if (!recievedBooking) return 0;
    return recievedBooking.reduce(
      (total: number, booking: any) => total + booking.party_size,
      0
    );
  }, [recievedBooking]);

  // Calculate total upcoming booking party size
  const totalUpcomingBookingPartySize = useMemo(() => {
    if (!upcomingBooking) return 0;
    return upcomingBooking.reduce(
      (total: number, booking: any) => total + booking.party_size,
      0
    );
  }, [upcomingBooking]);

  // Calculate total pay hours from timesheet data
  const totalPayHours = useMemo(() => {
    return (
      timeSheetData?.reduce(
        (acc: any, record: any) => acc + record.total_hours,
        0
      ) || 0
    );
  }, [timeSheetData]);

  // Calculate total number of employees
  const totalEmployee = useMemo(() => {
    return timeSheetData?.length || 0;
  }, [timeSheetData]);

  // Calculate average shift time
  const avarageShiftTime = useMemo(() => {
    const result = totalPayHours / totalEmployee;
    return isNaN(result) ? 0 : result;
  }, [totalPayHours, totalEmployee]);

  // Calculate total cost from timesheet data
  // Total_cost from backend is not working  so we are using this function to calculate the total cost
  const calculateTotalCost = useMemo(() => {
    if (!timeSheetData || !allEmployees) return 0;
    return timeSheetData.reduce((total: number, timesheet: any) => {
      const employee = allEmployees.find(
        (emp) => emp.id === timesheet.employee_id
      );
      if (!employee || !employee.pay_rates) {
        return total;
      }
      let dayNumber: number;
      if (filter === 'today') {
        dayNumber =
          daysOfWeek[moment().format('dddd') as keyof typeof daysOfWeek];
      } else {
        const shiftDate = moment(timesheet.started_at).format('dddd');
        dayNumber = daysOfWeek[shiftDate as keyof typeof daysOfWeek];
      }
      const payRate = employee.pay_rates.find(
        (rate: { day_number: number }) => rate.day_number === dayNumber
      );
      if (!payRate) {
        return total;
      }
      const workedHours = moment
        .duration(timesheet.total_hours, 'seconds')
        .asHours();
      const cost = workedHours * payRate.rate;

      return total + cost;
    }, 0);
  }, [timeSheetData, allEmployees, filter]);

  // Process analytics chart data
  const analyticsChartData = useMemo(() => {
    return Object.entries(dayViewSales?.result || {}).map(
      ([key, data]: any) => {
        let xLabel;
        if (filter === 'today') {
          xLabel = data.label;
        } else if (filter === '14 days' || filter === '30 days') {
          xLabel = moment(key, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
        } else {
          xLabel = moment(key, 'YYYY-MM-DD HH:mm').format('ddd');
        }
        return {
          date: xLabel,
          value: parseFloat(data.sales)
        };
      }
    );
  }, [dayViewSales, filter]);

  // Calculate cumulative data for charts
  const cumulativeData = Object.entries(dayViewSales?.result || {}).reduce(
    (acc, [key, data]) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1].value : 0;
      const currentSales = parseFloat((data as any).sales || '0');
      const dateLabel =
        filter === 'today'
          ? (data as any).label
          : moment(key, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
      acc.push({
        date: dateLabel,
        value: lastValue + currentSales
      });
      return acc;
    },
    [] as { date: string; value: number }[]
  );

  // Process upcoming bookings by floor
  const upcomingByFloorAsCategorySales = useMemo(() => {
    const initialItems =
      floorsName?.map((floor) => ({
        name: floor.name,
        total_covers: 0,
        total_bookings: 0
      })) || [];

    if (!upcomingBooking || !floorsName) {
      return {
        items: initialItems,
        all_covers: 0,
        all_bookings: 0
      };
    }

    const floorTotals: Record<string, number> = {};
    let overallTotalPartySize = 0;
    let floorBookingCounts: Record<string, number> = {};
    upcomingBooking.forEach((booking) => {
      const floorName =
        floorsName.find((f) => f.id === booking.floor_id)?.name || 'Unknown';

      floorTotals[floorName] =
        (floorTotals[floorName] || 0) + booking.party_size;
      overallTotalPartySize += booking.party_size;
      floorBookingCounts[floorName] = (floorBookingCounts[floorName] || 0) + 1;
    });

    let overAllBookings = Object.values(floorBookingCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    const updatedItems = initialItems.map((item) => {
      const partySize = floorTotals[item.name] || 0;
      const bookingCount = floorBookingCounts[item.name] || 0;

      return {
        ...item,
        total_covers: partySize,
        total_bookings: bookingCount
      };
    });

    return {
      items: updatedItems,
      all_covers: overallTotalPartySize,
      all_bookings: overAllBookings
    };
  }, [upcomingBooking, floorsName]);

  // Get filtered total based on selected period
  const getFilteredTotal = () => {
    switch (filter) {
      case 'today':
        return invoiceTotals.today;
      case '7 days':
        return invoiceTotals.week;
      case '14 days':
        return invoiceTotals.twoweeks;
      case '30 days':
        return invoiceTotals.month;
      default:
        return invoiceTotals.today;
    }
  };

  // Get selected date range
  const getSelectedDate = () => {
    if (tempRange) {
      return `${moment(tempRange.from).format('ddd, D MMM')} - ${moment(
        tempRange.to
      ).format('ddd, D MMM')}`;
    }
    return moment(dateRange?.from).format('ddd, D MMM');
  };

  const getDateRange = (days: number) => {
    const endDate = moment(dayViewFilter.currentDate);
    const startDate = moment(dayViewFilter.currentDate).subtract(
      days - 1,
      'days'
    );
    return {
      from: startDate.format('YYYY-MM-DD'),
      to: endDate.format('YYYY-MM-DD')
    };
  };

  const updateFilter = (str: string) => {
    setFilter(str);
    let dateRangeNumber;
    switch (str) {
      case 'today':
        dateRangeNumber = getDateRange(0);
        break;
      case '7 days':
        dateRangeNumber = getDateRange(7);
        break;
      case '14 days':
        dateRangeNumber = getDateRange(14);
        break;
      case '30 days':
        dateRangeNumber = getDateRange(30);
        break;
    }
    setDateRange(
      dateRange?.from && dateRange?.to
        ? {
            from: new Date(dateRange.from),
            to: new Date(dateRange.to)
          }
        : undefined
    );
    setDayViewFilter({
      ...dayViewFilter,
      filter: str,
      date_range: dateRangeNumber
    });
  };
  const getFilterDateLabel = () => {
    if (tempRange) {
      return `${moment(tempRange.from).format('D MMM')} – ${moment(
        tempRange.to
      ).format('D MMM')}`;
    }

    switch (filter) {
      case 'today':
        return moment().format('dddd, D MMM');
      case '7 days':
        return `${moment()
          .subtract(6, 'days')
          .format('D MMM')} – ${moment().format('D MMM')}`;
      case '14 days':
        return `${moment()
          .subtract(13, 'days')
          .format('D MMM')} – ${moment().format('D MMM')}`;
      case '30 days':
        return `${moment()
          .subtract(29, 'days')
          .format('D MMM')} – ${moment().format('D MMM')}`;
      default:
        return '';
    }
  };

  if (!analyticsData || loading) {
    return (
      <PageContainer scrollable>
        <div className="flex-1 space-y-4 pt-6">
          <div className="">
            <div className="mb-6">
              <Heading
                title={`Dashboard`}
                description=""
                titleClass="text-2xl"
                descriptionClass="text-sm"
              />
            </div>
          </div>
          <Tabs
            defaultValue="overview"
            className="space-y-4"
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
            </TabsList>
            {/* --------- Tabs,  Date Range, Filter Type --------- */}
            <DashboardDateTab
              activeTab={activeTab}
              dateRange={dateRange}
              setDateRange={setDateRange}
              setTempRange={setTempRange}
              isRangeSelected={isRangeSelected}
              handleDateChange={handleDateChange}
              getFilterDateLabel={getFilterDateLabel}
              filter={filter}
              updateFilter={updateFilter}
              dayViewFilter={dayViewFilter}
              setDayViewFilter={setDayViewFilter}
              filterTypes={filterTypes}
            />
            {/* --------- Skelton Tabs Content --------- */}

            <TabsContent value="overview">
              {activeTab === 'overview' && <OverviewSkeleton />}
            </TabsContent>
            <TabsContent value="analytics">
              {activeTab === 'analytics' && <AnalyticsSkeleton />}
            </TabsContent>
            <TabsContent value="sales">
              {activeTab === 'sales' && <SalesSkeleton />}
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    );
  }
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4 pt-6">
        <div className="">
          <div className="mb-6">
            <Heading
              title={`Dashboard`}
              description=""
              titleClass="text-2xl"
              descriptionClass="text-sm"
            />
          </div>
        </div>
        <Tabs
          defaultValue="overview"
          className="space-y-4"
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          <DashboardDateTab
            activeTab={activeTab}
            dateRange={dateRange}
            setDateRange={setDateRange}
            setTempRange={setTempRange}
            isRangeSelected={isRangeSelected}
            handleDateChange={handleDateChange}
            getFilterDateLabel={getFilterDateLabel}
            filter={filter}
            updateFilter={updateFilter}
            dayViewFilter={dayViewFilter}
            setDayViewFilter={setDayViewFilter}
            filterTypes={filterTypes}
          />

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="grid-cols-1 gap-6 md:grid md:grid-cols-2">
                <div className="col-span-1">
                  <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="col-span-1">
                      <Card
                        variant="secondary"
                        className="flex h-full flex-col"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <IconBadge icon={BarChart} />
                            <span>Total Sales</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-grow items-center justify-center p-4 pt-0">
                          <div className="">
                            <span className="text-2xl">$</span>
                            <span className="text-3xl font-medium">
                              {formatNumberWithCommas(
                                dailySalesData?.sales.total_sales.toFixed(2)
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {/* Wages */}
                    <Card
                      variant="secondary"
                      className="col-span-1 flex flex-col"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                          <IconBadge icon={DollarSign} />
                          <span>Wages</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow p-4 pt-0">
                        <WagesVsSales
                          totalWage={calculateTotalCost}
                          totalSales={dailySalesData?.sales.total_sales.toFixed(
                            2
                          )}
                        />
                        <div className="text-right">
                          <Button
                            variant={'ghost'}
                            onClick={() => setTeamInsightsModalOpen(true)}
                            className="mt-2"
                          >
                            <span className="flex items-center gap-2">
                              <span>View More</span>
                              <ChevronRight size={16} />
                            </span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Online Reservations Received and Upcoming Bookings */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="col-span-1 h-full">
                      <Card
                        variant="secondary"
                        onClick={() => setBookingModalOpen(true)}
                        className="h-full cursor-pointer"
                      >
                        <CardHeader className="pb-1">
                          <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <IconBadge icon={Users} />
                            <span>
                              Online reservations received on{' '}
                              {getSelectedDate()}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <BookingStats
                            receivedBooking={recievedBooking}
                            bookingDifference={bookingDifference}
                            bookingPercentageChange={bookingPercentageChange}
                            totalBookingPartySize={totalBookingPartySize}
                            partySizeDifference={partySizeDifference}
                            percentageChange={percentageChange}
                            comparisonLabel={getComparisonDateRangeLabel()}
                          />
                          <div className="text-right">
                            <Button
                              variant={'ghost'}
                              onClick={() => setBookingModalOpen(true)}
                              className="mt-2"
                            >
                              <span className="flex items-center gap-2">
                                <span>View More</span>
                                <ChevronRight size={16} />
                              </span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="col-span-1">
                      <Card
                        variant="secondary"
                        onClick={() => setUpcomingModalOpen(true)}
                        className="h-full cursor-pointer"
                      >
                        <CardHeader className="pb-1">
                          <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <IconBadge icon={Clock} />
                            <span>Upcoming Bookings Today</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="">
                            <div className="my-4 grid grid-cols-2 items-center gap-4 pl-4">
                              <div className="text-4xl font-medium">
                                {upcomingBooking?.length || 0}
                                <span className="pl-1 text-base">Parties</span>
                              </div>
                              <div className="text-4xl font-medium">
                                {totalUpcomingBookingPartySize}
                                <span className="pl-1 text-base">Covers</span>
                              </div>
                            </div>
                            <UpcomingBookings
                              data={upcomingByFloorAsCategorySales}
                              height={200}
                              width={75}
                            />
                            <div className="text-right">
                              <Button
                                variant={'ghost'}
                                onClick={() => setUpcomingModalOpen(true)}
                                className="mt-2"
                              >
                                <span className="flex items-center gap-2">
                                  <span>View More</span>
                                  <ChevronRight size={16} />
                                </span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 h-full">
                  <Card variant="secondary" className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <IconBadge icon={Package} />
                        <span>Daily Sales Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {dailySalesData ? (
                        <>
                          <SalesOverviewStats
                            salesData={dailySalesData}
                            onBreakdownClick={() => setBreakdownOpen(true)}
                            onOngoingSalesClick={() =>
                              setOngoingSalesModalOpen(true)
                            }
                          />

                          {/* Top Selling Items from Daily Sales */}
                          {dailySalesData?.top_selling_items?.length > 0 && (
                            <div className="mt-6">
                              <h4 className="mb-4 text-sm font-semibold">
                                Top Selling Items Today
                              </h4>
                              <div className="max-h-[200px] space-y-2 overflow-y-auto">
                                {dailySalesData.top_selling_items
                                  .sort((a: any, b: any) => b.qty - a.qty)
                                  .slice(0, 8)
                                  .map((item: any, index: number) => (
                                    <div
                                      key={item.prod_id || item.addon_id}
                                      className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
                                    >
                                      <div>
                                        <span className="text-sm font-medium">
                                          {item.name}
                                        </span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                          Qty: {item.qty}
                                        </span>
                                        {item.price && (
                                          <span className="ml-2 text-xs text-muted-foreground">
                                            @ $
                                            {formatNumberWithCommas(item.price)}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-sm font-semibold">
                                        $
                                        {formatNumberWithCommas(
                                          item.total_sales.toFixed(2)
                                        )}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {dailySalesData?.top_selling_items?.length > 0 && (
                            <div className="mt-6 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setTopSellingItemsModalOpen(true)
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <span>View Selling Items Breakdown</span>
                                  <ChevronRight size={16} />
                                </div>
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          Loading daily sales data...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {/* Section Sales */}
                <Card variant="secondary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <IconBadge icon={Table} />
                      <span>Section Sales</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SectionSalesCard
                      data={dailySalesData?.section_sales || []}
                    />
                  </CardContent>
                </Card>

                {/* Cost of Goods */}
                <Card variant="secondary" className="col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <IconBadge icon={BarChart} />
                      <span>Cost of Goods</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InventoryOverviewStats
                      totalReceived={getFilteredTotal()}
                      stockOnHand={stockOnHand}
                      categoryStockValues={categoryStockValues}
                    />
                  </CardContent>
                </Card>

                {/* Payout Card */}
                {/* If connected stripe account then show payout card */}
                {session?.user?.stripeAccount && (
                  <div className="col-span-1">
                    <PayoutCard />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="analytics">
            <AnalyticsDashboard data={analyticsData} />
          </TabsContent>
          <TabsContent value="sales">
            <SalesDashboard
              dayViewSales={dayViewSales}
              analyticsChartData={analyticsChartData}
              filter={filter}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={isBreakdownOpen} onOpenChange={setBreakdownOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-medium">
              <IconBadge icon={Users} />
              <span>Break down</span>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[270px] overflow-y-auto px-2">
            {salesBreakdown.map(({ label, key }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 border-b py-3"
              >
                <p className="text-xs font-semibold">{label}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs">$</span>
                  <span className="text-sm">
                    {dailySalesData?.sales?.[key]?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            ))}
            {/* Additional breakdown items */}
            <div className="flex items-center justify-between gap-4 border-b py-3">
              <p className="text-xs font-semibold">Paid Sales</p>
              <div className="flex items-center gap-1">
                <span className="text-xs">$</span>
                <span className="text-sm">
                  {dailySalesData?.sales?.paid_sales?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-b py-3">
              <p className="text-xs font-semibold">On Account Sales</p>
              <div className="flex items-center gap-1">
                <span className="text-xs">$</span>
                <span className="text-sm">
                  {dailySalesData?.sales?.on_account_sales?.toFixed(2) ||
                    '0.00'}
                </span>
              </div>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" className="mt-4 w-full">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Online reservations received on ${getSelectedDate()}`}
        description="List of Online reservations."
        className="max-w-[600px]"
      >
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {recievedBooking?.length > 0 ? (
            recievedBooking?.map((booking: any) => {
              const floorName =
                floorsName.find((floor) => floor.id === booking.floor_id)
                  ?.name || 'Unknown';
              return (
                <div key={booking.id} className="rounded-lg bg-secondary p-6">
                  <div className="mb-4 gap-8 border-b pb-4 md:flex">
                    <div className="flex items-center gap-2">
                      <IconBadge icon={CalendarCheck} />
                      <span className="text-lg font-medium">
                        {moment(booking.date).format('ddd, D MMM')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconBadge icon={Clock} />
                      <span className="text-lg font-medium">
                        {moment.utc(booking.start_time * 1000).format('h:mm A')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconBadge icon={Users} />
                      <span className="text-lg font-medium">
                        {booking.party_size} Guest
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong>Floor:</strong> {floorName}
                    </p>
                    <p>
                      <strong>Name:</strong> {booking.guest.first_name}{' '}
                      {booking.guest.last_name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {booking.guest.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {booking.guest.email}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No Online reservations received.</p>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={upcomingModalOpen}
        onClose={() => setUpcomingModalOpen(false)}
        title="Upcoming Bookings Today"
        description="List of upcoming bookings today."
        className="max-w-[600px]"
      >
        <div className="max-h-[60vh] space-y-6 overflow-y-auto">
          {upcomingBooking.length > 0 ? (
            upcomingBooking
              .sort((a: any, b: any) => a.start_time - b.start_time)
              .map((booking) => {
                const floorName =
                  floorsName.find((floor) => floor.id === booking.floor_id)
                    ?.name || 'Unknown';
                return (
                  <div key={booking.id} className="rounded-lg bg-secondary p-6">
                    <div className="mb-4 gap-8 border-b pb-4 md:flex">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-background  text-secondary-foreground">
                          <IconBadge icon={Clock} />
                        </div>
                        <span className="text-lg font-medium">
                          {moment
                            .utc(booking.start_time * 1000)
                            .format('h:mm A')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconBadge icon={Users} />
                        <span className="text-lg font-medium">
                          {booking.party_size} Guest
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-background  text-secondary-foreground">
                          <IconBadge icon={Table} />
                        </div>
                        <span className="text-lg font-medium">{floorName}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <strong>Name:</strong> {booking.guest.first_name}{' '}
                        {booking.guest.last_name}
                      </p>
                      <p>
                        <strong>Phone:</strong> {booking.guest.phone}
                      </p>
                      <p>
                        <strong>Email:</strong> {booking.guest.email}
                      </p>
                    </div>
                  </div>
                );
              })
          ) : (
            <p className="text-gray-500">No Upcoming Bookings</p>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={ongoingSalesModalOpen}
        onClose={() => setOngoingSalesModalOpen(false)}
        title="Ongoing Sales"
        description="List of ongoing sales."
        className="max-w-[600px]"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="flex border-b bg-muted px-4 py-2 text-xs font-semibold text-gray-300">
            <div className="flex-1">Customer</div>
            <div className="w-16 text-center">Guests</div>
            <div className="w-20 text-center">Table</div>
            <div className="w-20 text-right">Spent</div>
          </div>
          {latestData && latestData.length > 0 ? (
            latestData.map((booking: any) => {
              const spent =
                booking.products?.reduce((sum: number, product: any) => {
                  const basePrice = product.price * product.quantity;
                  const addonsPrice = (product.addOns || []).reduce(
                    (addonSum: number, addon: any) =>
                      addonSum + addon.price * addon.quantity,
                    0
                  );
                  return sum + basePrice + addonsPrice;
                }, 0) || 0;
              return (
                <div
                  key={booking.id}
                  className="flex items-center border-b bg-secondary px-4 py-3 text-sm transition hover:bg-accent"
                >
                  <div className="flex-1">
                    {booking.guest?.first_name} {booking.guest?.last_name}
                  </div>
                  <div className="w-16 text-center">
                    {booking.guest_count || 2}
                  </div>
                  <div className="w-20 text-center">
                    {getTableNameById((booking as any).table_id)}
                  </div>
                  <div className="w-20 text-right">${spent.toFixed(2)}</div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-gray-500">
              No ongoing sales.
            </div>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={teamInsightsModalOpen}
        onClose={() => setTeamInsightsModalOpen(false)}
        title="Wages"
        description="Team performance statistics."
        className="max-w-[500px]"
      >
        <div className="p-4">
          <TeamInsightsStats
            totalWageCost={calculateTotalCost}
            totalHours={totalPayHours}
            totalEmployees={totalEmployee}
            averageShiftTime={avarageShiftTime}
          />
        </div>
      </Modal>
      <Modal
        isOpen={topSellingItemsModalOpen}
        onClose={() => setTopSellingItemsModalOpen(false)}
        title="Top Selling Items Today"
        description="Today's best performing items."
        className="max-w-[800px]"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {analyticsData?.item_sold?.items &&
          analyticsData.item_sold.items.length > 0 ? (
            <ItemSalesGrid data={analyticsData.item_sold} />
          ) : (
            <div className="py-8 text-center text-gray-500">
              No items sold today.
            </div>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
}

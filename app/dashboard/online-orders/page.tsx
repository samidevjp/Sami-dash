'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Heading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Clock, Download } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApi } from '@/hooks/useApi';
import { toast } from '@/components/ui/use-toast';
import { playNotificationSound } from '@/lib/notification';
import PageContainer from '@/components/layout/page-container';
// import { PDFDownloadLink } from '@react-pdf/renderer';
// import OrderPdfTemplate from '@/components/pdf/OrderPdfTemplate';
import { Checkbox } from '@/components/ui/checkbox';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';

type Order = {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    notes: string;
    addOns?: Array<{
      name: string;
      price: number;
      description?: string;
    }>;
  }>;
  status:
    | 'new'
    | 'pending'
    | 'accepted'
    | 'preparing'
    | 'ready'
    // | 'delivered'
    | 'refused';
  total: number;
  created_at: string;
  pickup_date: string;
  notes: string;
};

export default function OnlineOrders() {
  const { getOnlineStoreSettings, getOnlineOrders, updateOnlineOrder } =
    useApi();
  const [settings, setSettings] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  // const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isExportMode, setIsExportMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [dateFilterType, setDateFilterType] = useState<
    'order_date' | 'pickup_date'
  >('order_date');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getOnlineStoreSettings();
      if (
        (Array.isArray(settings) && settings.length === 0) ||
        settings?.widget_token === null
      ) {
        setSettings(null);
        setIsLoading(false);
        return;
      }
      setSettings(settings);
    };
    fetchSettings();
  }, []);

  const fetchOrders = async (fetchAll = false) => {
    try {
      if (!settings) return;
      const widget_token = settings.widget_token;
      // Only send date parameters if not in search mode
      const params = !fetchAll
        ? {
            date: selectedDate,
            filter_type: dateFilterType
          }
        : {};

      const ordersData = await getOnlineOrders(widget_token, params);

      const formattedOrders = ordersData.map((order: any) => ({
        id: order.order_id,
        customer: {
          name: order.customer_name,
          phone: order.customer_phone,
          email: order.customer_email,
          address: order.address
        },
        items: order.order_items.map((item: any) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          notes: item.notes || '',
          addOns: item.modifiers.map((mod: any) => ({
            name: mod.name,
            price: mod.price,
            description: mod?.description
          }))
        })),
        status: order.status_label.toLowerCase(),
        total: parseFloat(order.total_amount),
        created_at: order.order_date,
        pickup_date: order.pickup_date || '',
        notes: order.notes || ''
      }));

      setOrders((prevOrders) => {
        const newOrders = formattedOrders.filter(
          (newOrder: any) =>
            !prevOrders.some((oldOrder) => oldOrder.id === newOrder.id)
        );

        if (newOrders.length > 0) {
          // Auto accept if enabled
          if (settings.auto_accept_orders === 1) {
            newOrders.forEach(async (order: any) => {
              if (order.status === 'new') {
                try {
                  await updateOnlineOrder(settings.widget_token, order.id, 1);

                  setOrders((currentOrders) =>
                    currentOrders.map((o) =>
                      o.id === order.id ? { ...o, status: 'accepted' } : o
                    )
                  );

                  playNotificationSound();
                  toast({
                    title: 'New Order(s)',
                    description: `${newOrders.length} new order${
                      newOrders.length > 1 ? 's' : ''
                    } received${
                      settings.auto_accept_orders === 1
                        ? ' and auto-accepted'
                        : ''
                    }`,
                    variant: 'success'
                  });
                } catch (error) {
                  console.error('Error auto-accepting order:', error);
                }
              }
            });
          }
        }

        setIsLoading(false);
        if (!fetchAll) {
          // Apply date filtering only when not in search mode
          const filteredByDate = formattedOrders.filter((order: any) => {
            const orderDate =
              dateFilterType === 'order_date'
                ? new Date(order.created_at)
                : new Date(order.pickup_date);
            const searchDate = new Date(selectedDate);

            return (
              orderDate.getFullYear() === searchDate.getFullYear() &&
              orderDate.getMonth() === searchDate.getMonth() &&
              orderDate.getDate() === searchDate.getDate()
            );
          });
          return filteredByDate;
        }
        return formattedOrders;
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (settings) {
      fetchOrders(isSearchMode);
    }
  }, [selectedDate, settings, isSearchMode]);

  useEffect(() => {
    if (!isSearchMode) {
      // Only run polling when not in search mode
      fetchOrders();
      const interval = setInterval(() => fetchOrders(), 7000);
      return () => clearInterval(interval);
    }
  }, [selectedDate, settings, isSearchMode]);

  const filteredOrders = orders.filter((order) => {
    const searchTermLower = searchTerm.toLowerCase();

    // Check order ID and customer info
    const matchesSearch =
      order.id.toLowerCase().includes(searchTermLower) ||
      (order.customer &&
        order.customer.name &&
        order.customer.name.toLowerCase().includes(searchTermLower)) ||
      // Add search in products
      order.items.some(
        (item) =>
          item.name.toLowerCase().includes(searchTermLower) ||
          (item.notes && item.notes.toLowerCase().includes(searchTermLower)) ||
          // Search in addOns as well
          (item.addOns &&
            item.addOns.some(
              (addon) =>
                addon.name.toLowerCase().includes(searchTermLower) ||
                (addon.description &&
                  addon.description.toLowerCase().includes(searchTermLower))
            ))
      );

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-200 text-yellow-900',
      accepted: 'bg-blue-200 text-blue-900',
      preparing: 'bg-primary-200 text-primary-900',
      ready: 'bg-green-200 text-green-900',
      delivering: 'bg-orange-200 text-orange-900',
      delivered: 'bg-gray-200 text-gray-900',
      refused: 'bg-red-200 text-red-900'
    };
    // @ts-ignore
    return colors[status];
  };

  const handleOrderStatus = async (orderId: string, newStatus: number) => {
    try {
      const settings = await getOnlineStoreSettings();
      await updateOnlineOrder(settings.widget_token, orderId, newStatus);

      // Update local
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus === 1 ? 'accepted' : 'refused' }
            : order
        )
      );

      toast({
        title: 'Success',
        description: `Order ${
          newStatus === 1 ? 'accepted' : 'refused'
        } successfully`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to update order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  const handleAccept = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    handleOrderStatus(orderId, 1); // 1 = ACCEPTED
  };

  const handleDecline = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    handleOrderStatus(orderId, 6); // 6 = REFUSED
  };

  const statusMap = {
    new: 0,
    accepted: 1,
    preparing: 2,
    ready: 3,
    delivering: 4,
    delivered: 5,
    refused: 6
  };

  const handleTimelineClick = async (newStatus: string) => {
    if (!selectedOrder) return;

    const currentStatusNum =
      statusMap[selectedOrder.status as keyof typeof statusMap];
    const newStatusNum = statusMap[newStatus as keyof typeof statusMap];

    // Only allow moving forward in the timeline
    if (newStatusNum <= currentStatusNum) return;

    try {
      const settings = await getOnlineStoreSettings();
      await updateOnlineOrder(
        settings.widget_token,
        selectedOrder.id,
        newStatusNum
      );

      // Update local state
      setOrders(
        // @ts-ignore
        orders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );
      // @ts-ignore
      setSelectedOrder({ ...selectedOrder, status: newStatus });

      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus}`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to update order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  const generateOrderPdf = async (order: Order, pdfDoc: PDFDocument) => {
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const PAGE_HEIGHT = 595; // A5 height
    const PAGE_WIDTH = 420; // A5 width
    const MARGIN_TOP = 30;
    const MARGIN_BOTTOM = 30;
    const CONTENT_AREA = PAGE_HEIGHT - (MARGIN_TOP + MARGIN_BOTTOM);

    // Create first page with header
    const firstPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let currentPage = firstPage;

    // Draw header on first page only
    firstPage.drawText('VANILLA', {
      x: 30,
      y: PAGE_HEIGHT - 55,
      font: helveticaBold,
      size: 16
    });

    // Customer info
    firstPage.drawText(order.customer.name, {
      x: 30,
      y: PAGE_HEIGHT - 75,
      font: helveticaFont,
      size: 12
    });

    firstPage.drawText(
      order.customer.phone ? order.customer.phone : order.customer.email,
      {
        x: 30,
        y: PAGE_HEIGHT - 91,
        font: helveticaFont,
        size: 12
      }
    );

    // Invoice Info
    firstPage.drawText('INVOICE #', {
      x: 280,
      y: PAGE_HEIGHT - 55,
      font: helveticaFont,
      size: 12
    });

    firstPage.drawText(order.id, {
      x: 280,
      y: PAGE_HEIGHT - 75,
      font: helveticaFont,
      size: 12,
      color: rgb(1, 0, 0)
    });

    firstPage.drawText('Pick up Date:', {
      x: 280,
      y: PAGE_HEIGHT - 95,
      font: helveticaFont,
      size: 12
    });

    const pickupDate = new Date(order.pickup_date);
    const dayOfWeek = pickupDate.toLocaleDateString('en-US', {
      weekday: 'long'
    });
    firstPage.drawText(dayOfWeek, {
      x: 280,
      y: PAGE_HEIGHT - 115,
      font: helveticaFont,
      size: 12,
      color: rgb(1, 0, 0)
    });

    const formattedDate = pickupDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    firstPage.drawText(formattedDate, {
      x: 280,
      y: PAGE_HEIGHT - 135,
      font: helveticaFont,
      size: 12,
      color: rgb(1, 0, 0)
    });

    const formattedTime = pickupDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    firstPage.drawText(formattedTime, {
      x: 280,
      y: PAGE_HEIGHT - 155,
      font: helveticaFont,
      size: 12,
      color: rgb(1, 0, 0)
    });

    // Draw line and column headers on first page
    firstPage.drawLine({
      start: { x: 30, y: PAGE_HEIGHT - 175 },
      end: { x: 390, y: PAGE_HEIGHT - 175 },
      thickness: 1
    });

    firstPage.drawText('QTY', {
      x: 30,
      y: PAGE_HEIGHT - 195,
      font: helveticaBold,
      size: 12
    });

    firstPage.drawText('DESCRIPTION', {
      x: 80,
      y: PAGE_HEIGHT - 195,
      font: helveticaBold,
      size: 12
    });

    let yPosition = PAGE_HEIGHT - 215;

    // Process items
    for (const item of order.items) {
      const itemHeight = 20;
      const addonTotalHeight = (item.addOns?.length || 0) * 15;
      const descriptionTotalHeight = item.addOns ? 15 : 0;
      const spacingHeight = 10;
      const totalItemHeight =
        itemHeight + addonTotalHeight + descriptionTotalHeight + spacingHeight;

      // Check if we need a new page
      if (yPosition - totalItemHeight < MARGIN_BOTTOM) {
        currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        yPosition = PAGE_HEIGHT - MARGIN_TOP;
      }

      // Draw item
      currentPage.drawText(item.quantity.toString(), {
        x: 30,
        y: yPosition,
        font: helveticaFont,
        size: 12
      });

      currentPage.drawText(item.name, {
        x: 80,
        y: yPosition,
        font: helveticaFont,
        size: 12
      });

      yPosition -= itemHeight;

      // Draw add-ons
      if (item.addOns?.length) {
        for (const addon of item.addOns) {
          // Check if we need a new page for add-ons
          if (yPosition - 15 < MARGIN_BOTTOM) {
            currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
            yPosition = PAGE_HEIGHT - MARGIN_TOP;
          }

          currentPage.drawText(`+ ${addon.name} ($${addon.price.toFixed(2)})`, {
            x: 80,
            y: yPosition,
            font: helveticaFont,
            size: 10,
            color: rgb(0.5, 0.5, 0.5)
          });
          yPosition -= 15;

          if (addon.description) {
            // Check if we need a new page for description
            if (yPosition - 15 < MARGIN_BOTTOM) {
              currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
              yPosition = PAGE_HEIGHT - MARGIN_TOP;
            }

            currentPage.drawText(`Description: ${addon.description}`, {
              x: 80,
              y: yPosition,
              font: helveticaFont,
              size: 10,
              color: rgb(0.6, 0.6, 0.6)
            });
            yPosition -= 15;
          }
        }
      }

      // Add spacing between items
      yPosition -= spacingHeight;

      // Check for allergy warning after item and its add-ons
      if (order.notes?.toLowerCase().includes('allerg')) {
        // Check if we need a new page for allergy warning
        if (yPosition - 40 < MARGIN_BOTTOM) {
          currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          yPosition = PAGE_HEIGHT - MARGIN_TOP;
        }

        currentPage.drawRectangle({
          x: 30,
          y: yPosition - 5,
          width: 360,
          height: 25,
          color: rgb(1, 0, 0)
        });

        currentPage.drawText('  ' + order.notes.toUpperCase(), {
          x: 40,
          y: yPosition,
          font: helveticaBold,
          size: 12,
          color: rgb(1, 1, 1)
        });
        yPosition -= 40;
      }
    }

    // Add page numbers
    const pageCount = pdfDoc.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      page.drawText(`Page ${i + 1} of ${pageCount}`, {
        x: 30,
        y: 20,
        font: helveticaFont,
        size: 10,
        color: rgb(0.5, 0.5, 0.5)
      });
    }

    // Add paid status to last page
    const lastPage = pdfDoc.getPage(pageCount - 1);
    lastPage.drawText('PAID IN FULL', {
      x: 320,
      y: 50,
      font: helveticaBold,
      size: 12,
      color: rgb(1, 0, 0)
    });
  };

  const handleSingleOrderPdf = async (orderId: string) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      const pdfDoc = await PDFDocument.create();
      await generateOrderPdf(order, pdfDoc);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export order:', error);
      toast({
        title: 'Error',
        description: 'Failed to export order',
        variant: 'destructive'
      });
    }
  };

  const handleAllOrdersPdf = async () => {
    try {
      const pdfDoc = await PDFDocument.create();

      for (const order of orders) {
        await generateOrderPdf(order, pdfDoc);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'all-orders.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export all orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to export all orders',
        variant: 'destructive'
      });
    }
  };

  const handleSelectedOrdersPdf = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const selectedOrders = orders.filter((order) =>
        selectedOrderIds.includes(order.id)
      );

      for (const order of selectedOrders) {
        await generateOrderPdf(order, pdfDoc);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'selected-orders.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export selected orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to export selected orders',
        variant: 'destructive'
      });
    }
  };

  const handleExportOrders = async (orderIds: string[]) => {
    if (orderIds.length === 1) {
      await handleSingleOrderPdf(orderIds[0]);
      return;
    }

    try {
      const zip = new JSZip();

      await Promise.all(
        orderIds.map(async (orderId) => {
          const order = orders.find((o) => o.id === orderId);
          if (!order) return;

          const pdfDoc = await PDFDocument.create();
          await generateOrderPdf(order, pdfDoc);

          const pdfBytes = await pdfDoc.save();
          zip.file(`order-${orderId}.pdf`, pdfBytes);
        })
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'orders.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExportMode(false);
      setSelectedOrderIds([]);
    } catch (error) {
      console.error('Failed to export orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to export orders',
        variant: 'destructive'
      });
    }
  };

  return (
    <PageContainer scrollable>
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="mb-4">
            <Heading
              title={`Online Orders`}
              description=" Manage and track your online orders"
              titleClass="text-xl"
              descriptionClass="text-sm"
            />
          </div>
        </div>
        {settings ? (
          <>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              {/* Search and Filters Group */}
              <div className="flex flex-1 items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[130px]">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="font-medium">Date Type</div>
                        <div className="flex overflow-hidden rounded-md">
                          <Button
                            variant={
                              dateFilterType === 'order_date'
                                ? 'default'
                                : 'outline'
                            }
                            className="flex-1 rounded-none"
                            onClick={() => setDateFilterType('order_date')}
                          >
                            Order Date
                          </Button>
                          <Button
                            variant={
                              dateFilterType === 'pickup_date'
                                ? 'default'
                                : 'outline'
                            }
                            className="flex-1 rounded-none"
                            onClick={() => setDateFilterType('pickup_date')}
                          >
                            Pickup Date
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium">Select Date</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={new Date(selectedDate)}
                              onSelect={(date) => {
                                if (date) {
                                  const year = date.getFullYear();
                                  const month = String(
                                    date.getMonth() + 1
                                  ).padStart(2, '0');
                                  const day = String(date.getDate()).padStart(
                                    2,
                                    '0'
                                  );
                                  setSelectedDate(`${year}-${month}-${day}`);
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSearchMode(true);
                    setIsLoading(true);
                    fetchOrders(true);
                  }}
                >
                  Search
                </Button>

                {isSearchMode && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSearchMode(false);
                      setIsLoading(true);
                      fetchOrders(false);
                    }}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Today
                  </Button>
                )}
              </div>

              {/* Export Group */}
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-4">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setIsExportMode(!isExportMode);
                          setSelectedOrderIds([]);
                        }}
                      >
                        {isExportMode ? 'Cancel Selection' : 'Select Orders'}
                      </Button>
                      {isExportMode && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleSelectedOrdersPdf}
                            disabled={selectedOrderIds.length === 0}
                          >
                            Export Selected ({selectedOrderIds.length})
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleAllOrdersPdf}
                      >
                        Export All as PDF
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>
                  All Orders
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="preparing"
                  onClick={() => setStatusFilter('preparing')}
                >
                  Preparing
                </TabsTrigger>
                <TabsTrigger
                  value="ready"
                  onClick={() => setStatusFilter('ready')}
                >
                  Ready
                </TabsTrigger>
                {/* <TabsTrigger
                  value="delivered"
                  onClick={() => setStatusFilter('delivered')}
                >
                  Delivered
                </TabsTrigger> */}
              </TabsList>
            </Tabs>

            <div className="rounded-md border bg-background shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isExportMode && <TableHead>Select</TableHead>}
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Ordered At</TableHead>
                    <TableHead>Pickup Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.some((order) => order.status === 'new') && (
                    <>
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              New Orders
                            </span>
                            <Badge variant="secondary">
                              {
                                filteredOrders.filter(
                                  (order) => order.status === 'new'
                                ).length
                              }
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                      {filteredOrders
                        .filter((order) => order.status === 'new')
                        .map((order) => (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer bg-muted/20 hover:bg-muted/30"
                          >
                            {isExportMode && (
                              <TableCell className="checkbox-container">
                                <Checkbox
                                  checked={selectedOrderIds.includes(order.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedOrderIds([
                                        ...selectedOrderIds,
                                        order.id
                                      ]);
                                    } else {
                                      setSelectedOrderIds(
                                        selectedOrderIds.filter(
                                          (id) => id !== order.id
                                        )
                                      );
                                    }
                                  }}
                                />
                              </TableCell>
                            )}
                            <TableCell className="font-medium">
                              {order.id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {order.customer.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {order.customer.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {order.items.map((item, i) => (
                                  <div key={i}>
                                    {item.quantity}x {item.name}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatDate(new Date(order.created_at))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {order.pickup_date
                                  ? formatDate(new Date(order.pickup_date))
                                  : '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={(e) => handleAccept(e, order.id)}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleDecline(e, order.id)}
                                >
                                  Decline
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${order.total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  )}

                  {/* Other Orders Section */}
                  {filteredOrders.some((order) => order.status !== 'new') && (
                    <>
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              All Orders
                            </span>
                            <Badge variant="secondary">
                              {
                                filteredOrders.filter(
                                  (order) => order.status !== 'new'
                                ).length
                              }
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                      {filteredOrders
                        .filter((order) => order.status !== 'new')
                        .map((order) => (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer"
                            onClick={(e) => {
                              // Prevent opening sidebar if clicking checkbox
                              if (
                                (e.target as HTMLElement).closest(
                                  '.checkbox-container'
                                )
                              ) {
                                return;
                              }
                              setSelectedOrder(order);
                            }}
                          >
                            {isExportMode && (
                              <TableCell>
                                <Checkbox
                                  checked={selectedOrderIds.includes(order.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedOrderIds([
                                        ...selectedOrderIds,
                                        order.id
                                      ]);
                                    } else {
                                      setSelectedOrderIds(
                                        selectedOrderIds.filter(
                                          (id) => id !== order.id
                                        )
                                      );
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                            )}

                            <TableCell className="font-medium">
                              {order.id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {order.customer.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {order.customer.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {order.items.map((item, i) => (
                                  <div key={i}>
                                    {item.quantity}x {item.name}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatDate(new Date(order.created_at))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {order.pickup_date
                                  ? formatDate(new Date(order.pickup_date))
                                  : '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${order.total.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  handleExportOrders([order.id]);
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>

            <Sheet
              open={!!selectedOrder}
              onOpenChange={() => setSelectedOrder(null)}
            >
              <SheetContent className="w-[400px] sm:w-[540px]">
                {selectedOrder && (
                  <ScrollArea className="h-full px-1">
                    <div className="space-y-6 pb-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                          Order {selectedOrder.id}
                        </h2>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status.charAt(0).toUpperCase() +
                            selectedOrder.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="space-y-2 bg-secondary p-4">
                        <h3 className="mb-2 font-semibold">Customer Details</h3>
                        <div className="px-4 text-sm">
                          <p>Name: {selectedOrder.customer.name}</p>
                          <p>Phone: {selectedOrder.customer.phone}</p>
                        </div>
                      </div>

                      <div className="space-y-4 bg-secondary p-4">
                        <h3 className="font-semibold">Order Details</h3>
                        <div className="px-4 text-sm">
                          <p>
                            Pickup Date:{' '}
                            {formatDate(new Date(selectedOrder.pickup_date))}
                          </p>
                          {selectedOrder.notes && (
                            <div className="mt-2">
                              <p className="font-medium">Order Notes:</p>
                              <p className="text-muted-foreground">
                                {selectedOrder.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="mb-8 space-y-4 px-2">
                          {selectedOrder.items.map((item, index) => (
                            <div
                              key={index}
                              className="rounded-lg border bg-background p-2 text-sm"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium">
                                  {item.quantity}x {item.name}
                                </span>
                                <span>
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              {item.notes && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  <p>Notes: {item.notes}</p>
                                </div>
                              )}
                              {item.addOns?.map((addon, idx) => {
                                // console.log('addon', addon)
                                return (
                                  <div
                                    key={idx}
                                    className="mt-2 flex flex-col text-sm text-muted-foreground"
                                  >
                                    <div className="flex justify-between">
                                      <span>+ {addon.name}</span>
                                      <span>${addon.price.toFixed(2)}</span>
                                    </div>
                                    {addon.description && (
                                      <span className="ml-4 text-xs italic">
                                        Description: {addon.description}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                          <span>Total</span>
                          <span>${selectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {selectedOrder.status === 'new' ? (
                        <div className="space-y-4">
                          <Button className="w-full" variant="default">
                            Accept Order
                          </Button>
                          <Button className="w-full" variant="destructive">
                            Decline Order
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="">
                            <h3 className="font-semibold">Order Timeline</h3>
                            <p className="text-xs text-muted-foreground">
                              Click to change the status.
                            </p>
                          </div>
                          <div className="pb-1">
                            {[
                              'new',
                              'accepted',
                              'preparing',
                              'ready'
                              // 'delivering',
                              // 'delivered'
                            ].map((step, index) => {
                              const isCompleted =
                                [
                                  'new',
                                  'accepted',
                                  'preparing',
                                  'ready'
                                  // 'delivering',
                                  // 'delivered'
                                ].indexOf(selectedOrder.status) >= index;
                              const isCurrent = selectedOrder.status === step;
                              const canSelect =
                                index >
                                [
                                  'new',
                                  'accepted',
                                  'preparing',
                                  'ready'
                                  // 'delivering',
                                  // 'delivered'
                                ].indexOf(selectedOrder.status);

                              return (
                                <div
                                  key={step}
                                  className={`mb-4 flex items-start gap-3 ${
                                    canSelect
                                      ? 'cursor-pointer hover:bg-muted/50'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    canSelect && handleTimelineClick(step)
                                  }
                                >
                                  <div
                                    className={`mt-1.5 h-2 w-2 rounded-full ${
                                      isCompleted
                                        ? 'bg-primary'
                                        : 'bg-muted-foreground/30'
                                    }`}
                                  />
                                  <div className="flex-1">
                                    <p
                                      className={`font-medium ${
                                        isCurrent ? 'text-primary' : ''
                                      }`}
                                    >
                                      {step.charAt(0).toUpperCase() +
                                        step.slice(1)}
                                    </p>
                                    {/* {isCurrent && (
                                      <p className="text-sm text-muted-foreground">
                                        {formatDate(
                                          new Date(selectedOrder.created_at)
                                        )}
                                      </p>
                                    )} */}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="px-4">
                            <Button className="mb-2 w-full" variant="outline">
                              Print Order
                            </Button>
                            <Button
                              className="mt-2 w-full"
                              variant="danger"
                              onClick={() => {
                                if (!selectedOrder) return;
                                handleOrderStatus(selectedOrder.id, 6);
                                setSelectedOrder(null);
                              }}
                            >
                              Cancel Order
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <div className="flex min-h-[80vh] flex-col items-center justify-center rounded-md border bg-accent p-4">
            <p className="mb-4 text-center">
              Your online store settings have not been configured yet.
            </p>

            <Button
              variant="submit"
              onClick={() => {
                router.push('/dashboard/online-store');
              }}
            >
              Go to Settings
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

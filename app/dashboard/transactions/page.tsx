'use client';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { formatDateShort } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutGrid, TableOfContents } from 'lucide-react';
import SortTransactions from './SortTransactions';
import TransactionModal from './TransactionModal';
import TransactionThumb from './TransactionThumb';
import { TableContext } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { usePrinterSettings } from '@/hooks/usePrinterSettings';
// import { useToast } from '@/components/ui/use-toast';
import { useCurrentShiftId } from '@/hooks/getCurrentShiftId';
import { useShiftsStore } from '@/hooks/useShiftsStore';
import moment from 'moment';
import { Heading } from '@/components/ui/heading';
import {
  TableForFixedHeader,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from '@/components/ui/table';
interface Product {
  id: number;
  title: string;
  quantity: number;
}
interface Order {
  id: number;
  order_date: string;
  products: Product[];
  table_name?: string;
  guest: any;
}
interface Transaction {
  order_id: number;
  sub_total: number;
  orders: Order[];
  transaction_date: string;
}
interface BusinessProfile {
  business_name: string;
  address: string;
}
const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { shifts: allShifts } = useShiftsStore();
  const currentShift: number = useCurrentShiftId(allShifts);
  const [error, setError] = useState<string | null>(null);
  const { getOrders, getBusinessProfile } = useApi();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { floors } = useContext(TableContext);
  const [allTables, setAllTables] = useState<any>();
  const [keyword, setKeyword] = useState<string>('');
  const [paymentType, setPaymentType] = useState<number>(0);
  const [date, setDate] = useState<string>(formatDateShort(new Date()));
  const [orderType, setOrderType] = useState<number>(0);
  const [shiftId, setShiftId] = useState<number>(currentShift);
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile | null>(null);
  const asyncBusinessProfile = async () => {
    try {
      const response = await getBusinessProfile();
      setBusinessProfile(response.data.business_profile);
    } catch (error) {
      console.log('error', error);
    }
  };
  useEffect(() => {
    asyncBusinessProfile();
    fetchTransactions();
  }, []);
  useEffect(() => {
    setAllTables(floors.map((floor: any) => floor.tables).flat());
  }, [floors]);
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    const transactionParams = {
      keyword,
      payment_type: paymentType,
      date,
      order_type: orderType,
      shift_id: shiftId
    };
    try {
      const response = await getOrders(transactionParams);
      let sortedReports = response?.data?.reports?.sort(
        (a: Transaction, b: Transaction) => {
          const dateA = new Date(a.orders[0].order_date);
          const dateB = new Date(b.orders[0].order_date);
          return dateB.getTime() - dateA.getTime();
        }
      );
      sortedReports = sortedReports.map((report: any) => {
        const updatedOrders = report.orders.map((order: any) => {
          const matchingTable = allTables?.find(
            (table: any) => table.id === order.table_id
          );
          return {
            ...order,
            table_name: matchingTable ? matchingTable.name : null
          };
        });
        return {
          ...report,
          orders: updatedOrders
        };
      });
      setTransactions(() => sortedReports);
    } catch (err) {
      console.error('Fetch Transactions Error:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [keyword, paymentType, date, orderType, shiftId]);
  const togglePaymentType = () => {
    setPaymentType((prevType) => (prevType === 2 ? 0 : prevType + 1));
  };
  const toggleOrderType = () => {
    setOrderType((prevType) => (prevType === 2 ? 0 : prevType + 1));
  };
  const toggleShiftId = () => {
    console.log(allShifts, 'allShifts');
    setShiftId((prevId) => {
      const currentIndex = allShifts.findIndex((shift) => shift.id === prevId);
      const nextIndex = (currentIndex + 1) % allShifts.length;
      return allShifts[nextIndex]?.id || allShifts[0].id;
    });
  };
  const changeDate = (days: number) => {
    const newDate = new Date(
      new Date(date).setDate(new Date(date).getDate() + days)
    );
    setDate(formatDateShort(newDate));
  };
  const openModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const printContentRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const printContents = printContentRef.current?.innerHTML ?? '';
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };
  // const { printReceipt } = usePrinterSettings();
  // const { toast } = useToast();

  // const handlePrintReceipt = async (transaction: Transaction) => {
  //   const serverIP = localStorage.getItem('serverIP');
  //   const printerConfigs = JSON.parse(
  //     localStorage.getItem('printerSettings') || '[]'
  //   );
  //   const receiptPrinter = printerConfigs.find(
  //     (config: any) =>
  //       config.printerType === 'bill' || config.printerType === 'orderAndBill'
  //   );

  //   if (!serverIP || !receiptPrinter) {
  //     toast({
  //       title: 'Error',
  //       description: 'Server IP or receipt printer not configured',
  //       variant: 'destructive'
  //     });
  //     return;
  //   }

  //   try {
  //     const orderDetails = {
  //       orderId: transaction.order_id,
  //       items: transaction.orders.flatMap((order) => order.products),
  //       total: transaction.sub_total,
  //       customer: { name: 'Customer' },
  //       employeeName: 'Employee'
  //     };

  //     const printResult = await printReceipt(
  //       serverIP,
  //       receiptPrinter.printerIp,
  //       orderDetails
  //     );

  //     if (printResult) {
  //       toast({
  //         title: 'Success',
  //         description: 'Receipt printed successfully'
  //       });
  //     } else {
  //       toast({
  //         title: 'Warning',
  //         description: 'Receipt printing may have failed',
  //         variant: 'destructive'
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error printing receipt:', error);
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to print receipt',
  //       variant: 'destructive'
  //     });
  //   }
  // };
  // useEffect(() => {
  //   if (allShifts.length > 0 && !shiftId) {
  //     const current = useCurrentShiftId(allShifts);
  //     setShiftId(current);
  //   }
  // }, [allShifts]);
  return (
    <div className="h-full p-5">
      <div className="mb-5">
        <div className="mb-4">
          <Heading
            title={`Transactions`}
            description="Manage transactions here."
            titleClass="text-xl"
            descriptionClass="text-sm"
          />
        </div>
        {/* --------------------- Header ------------------- */}
        <SortTransactions
          date={date}
          allShifts={allShifts}
          shiftId={shiftId}
          paymentType={paymentType}
          orderType={orderType}
          keyword={keyword}
          setKeyword={setKeyword}
          togglePaymentType={togglePaymentType}
          toggleOrderType={toggleOrderType}
          toggleShiftId={toggleShiftId}
          changeDate={changeDate}
        />
      </div>
      <Card className="relative h-[70vh] bg-secondary p-8 pt-12">
        {/* Switch View */}
        <Button
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border bg-tertiary p-0"
          variant="outline"
          onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
        >
          {viewMode === 'list' ? (
            <LayoutGrid width={14} height={14} />
          ) : (
            <TableOfContents width={14} height={14} />
          )}
        </Button>
        {/* ---------------------- Main --------------------------- */}
        <ScrollArea className="h-full">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="spinner-border inline-block h-8 w-8 animate-spin rounded-full border-4" />
            </div>
          ) : transactions?.length === 0 ? (
            <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-lg">
                No transactions found for the applied filters.
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <>
                  <TableForFixedHeader className="md:table-fixed">
                    <TableHeader className="sticky top-0 bg-tertiary">
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Table</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Amount</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions?.map(
                        (transaction: Transaction, idx: number) => (
                          <TableRow
                            key={`${transaction.order_id}-${idx}`}
                            className="cursor-pointer border-b hover:bg-hoverTable"
                            onClick={() => openModal(transaction)}
                          >
                            <TableCell>{transaction.order_id}</TableCell>
                            <TableCell>
                              {transaction.orders[0]?.guest?.first_name}{' '}
                              {transaction.orders[0]?.guest?.last_name}
                            </TableCell>
                            <TableCell>
                              {transaction.orders[0]?.table_name || '-'}
                            </TableCell>
                            <TableCell>
                              <p>
                                {moment(transaction.transaction_date).format(
                                  'hh:mm A'
                                )}
                              </p>
                            </TableCell>
                            <TableCell>
                              $
                              {transaction.sub_total.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </TableForFixedHeader>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 pb-36 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {transactions?.map(
                    (transaction: Transaction, idx: number) => (
                      <div
                        key={`${transaction.order_id}-${idx}`}
                        className=""
                        onClick={() => openModal(transaction)}
                      >
                        <TransactionThumb
                          transaction={transaction}
                          businessProfile={businessProfile}
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </Card>
      {isModalOpen && selectedTransaction && (
        <TransactionModal
          isModalOpen={isModalOpen}
          selectedTransaction={selectedTransaction}
          businessProfile={businessProfile}
          handlePrint={handlePrint}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};
export default Transactions;

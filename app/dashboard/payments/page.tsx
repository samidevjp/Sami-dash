'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import PageContainer from '@/components/layout/page-container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PaymentDetailsModal } from './PaymentDetailsModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar as CalendarIcon, Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { format } from 'date-fns';

type PaymentType = 'charges' | 'paymentIntents' | 'payouts';

export default function PaymentsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PaymentType>('charges');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchQuery === '' ||
      payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate =
      !dateRange ||
      (payment.created * 1000 >= dateRange.from.getTime() &&
        payment.created * 1000 <= dateRange.to.getTime());

    const matchesStatus = !statusFilter || payment.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const getPaymentStats = () => {
    const total = filteredPayments.reduce(
      (acc, payment) => acc + payment.amount,
      0
    );
    const successful = filteredPayments.filter(
      (p) => p.status === 'succeeded'
    ).length;
    const failed = filteredPayments.filter((p) => p.status === 'failed').length;
    const refunded = filteredPayments.filter((p) => p.refunded).length;
    return { total, successful, failed, refunded };
  };

  const stats = getPaymentStats();

  const fetchPayments = async (type: PaymentType) => {
    setIsLoading(true);
    try {
      const endpoints = {
        charges: '/api/charges',
        paymentIntents: '/api/payment/listIntents',
        payouts: '/api/payment/payouts'
      };
      // if (!session?.user?.stripeAccount) {
      //   return;
      // }

      const response = await fetch(endpoints[type], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // accountId: session?.user?.stripeAccount
          accountId: 'acct_1QNpge4GEm4NwGIx'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`);
      }

      const data = await response.json();
      setPayments(
        type === 'charges'
          ? data.charges
          : type === 'paymentIntents'
          ? data.paymentIntents.data
          : data.payouts
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch ${type}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // if (session?.user?.stripeAccount) {
    fetchPayments(activeTab);
    // }
  }, [session?.user?.stripeAccount, activeTab]);

  const renderPaymentAmount = (payment: any) => {
    if (activeTab === 'payouts') {
      return formatCurrency(payment.amount);
    }
    return formatCurrency(payment.amount);
  };

  const renderPaymentStatus = (payment: any) => {
    let status = payment.status;
    let variant =
      status === 'succeeded' || status === 'paid'
        ? 'success'
        : status === 'failed'
        ? 'destructive'
        : 'default';

    return (
      <Badge variant={variant as any} className="capitalize">
        {status}
        {payment.refunded && ' (Refunded)'}
      </Badge>
    );
  };

  const renderSkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-[100px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[200px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[80px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[100px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[120px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[40px]" />
      </TableCell>
    </TableRow>
  );

  const renderTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              {activeTab === 'payouts' ? 'Bank Account' : 'Payment Method'}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-4 text-center">
                Loading {activeTab}...
              </TableCell>
            </TableRow>
          ) : filteredPayments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-4 text-center">
                No {activeTab} found
              </TableCell>
            </TableRow>
          ) : (
            filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {new Date(payment.created * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell>{payment.description || 'N/A'}</TableCell>
                <TableCell>{renderPaymentAmount(payment)}</TableCell>
                <TableCell>{renderPaymentStatus(payment)}</TableCell>
                <TableCell className="capitalize">
                  {activeTab === 'payouts'
                    ? payment.bank_account?.bank_name || 'N/A'
                    : payment.payment_method_details?.type || 'N/A'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleOpenModal(payment)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={`https://dashboard.stripe.com/${activeTab}/${payment.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          View in Stripe
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const handleOpenModal = (payment: any) => {
    setSelectedPayment(payment);
    // Use a small timeout to ensure state updates are processed
    setTimeout(() => {
      setIsModalOpen(true);
    }, 0);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Use a small timeout to ensure modal is closed before clearing payment
    setTimeout(() => {
      setSelectedPayment(null);
    }, 100);
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payments</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.successful}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.failed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.refunded}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange as any}
                  onSelect={setDateRange as any}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PaymentType)}
          className="space-y-4"
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="charges" className="flex-1 md:flex-none">
              Payments Received
            </TabsTrigger>
            <TabsTrigger value="paymentIntents" className="flex-1 md:flex-none">
              Payment Intents
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex-1 md:flex-none">
              Payouts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charges" className="space-y-4">
            {renderTable()}
          </TabsContent>

          <TabsContent value="paymentIntents" className="space-y-4">
            {renderTable()}
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4">
            {renderTable()}
          </TabsContent>
        </Tabs>
      </div>

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onRefundSuccess={() => fetchPayments(activeTab)}
        />
      )}
    </PageContainer>
  );
}

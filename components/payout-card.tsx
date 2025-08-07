'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import { useSession } from 'next-auth/react';
import IconBadge from '@/components/ui/iconBadge';
import {
  ChevronRight,
  DollarSign,
  CreditCard,
  Filter,
  Plus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import moment from 'moment';

interface PayoutData {
  success: boolean;
  balance: {
    available: Array<{ amount: number; currency: string }>;
    pending: Array<{ amount: number; currency: string }>;
  };
  payoutSchedule: {
    interval: string;
    delay_days: number;
    weekly_anchor?: number;
    monthly_anchor?: number;
  };
  nextPayoutDate: string | null;
  payouts: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    type: string;
    created: string;
    arrival_date: string | null;
    automatic: boolean;
    description: string;
    failure_code?: string;
    failure_message?: string;
  }>;
}

export const PayoutCard = () => {
  const { data: session } = useSession();
  const { getPayouts, requestInstantPayout } = useApi();
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [requestPayoutModalOpen, setRequestPayoutModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [requesting, setRequesting] = useState(false);

  const accountId = session?.user?.stripeAccount;

  const fetchPayouts = async () => {
    if (!accountId) return;

    try {
      setLoading(true);
      const data = await getPayouts({ accountId, limit: 10 });
      setPayoutData(data);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payout data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [accountId]);

  const filteredPayouts = useMemo(() => {
    if (!payoutData?.payouts) return [];

    switch (filter) {
      case 'pending':
        return payoutData.payouts.filter((p) => p.status === 'pending');
      case 'paid':
        return payoutData.payouts.filter((p) => p.status === 'paid');
      case 'failed':
        return payoutData.payouts.filter((p) => p.status === 'failed');
      default:
        return payoutData.payouts;
    }
  }, [payoutData?.payouts, filter]);

  const availableBalance = payoutData?.balance?.available?.[0]?.amount || 0;
  const pendingBalance = payoutData?.balance?.pending?.[0]?.amount || 0;
  const currency = payoutData?.balance?.available?.[0]?.currency || 'AUD';

  const handleRequestPayout = async () => {
    if (!accountId) return;

    try {
      setRequesting(true);
      const amount = payoutAmount ? parseFloat(payoutAmount) : undefined;

      const response = await requestInstantPayout({ accountId, amount });

      toast({
        title: 'Success',
        description: response.message || 'Payout requested successfully',
        variant: 'default'
      });

      setRequestPayoutModalOpen(false);
      setPayoutAmount('');
      // Refresh data
      await fetchPayouts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to request payout',
        variant: 'destructive'
      });
    } finally {
      setRequesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card variant="secondary" className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconBadge icon={DollarSign} />
            <span>Payouts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="animate-pulse space-y-4">
            <div className="h-8 rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payoutData) {
    return (
      <Card variant="secondary" className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconBadge icon={DollarSign} />
            <span>Payouts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-gray-500">Unable to load payout data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        variant="secondary"
        className="h-full cursor-pointer"
        onClick={() => setPayoutModalOpen(true)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <IconBadge icon={DollarSign} />
              <span>Payouts</span>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="h-8 w-[100px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-4">
            {/* Balance Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Available</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs">$</span>
                  <span className="text-xl font-medium">
                    {availableBalance.toFixed(2)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs">$</span>
                  <span className="text-xl font-medium">
                    {pendingBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payout Schedule */}
            <div>
              <p className="mb-1 text-xs text-gray-500">Schedule</p>
              <p className="text-sm capitalize">
                {payoutData.payoutSchedule.interval}
              </p>
              {payoutData.nextPayoutDate && (
                <p className="text-xs text-gray-500">
                  Next:{' '}
                  {moment(payoutData.nextPayoutDate).format('MMM D, YYYY')}
                </p>
              )}
            </div>

            {/* Recent Payouts */}
            <div>
              <p className="mb-2 text-xs text-gray-500">
                Recent Payouts ({filteredPayouts.length})
              </p>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {filteredPayouts.slice(0, 3).map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`px-1 py-0 text-xs ${getStatusColor(
                          payout.status
                        )}`}
                      >
                        {payout.status}
                      </Badge>
                      <span>${payout.amount.toFixed(2)}</span>
                    </div>
                    <span className="text-gray-500">
                      {moment(payout.created).format('MMM D')}
                    </span>
                  </div>
                ))}
                {filteredPayouts.length === 0 && (
                  <p className="text-xs text-gray-500">No payouts found</p>
                )}
              </div>
            </div>

            {/* <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setRequestPayoutModalOpen(true);
                }}
                disabled={availableBalance <= 0}
              >
                <Plus size={14} className="mr-1" />
                Request
              </Button>
              <Button variant="ghost" size="sm">
                <span className="flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight size={14} />
                </span>
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Payout Details Modal */}
      <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBadge icon={DollarSign} />
              Payout Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm">$</span>
                      <span className="text-2xl font-bold">
                        {availableBalance.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">{currency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Pending Balance</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm">$</span>
                      <span className="text-2xl font-bold">
                        {pendingBalance.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">{currency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payout Schedule */}
            <Card>
              <CardContent className="p-4">
                <h4 className="mb-2 font-medium">Payout Schedule</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Frequency</p>
                    <p className="capitalize">
                      {payoutData.payoutSchedule.interval}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Delay</p>
                    <p>{payoutData.payoutSchedule.delay_days} days</p>
                  </div>
                  {payoutData.nextPayoutDate && (
                    <>
                      <div className="col-span-2">
                        <p className="text-gray-500">Next Payout</p>
                        <p>
                          {moment(payoutData.nextPayoutDate).format(
                            'MMMM D, YYYY [at] h:mm A'
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payouts List */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">Payout History</h4>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {filteredPayouts.map((payout) => (
                  <div key={payout.id} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(payout.status)}>
                          {payout.status}
                        </Badge>
                        <span className="font-medium">
                          ${payout.amount.toFixed(2)} {payout.currency}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {moment(payout.created).format('MMM D, YYYY')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span>Method: </span>
                        <span className="capitalize">{payout.method}</span>
                      </div>
                      <div>
                        <span>Type: </span>
                        <span className="capitalize">{payout.type}</span>
                      </div>
                      {payout.arrival_date && (
                        <div className="col-span-2">
                          <span>Arrival: </span>
                          <span>
                            {moment(payout.arrival_date).format('MMM D, YYYY')}
                          </span>
                        </div>
                      )}
                      {payout.failure_message && (
                        <div className="col-span-2 text-red-600">
                          <span>Error: </span>
                          <span>{payout.failure_message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredPayouts.length === 0 && (
                  <p className="py-8 text-center text-gray-500">
                    No payouts found
                  </p>
                )}
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

      {/* Request Payout Modal */}
      {/* <Dialog
        open={requestPayoutModalOpen}
        onOpenChange={setRequestPayoutModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBadge icon={Plus} />
              Request Payout
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="mb-4 text-sm text-gray-600">
                Request an instant payout from your available balance of $
                {availableBalance.toFixed(2)} {currency}.
              </p>
            </div>
            <div>
              <Label htmlFor="amount">Amount (optional)</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Max: ${availableBalance.toFixed(2)}`}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                max={availableBalance}
                step="0.01"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to payout full available balance
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRequestPayout}
                disabled={requesting || availableBalance <= 0}
                className="flex-1"
              >
                {requesting ? 'Processing...' : 'Request Payout'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setRequestPayoutModalOpen(false)}
                disabled={requesting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}
    </>
  );
};

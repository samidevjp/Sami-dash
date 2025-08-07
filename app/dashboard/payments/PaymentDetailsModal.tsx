import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';

interface PaymentDetailsModalProps {
  payment: any;
  isOpen: boolean;
  onClose: () => void;
  onRefundSuccess: () => void;
}

export function PaymentDetailsModal({
  payment,
  isOpen,
  onClose,
  onRefundSuccess
}: PaymentDetailsModalProps) {
  const { toast } = useToast();
  const [isRefunding, setIsRefunding] = useState(false);

  const handleRefund = async () => {
    if (!window.confirm('Are you sure you want to refund this payment?')) {
      return;
    }

    setIsRefunding(true);
    try {
      const response = await fetch('/api/charges/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chargeId: payment.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refund payment');
      }

      toast({
        title: 'Success',
        description: 'Payment has been refunded successfully',
        variant: 'success'
      });
      onRefundSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refund payment',
        variant: 'destructive'
      });
    } finally {
      setIsRefunding(false);
    }
  };
  console.log('payment', payment);
  console.log('isOpen', isOpen);
  if (!payment) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm font-medium">Amount</div>
            <div>{formatCurrency(payment.amount)}</div>

            <div className="text-sm font-medium">Status</div>
            <div
              className={`capitalize ${
                payment.status === 'succeeded'
                  ? 'text-green-600'
                  : payment.status === 'failed'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              {payment.status}
            </div>

            <div className="text-sm font-medium">Date</div>
            <div>{new Date(payment.created * 1000).toLocaleString()}</div>

            <div className="text-sm font-medium">Payment Method</div>
            <div className="capitalize">
              {payment.payment_method_details?.type || 'N/A'}
            </div>

            {payment.payment_method_details?.card && (
              <>
                <div className="text-sm font-medium">Card</div>
                <div>
                  {payment.payment_method_details.card.brand.toUpperCase()} ****{' '}
                  {payment.payment_method_details.card.last4}
                </div>
              </>
            )}

            <div className="text-sm font-medium">Description</div>
            <div>{payment.description || 'N/A'}</div>

            {payment.receipt_email && (
              <>
                <div className="text-sm font-medium">Receipt Email</div>
                <div>{payment.receipt_email}</div>
              </>
            )}
          </div>

          {payment.status === 'succeeded' && !payment.refunded && (
            <div className="pt-4">
              <Button
                variant="destructive"
                onClick={handleRefund}
                disabled={isRefunding}
                className="w-full"
              >
                {isRefunding ? 'Processing Refund...' : 'Refund Payment'}
              </Button>
            </div>
          )}

          {payment.refunded && (
            <div className="pt-4 text-center text-sm text-green-600">
              This payment has been refunded
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployee } from '@/hooks/useEmployee';
import { toast } from '../ui/use-toast';
import { useBooking } from '@/hooks/bookingStore';
import {
  createTransaction,
  createonAccountTransaction
} from '@/hooks/useCreateOrderAndTransaction';
import { useApi } from '@/hooks/useApi';
import { formatDate, responseOK } from '@/lib/utils';
import { useShiftStore } from '@/hooks/useShiftStore';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogContentWithoutClose
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import PaymentModalOrderSummary from './payment-modal-order-summary';
import { PaymentModalOptions } from './payment-modal-options';
import {
  CardSurcharge,
  OrderProduct,
  PaymentOptionMode,
  SurchargeItem,
  SplitItemAssignments
} from '@/types';
import { BOOKINGSTATUS } from '@/utils/enum';
import { usePaymentState } from '@/hooks/usePaymentState';
import {
  handleBookingPayment,
  handleOnAccountPayment,
  handlePhoneOrderPayment,
  handleQuickSalePayment
} from '@/lib/paymentHandler';

import { useSurchargeStore } from '@/hooks/useSurchargeStore';
import {
  calclateTotal,
  calculateFinalSubtotal,
  calculateGST,
  calculateTipByRate,
  getSelectedSurchargePrices
} from '@/lib/calc';
import { useSession } from 'next-auth/react';
import { AlertTriangle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClosePhoneOrder?: () => void;
  total: number;
  guestName: string;
  tableId: string;
  items: OrderProduct[];
  isQuickSale?: boolean;
  isPhoneOrder?: boolean;
  finishQuickSaleOrder?: (order: any) => void;
  phoneOrder?: any;
  propBooking?: any;
  docket?: any;
  onPaymentComplete?: () => void;
}

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const PaymentModal = ({
  isOpen,
  onClose,
  onClosePhoneOrder,
  total,
  guestName,
  tableId,
  items,
  isQuickSale,
  isPhoneOrder,
  finishQuickSaleOrder,
  phoneOrder,
  propBooking = null,
  docket = null,
  onPaymentComplete
}: PaymentModalProps) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [optionMode, setOptionMode] = useState<PaymentOptionMode>('default');
  const [selectedSurcharges, setSelectedSurcharges] = useState<SurchargeItem[]>(
    []
  );
  const [posCardSurcharges, setPosCardSurcharges] = useState<CardSurcharge[]>(
    []
  );

  // Warning modal state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [pendingOptionMode, setPendingOptionMode] =
    useState<PaymentOptionMode | null>(null);

  // Split payment state
  // Removed split selection logic - payments now automatically go to next available split
  const [splitItemAssignments, setSplitItemAssignments] =
    useState<SplitItemAssignments>({});

  const { selectedShiftId } = useShiftStore();
  const router = useRouter();
  const { currentEmployee } = useEmployee();
  const { booking, setBooking } = useBooking();
  const paymentHelpers = usePaymentState(total, items);

  const {
    paymentState,
    setPaymentState,
    resetPaymentState,
    handleAdditionalChargeChange,
    setShowCalculator
  } = paymentHelpers;

  const {
    createOrder,
    createTransaction: createTransactionApi,
    createBooking,
    addBookingOrder,
    getPosOtherSurcharge,
    getPosCardSurcharge
  } = useApi();
  const { filteredSurcharges, fetchSurcharges } = useSurchargeStore();

  // Check if user has opted out of warning modal
  const shouldShowWarning = () => {
    const hideWarning = getCookie('hidePaymentWarning');
    return hideWarning !== 'true';
  };

  // Enhanced setOptionMode that shows warning for restricted modes
  const handleSetOptionMode = (mode: PaymentOptionMode) => {
    const restrictedModes: PaymentOptionMode[] = [
      'tip',
      'discount',
      'surcharge',
      'custom-amount'
    ];

    if (restrictedModes.includes(mode) && shouldShowWarning()) {
      setPendingOptionMode(mode);
      setShowWarningModal(true);
      return;
    }

    setOptionMode(mode);
  };

  // Handle warning modal confirmation
  const handleWarningConfirm = () => {
    if (dontShowAgain) {
      setCookie('hidePaymentWarning', 'true');
    }

    if (pendingOptionMode) {
      setOptionMode(pendingOptionMode);
      setPendingOptionMode(null);
    }

    setShowWarningModal(false);
    setDontShowAgain(false);
  };

  // Handle warning modal cancel
  const handleWarningCancel = () => {
    setShowWarningModal(false);
    setPendingOptionMode(null);
    setDontShowAgain(false);
    if (dontShowAgain) {
      setCookie('hidePaymentWarning', 'true');
    }
  };

  useEffect(() => {
    fetchSurcharges(getPosOtherSurcharge);
    handleGetPosCardSurcharge();
  }, []);

  const handleGetPosCardSurcharge = async () => {
    const response = await getPosCardSurcharge();
    setPosCardSurcharges(response);
  };

  useEffect(() => {
    if (isPhoneOrder) setBooking(null);
  }, [isPhoneOrder]);

  useEffect(() => {
    if (propBooking) setBooking(propBooking);
  }, [propBooking]);

  useEffect(() => {
    if (!isOpen) return;
    setPaymentState((prev) => ({
      ...prev,
      originalTotal: total,
      remainingAmount: total,
      finalTotal: total,
      currentPayment: {
        ...prev.currentPayment,
        amount: total
      }
    }));

    // Show warning modal when payment screen opens (unless user opted out)
    if (shouldShowWarning()) {
      setShowWarningModal(true);
    }
  }, [total, isOpen]);

  useEffect(() => {
    if (paymentState.tipRate && paymentState.tipRate > 0) {
      // Calculate redeem amount from payments
      const redeemAmount = paymentState.payments
        .filter((payment) => payment.paymentType === 3)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const updatedTip = calculateTipByRate(
        paymentState.originalTotal,
        paymentState.discount,
        redeemAmount,
        paymentState.tipRate
      );
      setPaymentState((prev) => ({
        ...prev,
        tip: updatedTip
      }));
    }
  }, [
    paymentState.originalTotal,
    paymentState.discount,
    paymentState.payments,
    paymentState.tipRate
  ]);

  const finalSubtotal = useMemo(() => {
    // Calculate redeem amount from payments
    const redeemAmount = paymentState.payments
      .filter((payment) => payment.paymentType === 3)
      .reduce((sum, payment) => sum + payment.amount, 0);

    return calculateFinalSubtotal(
      paymentState.originalTotal,
      paymentState.discount,
      redeemAmount
    );
  }, [
    paymentState.originalTotal,
    paymentState.discount,
    paymentState.payments
  ]);

  const selectedSurchargePrices = useMemo(() => {
    return getSelectedSurchargePrices(finalSubtotal, selectedSurcharges);
  }, [finalSubtotal, selectedSurcharges]);

  const gstAmount = useMemo(() => {
    return calculateGST(
      finalSubtotal,
      paymentState.tip,
      selectedSurchargePrices
    );
  }, [finalSubtotal, paymentState.tip, selectedSurchargePrices]);

  const recalculateFinalTotal = () => {
    const customAmountsTotal = paymentState.customAmounts.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const finalTotal =
      calclateTotal(finalSubtotal, selectedSurchargePrices, paymentState.tip) +
      customAmountsTotal;

    // Calculate effective payments (excluding gift cards since they're already in finalSubtotal)
    const effectivePayments = paymentState.payments.reduce((sum, payment) => {
      // Skip gift card payments as they're already deducted from finalTotal
      if (payment.paymentType === 3) {
        return sum;
      }

      if (payment.paymentMethod === 'cash') {
        return (
          sum +
          Math.min(payment.amount, payment.expectedAmount || payment.amount)
        );
      } else if (payment.paymentMethod === 'card') {
        return sum + (payment.amount - payment.surchargeAmount);
      }
      return sum + payment.amount;
    }, 0);

    setPaymentState((prev) => ({
      ...prev,
      finalTotal,
      remainingAmount: Math.round((finalTotal - effectivePayments) * 100) / 100
    }));
  };

  useEffect(() => {
    recalculateFinalTotal();
  }, [
    finalSubtotal,
    paymentState.tip,
    paymentState.customAmounts,
    paymentState.discount,
    paymentState.payments,
    selectedSurcharges
  ]);

  // Calculate redeem amount from payments
  const redeemAmount = paymentState.payments
    .filter((payment) => payment.paymentType === 3)
    .reduce((sum, payment) => sum + payment.amount, 0);

  const { payments, tip, discount, customAmounts } = paymentState;

  const prepareTransactionData = () => {
    const formattedPayments = payments.map((payment) => ({
      payment_type: payment.paymentMethod === 'card' ? 2 : 1,
      terminal_id: '',
      note: payment.paymentMethod === 'card' ? 'Credit' : 'Cash',
      fee_type: payment.feeCreditType || 'domestic',
      surcharge_amount: payment.surchargeAmount.toString(),
      payed_amount: payment.amount,
      cash_amount: payment.amount,
      payment_ref: payment.paymentRef,
      id: 0
    }));

    const totalSurcharge = payments.reduce(
      (sum, payment) => sum + payment.surchargeAmount,
      0
    );

    return {
      payments: formattedPayments,
      tipAmount: tip,
      discount: discount,
      surcharge: totalSurcharge,
      customAmount:
        customAmounts.length > 0
          ? customAmounts.map((ca) => ({ amount: ca.amount, name: ca.note }))
          : []
    };
  };

  const handleFinishBooking = async () => {
    const now = new Date();
    const params = {
      start_date: formatDate(now),
      partial_seated: 0,
      reservation_note: '',
      uuid: booking.uuid,
      booking_taken: booking.booking_taken,
      table_lock: false,
      status: BOOKINGSTATUS.finished,
      table_ids: [booking.table[0].id],
      no_limit: false,
      floor_id: booking.floor_id,
      end_date: formatDate(now),
      id: booking.id,
      created_at: '',
      finished_date: '',
      guest: booking.guest,
      table: booking.table,
      party_size: booking.party_size,
      shift_id: selectedShiftId,
      type: 1
    };
    try {
      const order = await createBooking(params);
      router.replace('/pin');
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleSubmitPayment = async () => {
    if (paymentState.remainingAmount > 0.01) {
      toast({
        title: 'Payment incomplete',
        description: `There is still $${paymentState.remainingAmount.toFixed(
          2
        )} remaining.`,
        variant: 'destructive'
      });
      return;
    }

    const transactionData = prepareTransactionData();

    try {
      if (isQuickSale) {
        const response = await handleQuickSalePayment({
          total,
          items,
          guestName,
          currentEmployee,
          createOrder,
          createTransactionApi,
          createTransaction,
          transactionData
        });

        if (responseOK(response)) {
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Order created successfully'
          });
        }

        router.push('/quick-sale');
        finishQuickSaleOrder?.(response.data.phoneOrder);
        resetPaymentState();
        onClose();
        setLoading(false);
        return;
      }

      if (isPhoneOrder) {
        await handlePhoneOrderPayment({
          total,
          currentEmployee,
          createTransaction,
          createTransactionApi,
          transactionData,
          phoneOrder,
          onClosePhoneOrder
        });
      } else if (docket !== null) {
        await handleOnAccountPayment({
          currentEmployee,
          createonAccountTransaction,
          createTransactionApi,
          transactionData,
          docket
        });
      } else {
        await handleBookingPayment({
          total,
          currentEmployee,
          createTransaction,
          createTransactionApi,
          addBookingOrder,
          booking,
          items,
          transactionData,
          handleFinishBooking
        });
        onClose();
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: 'Payment failed',
        description: 'There was an error processing your payment.',
        variant: 'destructive'
      });
    }
  };

  const close = () => {
    console.log('close');
    onClose();
    resetPaymentState();
    setSelectedSurcharges([]);
  };

  // Handle adding item to split - to be passed to PaymentModalOptions
  const [addItemToSplitCallback, setAddItemToSplitCallback] = useState<
    ((item: any, quantity: number, splitNumber?: number) => void) | null
  >(null);

  return (
    <>
      <Dialog modal={true} open={isOpen} onOpenChange={close}>
        <DialogContentWithoutClose
          className="flex h-screen min-w-[100dvw] flex-col bg-background p-2 md:flex-row"
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
          aria-describedby="payment-modal-description"
        >
          <DialogTitle className="hidden">Payment modal</DialogTitle>
          <DialogDescription id="payment-modal-description" className="hidden">
            Payment processing interface
          </DialogDescription>
          <PaymentModalOrderSummary
            booking={booking}
            finalSubtotal={finalSubtotal}
            gstAmount={gstAmount}
            guestName={guestName}
            paymentItems={items}
            paymentHelpers={paymentHelpers}
            selectedSurcharges={selectedSurcharges}
            setOptionMode={handleSetOptionMode}
            setSelectedSurcharges={setSelectedSurcharges}
            tableId={tableId}
            onAddItemToSplit={addItemToSplitCallback || undefined}
            splitItemAssignments={splitItemAssignments}
            setSplitItemAssignments={setSplitItemAssignments}
          />
          <PaymentModalOptions
            filteredSurcharges={filteredSurcharges}
            handleSubmitPayment={handleSubmitPayment}
            loading={loading}
            optionMode={optionMode}
            paymentItems={items}
            paymentHelpers={paymentHelpers}
            selectedSurcharges={selectedSurcharges}
            setOptionMode={handleSetOptionMode}
            setSelectedSurcharges={setSelectedSurcharges}
            posCardSurcharges={posCardSurcharges}
            session={session}
            booking={booking}
            tableId={tableId}
            guestName={guestName}
            onPaymentComplete={onPaymentComplete}
            close={close}
            setAddItemToSplitCallback={setAddItemToSplitCallback}
            itemSplits={splitItemAssignments}
            setItemSplits={setSplitItemAssignments}
          />
        </DialogContentWithoutClose>
      </Dialog>

      {/* Warning Modal */}
      <Dialog open={showWarningModal} onOpenChange={handleWarningCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Payment Modification Warning
            </DialogTitle>
            <DialogDescription className="text-left">
              Once a payment or gift card is applied, you can&apos;t change tip,
              discount, surcharge, or custom amount.
              <br />
              <br />
              If the payment or gift card is reverted, you can add them again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dontShowAgain"
                checked={dontShowAgain}
                onCheckedChange={(checked) =>
                  setDontShowAgain(checked as boolean)
                }
              />
              <label htmlFor="dontShowAgain" className="cursor-pointer text-sm">
                Don&apos;t show this message again
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleWarningCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleWarningConfirm} className="flex-1">
                Continue Anyway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentModal;

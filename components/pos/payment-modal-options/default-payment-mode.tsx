'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { ScanDialog } from '../../scan-dialog';
import NumberPad from './number-pad';
import { PaymentState, CardSurcharge } from '@/types';
import { UsePaymentStateReturn } from '@/hooks/usePaymentState';
import { formatDisplayAmount } from '@/lib/calc';
import { useToast } from '../../ui/use-toast';
import { Icons } from '../../icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContentWithoutClose
} from '../../ui/dialog';
import { Clock, X, Copy, Loader2, CheckCircle, FileText } from 'lucide-react';
import axios from 'axios';
import { useQRCode } from 'next-qrcode';
import { BOOKINGSTATUS } from '@/utils/enum';
import { useApi } from '@/hooks/useApi';
import AllGuestsModal from '../all-guests-modal';
import { Input } from '@/components/ui/input';
import { getSplitTotal } from '@/utils/common';
import type { SplitItemAssignments } from '@/types';
import { useEmployee } from '@/hooks/useEmployee';

interface DefaultPaymentModeProps {
  paymentHelpers: UsePaymentStateReturn;
  posCardSurcharges: CardSurcharge[];
  scanDialogOpen: boolean;
  setScanDialogOpen: (open: boolean) => void;
  availableCameras: MediaDeviceInfo[];
  hasCameraPermission: boolean;
  cameraError: string | null;
  handleScanTicketClick: () => void;
  handleScan: (data: any) => void;
  handleError: (error: any) => void;
  paymentItems?: any[]; // Add payment items prop
  session?: any; // Add session prop for stripe account
  booking?: any; // Add booking data for metadata
  tableId?: string; // Add table ID
  guestName?: string; // Add guest name
  onPaymentComplete?: () => void; // Add callback to close modals
  setOptionMode: (mode: any) => void; // Add setOptionMode prop
  splitStep?: 'select-type' | 'select-number' | 'select-split';
  setSplitStep?: (
    step: 'select-type' | 'select-number' | 'select-split'
  ) => void;
  itemSplits?: SplitItemAssignments;
}

const DefaultPaymentMode: React.FC<DefaultPaymentModeProps> = ({
  paymentHelpers,
  posCardSurcharges,
  scanDialogOpen,
  setScanDialogOpen,
  availableCameras,
  hasCameraPermission,
  cameraError,
  handleScanTicketClick,
  handleScan,
  handleError,
  paymentItems = [],
  session,
  booking,
  tableId,
  guestName,
  onPaymentComplete,
  setOptionMode,
  splitStep,
  setSplitStep,
  itemSplits = {} as SplitItemAssignments
}) => {
  const {
    paymentState,
    cashAmount,
    addPayment,
    handleCalculatorInput,
    resetNumberPad
  } = paymentHelpers;

  const { toast } = useToast();
  const { createBooking, createTransaction } = useApi();
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState(false);
  const [generatedPaymentLink, setGeneratedPaymentLink] = useState('');
  const { currentEmployee } = useEmployee();

  const [paymentType, setPaymentType] = useState<
    'payment_link' | 'checkout_session'
  >('payment_link');
  const [paymentStatus, setPaymentStatus] = useState<
    'pending' | 'completed' | null
  >(null);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [showBookingStatusDialog, setShowBookingStatusDialog] = useState(false);
  const [isUpdatingBookingStatus, setIsUpdatingBookingStatus] = useState(false);

  // New state for confirmation and guest selection
  const [showPaymentLinkConfirmModal, setShowPaymentLinkConfirmModal] =
    useState(false);
  const [showGuestSelectionModal, setShowGuestSelectionModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [showBookingStatusSelectionModal, setShowBookingStatusSelectionModal] =
    useState(false);

  // Check if gift card has been redeemed
  const isGiftCardRedeemed = paymentState.payments.some(
    (payment) => payment.paymentType === 3
  );

  // Use next-qrcode hook
  const { Canvas } = useQRCode();

  const handleUpdateBookingStatus = async (status: 'billed' | 'finished') => {
    if (!booking) {
      toast({
        title: 'Error',
        description: 'No booking found to update',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdatingBookingStatus(true);

    try {
      const now = new Date();
      const formatDate = (date: Date) => {
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };

      const statusValue =
        status === 'billed' ? BOOKINGSTATUS.billed : BOOKINGSTATUS.finished;

      const params = {
        start_date: formatDate(now),
        partial_seated: 0,
        reservation_note: booking.reservation_note || '',
        uuid: booking.uuid,
        booking_taken: booking.booking_taken,
        table_lock: false,
        status: statusValue,
        table_ids: [booking.table[0].id],
        no_limit: false,
        floor_id: booking.floor_id,
        end_date: formatDate(now),
        id: booking.id,
        created_at: booking.created_at || '',
        finished_date: status === 'finished' ? formatDate(now) : '',
        guest: booking.guest,
        table: booking.table,
        party_size: booking.party_size,
        shift_id: booking.shift_id,
        type: booking.type || 1
      };

      const response = await createBooking(params);

      toast({
        title: 'Success',
        description: `Booking has been marked as ${status}`,
        variant: 'success'
      });

      setShowBookingStatusDialog(false);
      setShowPaymentLinkModal(false);

      // Reset payment link states
      setGeneratedPaymentLink('');
      setPaymentStatus(null);

      // Close payment modal and ProductAndOrder
      if (onPaymentComplete) {
        onPaymentComplete();
      }
      // close payment modal
      close();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Error',
        description: `Failed to mark booking as ${status}`,
        variant: 'destructive'
      });
    } finally {
      setIsUpdatingBookingStatus(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!paymentItems || paymentItems.length === 0) {
      toast({
        title: 'No Items',
        description: 'No payment items available to create payment link.',
        variant: 'destructive'
      });
      return;
    }

    if (!session?.user?.stripeAccount) {
      toast({
        title: 'Configuration Error',
        description: 'Stripe account not configured. Please contact support.',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingPaymentLink(true);
    setGeneratedPaymentLink('');
    setPaymentType('payment_link');

    try {
      // Process each item to ensure they have price_id in Stripe
      const processedItems = [];

      for (const item of paymentItems) {
        let priceId = item.price_id;

        // If item doesn't have a price_id, create it in Stripe
        if (!priceId) {
          try {
            const response = await axios.post('/api/price/create', {
              title: item.title || item.name || 'Item',
              unit_amount: parseFloat(item.price || item.amount || '0'),
              accountId: session.user.stripeAccount,
              imageUrl: item.imageUrl || item.image || undefined
            });

            if (response.data?.price?.id) {
              priceId = response.data.price.id;
            } else {
              throw new Error(
                `Failed to create price for item: ${item.title || item.name}`
              );
            }
          } catch (error) {
            console.error('Error creating price for item:', item, error);
            toast({
              title: 'Error',
              description: `Failed to create price for item: ${
                item.title || item.name
              }`,
              variant: 'destructive'
            });
            continue; // Skip this item and continue with others
          }
        }

        processedItems.push({
          price_id: priceId,
          quantity: item.quantity || 1
        });
      }

      if (processedItems.length === 0) {
        throw new Error('No valid items to create payment link');
      }

      // Calculate redeem amount from payments with paymentType 3 (gift card)
      const redeemAmount = paymentState.payments
        .filter((payment) => payment.paymentType === 3)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const adjustments = [];
      if (paymentState.discount > 0) {
        adjustments.push({
          type: 'discount',
          amount: paymentState.discount,
          description: 'Discount'
        });
      }

      if (redeemAmount > 0) {
        adjustments.push({
          type: 'redeem',
          amount: redeemAmount,
          description: 'Gift Card Redeem'
        });
      }

      // Prepare metadata for booking tracking
      const metadata: any = {
        created_via: 'pos_payment_modal',
        guest_name: guestName || 'Unknown Guest',
        table_id: tableId || 'N/A',
        payment_amount: paymentState.finalTotal.toString()
      };

      // Add booking ID if available
      if (booking?.id) {
        metadata.booking_id = booking.id.toString();
        metadata.booking_uuid = booking.uuid || '';
      }

      // Create the payment link with metadata, tip, discounts array, and custom amounts
      const response = await axios.post('/api/stripe-payment-link', {
        account: session.user.stripeAccount,
        items: processedItems,
        metadata: metadata,
        tip: paymentState.tip || 0,
        discounts: adjustments,
        customAmounts: paymentState.customAmounts || []
      });

      if (response.data.url) {
        setGeneratedPaymentLink(response.data.url);
        setPaymentType(response.data.type || 'payment_link');
        setPaymentStatus('pending');

        // Build description based on what's included
        let includes = [];
        if (paymentState.tip > 0)
          includes.push(`tip ($${paymentState.tip.toFixed(2)})`);

        // Handle discount and redeem in description
        if (paymentState.discount > 0)
          includes.push(`discount (-$${paymentState.discount.toFixed(2)})`);

        if (redeemAmount > 0)
          includes.push(`gift card redeem (-$${redeemAmount.toFixed(2)})`);

        if (paymentState.customAmounts.length > 0)
          includes.push(
            `${paymentState.customAmounts.length} custom amount(s)`
          );

        const includesText =
          includes.length > 0 ? ` including ${includes.join(', ')}` : '';

        const isDiscountApplied = response.data.discount_applied || false;
        const baseDescription = `${
          response.data.type === 'checkout_session'
            ? 'Checkout session'
            : 'Payment link'
        } created${includesText}. ${
          isDiscountApplied
            ? 'Discount automatically applied at checkout!'
            : 'Ready for customer payment.'
        }`;

        toast({
          title: 'Success',
          description: baseDescription,
          variant: 'success'
        });

        // Copy to clipboard automatically
        try {
          await navigator.clipboard.writeText(response.data.url);
          toast({
            title: 'Payment Link Created & Copied',
            description:
              'Payment link copied to clipboard. Waiting for payment...',
            variant: 'success'
          });
        } catch (clipboardError) {
          // Fallback if clipboard fails (document not focused, etc.)
          toast({
            title: 'Payment Link Created',
            description:
              'Please manually copy the link below. Waiting for payment...',
            variant: 'success'
          });
        }

        // Start polling for payment completion
        startPaymentStatusPolling(
          response.data.payment_link_id,
          response.data.type || 'payment_link'
        );
      } else {
        throw new Error(
          response.data.error || 'Failed to generate payment link'
        );
      }
    } catch (error: any) {
      console.error('Error creating payment link:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create payment link',
        variant: 'destructive'
      });

      // Close modal and reset state on error
      setShowPaymentLinkModal(false);
      setGeneratedPaymentLink('');
      setPaymentStatus(null);
    } finally {
      setIsCreatingPaymentLink(false);
    }
  };

  const handleCopyPaymentLink = async () => {
    if (generatedPaymentLink) {
      try {
        await navigator.clipboard.writeText(generatedPaymentLink);
        toast({
          title: 'Copied',
          description: 'Payment link copied to clipboard',
          variant: 'success'
        });
      } catch (clipboardError) {
        // Fallback for manual copying
        toast({
          title: 'Copy Failed',
          description: 'Please manually select and copy the link',
          variant: 'default'
        });
      }
    }
  };

  const handleCancelPaymentLink = () => {
    // Reset payment link related state
    setGeneratedPaymentLink('');
    setPaymentStatus(null);
    setShowPaymentLinkModal(false);

    toast({
      title: 'Payment Link Cancelled',
      description: 'You can now choose a different payment method.',
      variant: 'default'
    });
  };

  // Function to poll for payment completion
  const startPaymentStatusPolling = (
    paymentLinkId: string,
    type: string = 'payment_link'
  ) => {
    if (!paymentLinkId) return;

    const pollInterval = setInterval(async () => {
      try {
        // Check payment status via Stripe API
        const response = await fetch(
          `/api/stripe-payment-link/status?payment_link_id=${paymentLinkId}&account=${session?.user?.stripeAccount}&type=${type}`
        );
        const data = await response.json();

        if (data.status === 'completed') {
          setPaymentStatus('completed');
          clearInterval(pollInterval);

          toast({
            title: 'Payment Completed!',
            description: 'Please choose how to handle this booking.',
            variant: 'success'
          });

          // Show booking status choice dialog instead of automatically finishing
          setShowBookingStatusDialog(true);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        // Continue polling even if there's an error
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'pending') {
        toast({
          title: 'Payment Status Check Stopped',
          description: 'Please refresh to check payment status manually.',
          variant: 'default'
        });
      }
    }, 300000); // 5 minutes
  };

  const handleAccountPayment = async () => {
    if (!selectedGuest) {
      toast({
        title: 'No Guest Selected',
        description: 'Please select a guest for on-account payment.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Build the payments array with all payment methods
      const paymentsArray = [];

      // If there are existing payments (like gift cards), include them first
      if (paymentState.payments.length > 0) {
        // Group payments by receipt_id or create a single receipt entry
        const receiptId = `D-${Date.now()}${Math.floor(
          Math.random() * 1000000
        )}`;

        const methods: any[] = [];

        // Add existing payments (gift cards, etc.)
        paymentState.payments.forEach((payment) => {
          if (payment.paymentType === 3) {
            // Gift card
            methods.push({
              note: 'Gift Card',
              payed_amount: payment.amount,
              id: 0,
              terminal_id: '',
              payment_type: 3,
              cash_amount: payment.amount
            });
          }
        });

        paymentsArray.push({
          receipt_id: receiptId,
          methods: methods
        });
      }

      // Build surcharge array - for on-account transactions, keep it simple
      const surchargeArray: Array<{
        type: number;
        name: string;
        value: number;
      }> = [];

      // Prepare transaction data matching the backend format
      const transactionData = {
        transaction_id: `WB${Date.now().toString().slice(-8)}${Math.floor(
          Math.random() * 100000
        )}`,
        order_type: 1,
        receipt_id: '',
        discount:
          paymentState.discount > 0
            ? {
                name: '',
                type: 1,
                value:
                  (paymentState.discount / (paymentState.originalTotal || 1)) *
                  100
              }
            : null,
        pos_device_id: 791,
        uuid: booking?.uuid || `${Date.now()}-${Math.random()}`,
        payments: paymentsArray,
        pos_cash_drawer_id: 0,
        order_id: booking?.order_id || 0,
        surcharge: surchargeArray,
        status: 2,
        guest_id: selectedGuest?.id || 0,
        sub_total: paymentState.originalTotal,
        transaction_date: new Date()
          .toISOString()
          .replace('T', ' ')
          .substring(0, 19),
        order_uuid: booking?.uuid || `${Date.now()}-${Math.random()}`,
        tip:
          paymentState.tip > 0
            ? {
                name: '',
                type: 1,
                value:
                  (paymentState.tip / (paymentState.originalTotal || 1)) * 100
              }
            : null,
        employee_id: currentEmployee?.id || 0
      };

      const response = await createTransaction(transactionData);

      if (response) {
        toast({
          title: 'Transaction Created',
          description: 'On-account transaction created successfully.',
          variant: 'success'
        });

        // Show booking status selection modal
        setShowBookingStatusSelectionModal(true);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Transaction Failed',
        description: 'Failed to create on-account transaction.',
        variant: 'destructive'
      });
    }
  };

  const handleBookingStatusSelection = async (
    status: 'billed' | 'finished'
  ) => {
    try {
      const formatDate = (date: Date) => {
        return date.toISOString().replace('T', ' ').substring(0, 19);
      };

      const now = new Date();
      const bookingStatus =
        status === 'billed' ? BOOKINGSTATUS.billed : BOOKINGSTATUS.finished;

      const params = {
        start_date: formatDate(now),
        partial_seated: 0,
        reservation_note: '',
        uuid: booking?.uuid || '',
        booking_taken: booking?.booking_taken || 0,
        table_lock: false,
        status: bookingStatus,
        table_ids: booking?.table ? [booking.table[0].id] : [],
        no_limit: false,
        floor_id: booking?.floor_id || 0,
        end_date: formatDate(now),
        id: booking?.id || 0,
        created_at: '',
        finished_date: status === 'finished' ? formatDate(now) : '',
        guest: booking?.guest || selectedGuest,
        table: booking?.table || [],
        party_size: booking?.party_size || 1,
        shift_id: 1,
        type: 1
      };

      const bookingResponse = await createBooking(params);

      if (bookingResponse) {
        toast({
          title: 'Booking Updated',
          description: `Booking status updated to ${status}.`,
          variant: 'success'
        });

        setShowBookingStatusSelectionModal(false);
        setShowGuestSelectionModal(false);
        setSelectedGuest(null);

        // Close payment modal and ProductAndOrder
        if (onPaymentComplete) {
          onPaymentComplete();
        }
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Booking Update Failed',
        description: 'Failed to update booking status.',
        variant: 'destructive'
      });
    }
  };

  // Split payment handlers
  const handleSplitPaymentClick = () => {
    // Just switch to split payment mode - don't set split state yet
    setOptionMode('split-payment');
  };

  const handleSplitItemPayment = (
    paymentMethod: 'cash' | 'card' | 'account',
    feeCreditType: 'amex' | 'domestic',
    amount: number,
    splitNumber: number,
    surchargeAmount: number
  ) => {
    // Prevent adding payment to a split that already has a payment
    const hasPayment = paymentState.payments.some(
      (p) => p.id === `split-${splitNumber}`
    );
    if (hasPayment) {
      toast({
        title: 'Error',
        description: `Split #${splitNumber} already has a payment.`,
        variant: 'destructive'
      });
      return;
    }

    const newCurrentPayment = {
      ...paymentState.currentPayment,
      paymentMethod: paymentMethod,
      paymentRef: paymentMethod, // Use paymentMethod as paymentRef
      amount: amount,
      feeCreditType: feeCreditType,
      surchargeAmount: surchargeAmount,
      surchargePercentage: '' // Set as empty string or correct string value if needed
    };

    const newPaymentState = {
      ...paymentState,
      currentPayment: newCurrentPayment
    };

    addPayment(newPaymentState);
    resetNumberPad();
  };

  // Helper to find the first unpaid split with items
  function getFirstUnpaidSplitNumber(
    itemSplits: SplitItemAssignments,
    paymentState: PaymentState
  ) {
    for (let i = 1; i <= paymentState.splitCount; i++) {
      const hasItems = itemSplits[i] && itemSplits[i].length > 0;
      const hasPayment = paymentState.payments.some(
        (p: any) => p.id === `split-${i}`
      );
      if (hasItems && !hasPayment) {
        return i;
      }
    }
    return null;
  }

  // Handler for split item mode
  function handleCardSplitItemMode(
    surcharge: CardSurcharge,
    feeCreditType: 'amex' | 'domestic'
  ) {
    const unpaidSplitNumber = getFirstUnpaidSplitNumber(
      itemSplits,
      paymentState
    );
    if (!unpaidSplitNumber) {
      toast({
        title: 'Error',
        description: 'All splits are already paid.',
        variant: 'destructive'
      });
      return;
    }
    const splitTotal = getSplitTotal(itemSplits, unpaidSplitNumber);
    const surchargeRate = parseFloat(surcharge.value) / 100;
    const totalAmount = +(splitTotal * (1 + surchargeRate)).toFixed(2);
    const surchargeAmount = +(splitTotal * surchargeRate).toFixed(2);
    handleSplitItemPayment(
      'card',
      feeCreditType,
      totalAmount,
      unpaidSplitNumber,
      surchargeAmount
    );
  }

  // Handler for split bill mode
  function handleCardSplitBillMode(
    surcharge: CardSurcharge,
    feeCreditType: 'amex' | 'domestic'
  ) {
    // In split bill mode: calculate remaining amount for current split
    const totalSplitAmount = paymentState.finalTotal;
    const preSplitPaidAmount = paymentState.payments
      .filter((payment) => !payment.id?.startsWith('split-'))
      .reduce((sum, payment) => sum + payment.amount, 0);
    const amountToSplit = Math.max(0, totalSplitAmount - preSplitPaidAmount);
    const splitAmount = amountToSplit / paymentState.splitCount;
    // Find the current active split and calculate remaining amount for that split
    let currentSplitNumber = 1;
    for (let i = 1; i <= paymentState.splitCount; i++) {
      const splitPayments = paymentState.payments.filter(
        (p) => p.id === `split-${i}`
      );
      const totalPaidForSplit = splitPayments.reduce(
        (sum, p) => sum + p.amount,
        0
      );
      if (totalPaidForSplit < splitAmount - 0.01) {
        currentSplitNumber = i;
        break;
      }
    }
    // Calculate remaining amount for the current split
    const currentSplitPayments = paymentState.payments.filter(
      (p) => p.id === `split-${currentSplitNumber}`
    );
    const totalPaidForCurrentSplit = currentSplitPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );
    const remainingForCurrentSplit = Math.max(
      0,
      splitAmount - totalPaidForCurrentSplit
    );
    const surchargeRate = parseFloat(surcharge.value) / 100;
    const surchargeAmount = remainingForCurrentSplit * surchargeRate;
    const totalAmount = remainingForCurrentSplit + surchargeAmount;
    // Build currentPayment object for automatic split distribution
    const newCardCurrentPayment = {
      ...paymentState.currentPayment,
      paymentMethod: 'card' as const,
      paymentRef: surcharge.name,
      amount: totalAmount,
      feeCreditType: feeCreditType,
      surchargeAmount: surchargeAmount,
      surchargePercentage: surcharge.value
    };
    const cardPaymentState: PaymentState = {
      ...paymentState,
      currentPayment: newCardCurrentPayment
    };
    addPayment(cardPaymentState);
    if (cashAmount && parseFloat(cashAmount) > 0) {
      resetNumberPad();
    }
  }

  // Handler for normal mode
  function handleCardNormalMode(
    surcharge: CardSurcharge,
    feeCreditType: 'amex' | 'domestic'
  ) {
    let baseAmount: number;
    if (cashAmount && parseFloat(cashAmount) > 0) {
      baseAmount = parseFloat(cashAmount);
    } else {
      baseAmount = paymentState.remainingAmount;
    }
    const surchargeRate = parseFloat(surcharge.value) / 100;
    const surchargeAmount = baseAmount * surchargeRate;
    const totalAmount = baseAmount + surchargeAmount;
    const newCardCurrentPayment = {
      ...paymentState.currentPayment,
      paymentMethod: 'card' as const,
      paymentRef: surcharge.name,
      amount: totalAmount,
      feeCreditType: feeCreditType,
      surchargeAmount: surchargeAmount,
      surchargePercentage: surcharge.value
    };
    const cardPaymentState: PaymentState = {
      ...paymentState,
      currentPayment: newCardCurrentPayment
    };
    addPayment(cardPaymentState);
    if (cashAmount && parseFloat(cashAmount) > 0) {
      resetNumberPad();
    }
  }

  useEffect(() => {
    if (selectedGuest) {
      handleAccountPayment();
    }
  }, [selectedGuest]);

  return (
    <div className="flex w-full flex-col items-center justify-center">
      {/* Display Cash Amount */}
      {paymentState.splitCount < 2 && (
        <div
          className="absolute right-4 top-4 cursor-pointer text-right font-semibold"
          onClick={handleSplitPaymentClick}
        >
          Split Payment
        </div>
      )}
      <div className="mb-4 w-full rounded border border-white px-4 py-2 text-left text-4xl text-white">
        $
        {formatDisplayAmount(
          paymentState.currentPayment.paymentMethod === 'split' &&
            paymentState.currentPayment.amount > 0 &&
            !cashAmount
            ? paymentState.currentPayment.amount.toString()
            : cashAmount
        )}
      </div>

      {/* Cash and Static Payment Options */}
      <div className="mb-6 flex max-h-80 w-full flex-nowrap gap-2 overflow-x-auto">
        {/* Static Payment Methods */}
        {[
          { label: 'Cash Payment', method: 'cash' },
          { label: 'On Account', method: 'account' },
          { label: 'Payment Link', method: 'card' }
        ].map((method) => (
          <Button
            key={method.label}
            className="flex h-20 w-32 shrink-0 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-primary"
            disabled={
              (method.method === 'account' && paymentState.splitCount > 1) ||
              (method.method === 'card' && paymentState.splitCount > 1) ||
              (method.method === 'card' && paymentState.payments.length > 0) ||
              showPaymentLinkModal || // Disable all buttons when payment link modal is showing
              (method.method === 'cash' &&
                (!cashAmount || parseFloat(cashAmount) <= 0)) ||
              (method.method === 'card' && isCreatingPaymentLink)
            }
            onClick={() => {
              if (method.method === 'card') {
                // Show confirmation modal first
                setShowPaymentLinkConfirmModal(true);
              }

              if (method.method === 'cash') {
                // Build currentPayment object for automatic split distribution
                const newCurrentPayment = {
                  ...paymentState.currentPayment,
                  paymentMethod: 'cash' as const,
                  paymentRef: method.label,
                  amount: parseFloat(cashAmount || '0'),
                  surchargeAmount: 0
                };

                const cashPaymentState: PaymentState = {
                  ...paymentState,
                  currentPayment: newCurrentPayment
                };

                addPayment(cashPaymentState);
                resetNumberPad();
              }

              if (method.method === 'account') {
                // Show guest selection modal
                setShowGuestSelectionModal(true);
              }
            }}
          >
            {method.method === 'card' && isCreatingPaymentLink ? (
              <Icons.spinner className="h-5 w-5 animate-spin" />
            ) : (
              <span className="text-md font-semibold">{method.label}</span>
            )}
          </Button>
        ))}

        {/* Dynamic Card Surcharges */}
        {posCardSurcharges
          .filter((surcharge) => surcharge.status === 1) // Only show active surcharges
          .map((surcharge) => (
            <Button
              key={surcharge.id}
              className="flex h-20 w-32 shrink-0 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-primary"
              onClick={() => {
                const feeCreditType = surcharge.name
                  .toLowerCase()
                  .includes('amex')
                  ? ('amex' as const)
                  : ('domestic' as const);
                if (
                  paymentState.splitType === 'item' &&
                  paymentState.splitCount > 1
                ) {
                  handleCardSplitItemMode(surcharge, feeCreditType);
                  return;
                }
                if (
                  paymentState.splitType === 'amount' &&
                  paymentState.splitCount > 1
                ) {
                  handleCardSplitBillMode(surcharge, feeCreditType);
                  return;
                }
                handleCardNormalMode(surcharge, feeCreditType);
              }}
            >
              <span className="text-md font-semibold">{surcharge.name}</span>
              <span className="text-sm text-gray-300">
                ({surcharge.value}%)
              </span>
            </Button>
          ))}

        {/* Only show scan dialog if gift card hasn't been redeemed */}
        {!isGiftCardRedeemed && (
          <ScanDialog
            dialogOpen={scanDialogOpen}
            setDialogOpen={setScanDialogOpen}
            handleScanTicketClick={handleScanTicketClick}
            cameraError={cameraError}
            hasCameraPermission={hasCameraPermission}
            availableCameras={availableCameras}
            handleScan={handleScan}
            handleError={handleError}
            isPaymentModal={true}
          />
        )}
      </div>

      {/* Payment Link Confirmation Modal */}
      <Dialog
        open={showPaymentLinkConfirmModal}
        onOpenChange={setShowPaymentLinkConfirmModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Payment Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to create a payment link for this order?
              This will generate a link that the customer can use to pay online.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPaymentLinkConfirmModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowPaymentLinkConfirmModal(false);
                setShowPaymentLinkModal(true);
                handleCreatePaymentLink();
              }}
              className="flex-1"
            >
              Create Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guest Selection Modal */}
      <AllGuestsModal
        isOpenAllGuestsModal={showGuestSelectionModal}
        setIsOpenAllGuestsModal={setShowGuestSelectionModal}
        changeGuest={(guest) => {
          setSelectedGuest(guest);
          setShowGuestSelectionModal(false);

          // Show set on account button
          toast({
            title: 'Guest Selected',
            description: `${guest.first_name} ${guest.last_name} selected for on-account payment.`,
            variant: 'success'
          });
        }}
      />

      {/* Booking Status Selection Modal */}
      <Dialog open={showBookingStatusSelectionModal} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Transaction Completed Successfully!
            </DialogTitle>
            <DialogDescription>
              The on-account transaction has been processed. Please choose the
              booking status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Button
                onClick={() => handleBookingStatusSelection('billed')}
                variant="outline"
                className="w-full justify-start gap-3 py-6"
              >
                <div className="rounded-full bg-blue-100 p-2">
                  <Icons.invoice className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Mark as Billed</div>
                  <div className="text-sm text-muted-foreground">
                    Order is completed and billed to account
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleBookingStatusSelection('finished')}
                variant="outline"
                className="w-full justify-start gap-3 py-6"
              >
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Mark as Finished</div>
                  <div className="text-sm text-muted-foreground">
                    Order is completed and guest has left
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Status Choice Dialog */}
      <Dialog open={showBookingStatusDialog} onOpenChange={() => {}}>
        <DialogContentWithoutClose
          className="max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Payment Completed Successfully!
            </DialogTitle>
            <DialogDescription>
              The payment has been processed. Please choose how you would like
              to handle this booking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Button
                onClick={() => handleUpdateBookingStatus('billed')}
                disabled={isUpdatingBookingStatus}
                className="h-auto w-full justify-start gap-3 py-4"
                variant="outline"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold">Mark as Billed</div>
                  <div className="text-sm text-gray-600">
                    Keep the booking active but mark it as billed
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleUpdateBookingStatus('finished')}
                disabled={isUpdatingBookingStatus}
                className="h-auto w-full justify-start gap-3 py-4"
                variant="outline"
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold">Mark as Finished</div>
                  <div className="text-sm text-gray-600">
                    Complete the booking and free up the table
                  </div>
                </div>
              </Button>
            </div>

            {isUpdatingBookingStatus && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating booking status...
              </div>
            )}
          </div>
        </DialogContentWithoutClose>
      </Dialog>

      {/* Payment Link Modal */}
      <Dialog open={showPaymentLinkModal} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {!generatedPaymentLink ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  Creating Payment Link
                </>
              ) : paymentStatus === 'completed' ? (
                <>
                  <Icons.check className="h-5 w-5 text-green-600" />
                  Payment Completed!
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-blue-600" />
                  Payment Link Ready
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {!generatedPaymentLink
                ? 'Please wait while we create your payment link...'
                : paymentStatus === 'completed'
                ? 'Payment has been successfully processed.'
                : 'Share the QR code or link with your customer. This window will close automatically when payment is received.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Loading State */}
            {!generatedPaymentLink && (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-gray-600">Creating payment link...</span>
              </div>
            )}

            {/* QR Code and Payment Link */}
            {generatedPaymentLink && (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
                    <Canvas
                      text={generatedPaymentLink}
                      options={{
                        errorCorrectionLevel: 'M',
                        type: 'image/jpeg',
                        quality: 0.92,
                        margin: 3,
                        color: {
                          dark: '#000000',
                          light: '#FFFFFF'
                        },
                        width: 192
                      }}
                    />
                  </div>

                  {/* Payment Status */}
                  <div className="flex items-center gap-2">
                    {paymentStatus === 'pending' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="font-medium text-blue-800">
                          Waiting for payment...
                        </span>
                      </>
                    ) : (
                      <>
                        <Icons.check className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">
                          Payment completed!
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Payment Link Actions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={generatedPaymentLink}
                      readOnly
                      placeholder="Payment link..."
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPaymentLink}
                      className="px-3"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={() => window.open(generatedPaymentLink, '_blank')}
                    className="w-full"
                    variant="secondary"
                  >
                    Open Payment Link
                  </Button>
                </div>
              </div>
            )}

            {/* Discount Information */}
            {(() => {
              const redeemAmount = paymentState.payments
                .filter((payment) => payment.paymentType === 3)
                .reduce((sum, payment) => sum + payment.amount, 0);

              return (
                (paymentState.discount > 0 || redeemAmount > 0) &&
                paymentType === 'checkout_session' && (
                  <div className="rounded border border-green-300 bg-green-50 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Icons.check className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        Auto Discounts Applied
                      </span>
                    </div>
                    <div className="text-sm text-green-700">
                      {paymentState.discount > 0 &&
                        `$${paymentState.discount.toFixed(2)} discount`}
                      {paymentState.discount > 0 && redeemAmount > 0 && ' + '}
                      {redeemAmount > 0 &&
                        `$${redeemAmount.toFixed(2)} gift card redeem`}{' '}
                      will be automatically applied
                    </div>
                  </div>
                )
              );
            })()}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCancelPaymentLink}
                variant="outline"
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel & Choose Different Payment
              </Button>
            </div>

            {/* Instructions */}
            {generatedPaymentLink && (
              <div className="rounded bg-gray-50 p-3 text-center">
                <p className="text-sm text-gray-600">
                  <strong>Show QR code to customer</strong> or share the payment
                  link. This window will automatically close when payment is
                  received.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Number Pad */}
      <NumberPad handleCalculatorInput={handleCalculatorInput} />
    </div>
  );
};

export default DefaultPaymentMode;

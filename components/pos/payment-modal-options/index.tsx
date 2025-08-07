import { CreditCard, Loader2, SplitSquareVertical, User } from 'lucide-react';
import SplitTypeSelector from '../SplitTypeSelector';
import { Button } from '../../ui/button';
import SplitPaymentMode from './split-payment-mode';
import ConsolidatedPaymentSummary from './consolidated-payment-summary';
import { useEffect, useRef, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { toast } from '../../ui/use-toast';
import { Dialog, DialogContent, DialogTitle } from '../../ui/dialog';
import {
  OrderProduct,
  PaymentOptionMode,
  SurchargeItem,
  CardSurcharge,
  PaymentEntry,
  SplitItemAssignments,
  AddOn
} from '@/types';
import TipMode from './tip-mode';
import DiscountMode from './discount-mode';
import SurchargeMode from './surcharge-mode';
import CustomAmountMode from './custom-amount-mode';
import DefaultPaymentMode from './default-payment-mode';
import { UsePaymentStateReturn } from '@/hooks/usePaymentState';
import { v4 as uuid } from 'uuid';

interface PaymentModalOptionsProps {
  loading: boolean;
  handleSubmitPayment: () => void;
  paymentItems: OrderProduct[];
  setSelectedSurcharges: React.Dispatch<React.SetStateAction<SurchargeItem[]>>;
  filteredSurcharges: SurchargeItem[];
  optionMode: PaymentOptionMode;
  setOptionMode: (val: PaymentOptionMode) => void;
  selectedSurcharges: SurchargeItem[];
  paymentHelpers: UsePaymentStateReturn;
  posCardSurcharges: CardSurcharge[];
  session?: any;
  booking?: any;
  tableId?: string;
  guestName?: string;
  onPaymentComplete?: () => void;
  close: () => void;
  setAddItemToSplitCallback?: React.Dispatch<
    React.SetStateAction<
      ((item: any, quantity: number, splitNumber?: number) => void) | null
    >
  >;
  itemSplits: SplitItemAssignments;
  setItemSplits: React.Dispatch<React.SetStateAction<SplitItemAssignments>>;
}
export const PaymentModalOptions = ({
  loading,
  handleSubmitPayment,
  setSelectedSurcharges,
  paymentItems,
  optionMode,
  setOptionMode,
  filteredSurcharges,
  selectedSurcharges,
  paymentHelpers,
  posCardSurcharges,
  session,
  booking,
  tableId,
  guestName,
  onPaymentComplete,
  close,
  setAddItemToSplitCallback,
  itemSplits,
  setItemSplits
}: PaymentModalOptionsProps) => {
  const {
    paymentState,
    setPaymentState,
    setShowCalculator,
    cashAmount,
    handleAdditionalChargeChange,
    resetNumberPad,
    getChangeAmount
  } = paymentHelpers;
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );

  const [hasCameraPermission, setHasCameraPermission] =
    useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((device) => device.kind === 'videoinput');
      setAvailableCameras(cameras);
    });
  }, []);
  const { scanReferenceCode, redeemGiftCard } = useApi();
  const isScanInProgress = useRef(false);
  const [isConfirmationReset, setIsConfirmationReset] =
    useState<boolean>(false);

  // Add confirmation modal state for split payment cancellation
  const [showSplitCancelModal, setShowSplitCancelModal] =
    useState<boolean>(false);

  // Split payment state
  const [splitStep, setSplitStep] = useState<
    'select-type' | 'select-number' | 'select-split'
  >('select-type');
  const [splitType, setSplitType] = useState<'bill' | 'item' | null>(null);
  const [numberOfSplits, setNumberOfSplits] = useState<number>(0);

  // Split item specific state
  const [currentSplitNumber, setCurrentSplitNumber] = useState<number>(1);

  // Split payment handlers
  const handleSplitTypeSelection = (type: 'bill' | 'item') => {
    setSplitType(type);
    // Both Split Bill and Split Item go to number selection
    setSplitStep('select-number');
  };

  const handleNumberOfSplitsSelection = (number: number) => {
    setNumberOfSplits(number);

    // Set up split payment state based on split type
    setPaymentState((prev) => {
      // If there are existing payments, assign them to Split #1
      let updatedPayments = prev.payments;
      if (prev.payments.length > 0) {
        updatedPayments = prev.payments.map((payment, index) => ({
          ...payment,
          id: index === 0 ? 'split-1' : payment.id || `payment-${index}`
        }));
      }

      return {
        ...prev,
        payments: updatedPayments,
        currentPayment: {
          ...prev.currentPayment,
          paymentMethod: 'split'
        },
        splitType: splitType === 'item' ? 'item' : 'amount',
        splitCount: number
      };
    });

    // For Split Item: go back to default mode to show plus buttons
    // For Split Bill: stay in split-payment mode to show left panel selection
    if (splitType === 'item') {
      setOptionMode('default');
    } else {
      // setSplitStep('select-split');
      setOptionMode('default');
    }
  };

  // Add item to current split
  const addItemToCurrentSplit = (
    item: any,
    quantity?: number,
    providedSplitNumber?: number
  ) => {
    // Use provided split number or fall back to current split number
    const splitNumber = providedSplitNumber || currentSplitNumber;

    // Calculate the correct price for the assigned quantity
    // Match the calculation logic from order summary
    const assignedPrice = item.price * (quantity || 1);
    // NOTE: addOn quantities here may not be accurate per split.
    // The source of truth is in payment-modal-order-summary.tsx.
    const addOns =
      item.addOns?.map((addon: AddOn) => ({
        ...addon,
        quantity: addon.quantity // This may not reflect per-split assignment
      })) || [];
    const addOnsTotal = addOns.reduce(
      (sum: number, addon: AddOn) => sum + addon.price * addon.quantity,
      0
    );
    const totalPrice = assignedPrice + addOnsTotal;
    setItemSplits((prev) => {
      const currentItems = prev[splitNumber] || [];
      return {
        ...prev,
        [splitNumber]: [
          ...currentItems,
          {
            splitItemId: uuid(),
            itemUuid: item.uuid,
            quantity: quantity || 1,
            itemTitle: item.title,
            itemPrice: item.price,
            addOns,
            price: assignedPrice, // Use correct price for assigned quantity
            totalPrice
          }
        ]
      };
    });

    // Update split count if needed
    setPaymentState((prev) => ({
      ...prev,
      splitCount: Math.max(prev.splitCount, splitNumber)
    }));

    // Update current split number to the next available split
    if (providedSplitNumber) {
      setCurrentSplitNumber(splitNumber);
    }
  };

  // Calculate total for current split
  const getCurrentSplitTotal = (splitNumber?: number) => {
    const targetSplit = splitNumber || currentSplitNumber;
    const currentItems = itemSplits[targetSplit] || [];
    return currentItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  // Handle payment for current split (same as split bill)
  const handleSplitItemPayment = (
    paymentMethod: string,
    cardType?: string,
    amount?: number,
    targetSplitNumber?: number
  ) => {
    // Use target split number or fall back to current split number
    const targetSplit = targetSplitNumber || currentSplitNumber;
    const splitTotal = getCurrentSplitTotal(targetSplit);

    if (splitTotal <= 0) {
      toast({
        title: 'No Items',
        description: 'Please add items to this split before making payment.',
        variant: 'destructive'
      });
      return;
    }

    // For card payments, amount already includes surcharge calculation
    const baseAmount =
      paymentMethod === 'card' && amount ? splitTotal : amount || splitTotal;
    const totalPaymentAmount = amount || splitTotal;
    const calculatedSurchargeAmount =
      paymentMethod === 'card' && amount
        ? totalPaymentAmount - splitTotal
        : paymentMethod === 'card'
        ? splitTotal * (cardType === 'amex' ? 0.029 : 0.019)
        : 0;

    // Create a payment for this split using the same logic as split bill
    const paid = +(amount || 0).toFixed(2);
    const total = +splitTotal.toFixed(2);
    const splitPayment: PaymentEntry = {
      id: `split-${targetSplit}`,
      paymentMethod: paymentMethod as 'cash' | 'card' | 'account' | 'redeem',
      amount: totalPaymentAmount,
      originalAmount: totalPaymentAmount,
      expectedAmount: splitTotal,
      change:
        paymentMethod === 'cash' && amount ? Math.max(0, paid - total) : 0,
      feeCreditType:
        paymentMethod === 'card'
          ? (cardType as 'domestic' | 'amex') || 'domestic'
          : undefined,
      surchargeAmount: calculatedSurchargeAmount,
      surchargePercentage:
        paymentMethod === 'card'
          ? cardType === 'amex'
            ? '2.9'
            : '1.9'
          : undefined,
      paymentRef:
        paymentMethod === 'card' ? (cardType === 'amex' ? 'Amex' : 'Card') : '',
      timestamp: new Date()
    };

    setPaymentState((prev) => {
      const allPayments = [...prev.payments, splitPayment];

      // Calculate total effective paid
      const totalEffectivePaid = allPayments.reduce((sum, payment) => {
        if ('paymentType' in payment && payment.paymentType === 3) return sum; // Skip gift cards
        return sum + payment.amount;
      }, 0);

      const newRemainingAmount = Math.max(
        0,
        prev.finalTotal - totalEffectivePaid
      );

      return {
        ...prev,
        payments: allPayments,
        remainingAmount: newRemainingAmount,
        currentPayment: {
          ...prev.currentPayment,
          paymentMethod: '',
          amount: 0
        }
      };
    });

    // Move to next split
    setCurrentSplitNumber((prev) => prev + 1);

    // Reset calculator
    resetNumberPad();

    toast({
      title: 'Payment Added',
      description: `Payment for Split #${targetSplit} completed. ${
        getCurrentSplitTotal() > 0
          ? 'Continue with next split.'
          : 'All items paid.'
      }`,
      variant: 'success'
    });
  };

  // Handle button click for payment methods
  const handleButtonClick = (method: string) => {
    if (method === 'split') {
      // Preserve existing payments when switching to split
      setPaymentState((prev) => ({
        ...prev,
        currentPayment: {
          ...prev.currentPayment,
          paymentMethod: 'split'
        },
        splitType: 'none',
        // Keep existing payments
        payments: prev.payments
      }));
    } else {
      // For other payment methods, handle as before
      if (method === 'card') {
        setPaymentState((prev) => ({
          ...prev,
          currentPayment: {
            ...prev.currentPayment,
            paymentMethod: 'card',
            feeCreditType: 'domestic'
          }
        }));
      } else if (method === 'cash') {
        setPaymentState((prev) => ({
          ...prev,
          currentPayment: {
            ...prev.currentPayment,
            paymentMethod: 'cash'
          }
        }));
        setShowCalculator(true);
      } else if (method === 'account') {
        setPaymentState((prev) => ({
          ...prev,
          currentPayment: {
            ...prev.currentPayment,
            paymentMethod: 'account'
          }
        }));
      } else if (method === 'more') {
        setPaymentState((prev) => ({
          ...prev,
          currentPayment: {
            ...prev.currentPayment,
            paymentMethod: 'more'
          }
        }));
      }
    }
  };

  // Set up split payment
  const setupSplitPayment = (
    type: 'none' | 'amount' | 'item',
    count: number = 1,
    items: any[] = []
  ) => {
    setPaymentState((prev) => ({
      ...prev,
      splitType: type,
      splitCount: count,
      splitItems: items,
      payments: prev.payments,
      currentPayment: {
        ...prev.currentPayment,
        paymentMethod: 'split'
      }
    }));
  };

  const handleScanTicketClick = () => {
    // Check if gift card has already been redeemed
    const isGiftCardRedeemed = paymentState.payments.some(
      (payment) => payment.paymentType === 3
    );

    if (isGiftCardRedeemed) {
      toast({
        title: 'Multiple Gift Cards Not Allowed',
        description: 'Only one gift card can be applied per transaction.',
        variant: 'destructive'
      });
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        setHasCameraPermission(true);
        setCameraError(null);
        setScanDialogOpen(true);
      })
      .catch((err) => {
        setCameraError('Camera access denied or error occurred.');
        setHasCameraPermission(false);
      });
  };

  const handleError = (error: any) => {
    console.error('QR Scanner Error:', error);
  };

  const [redeemAmount, setredeemAmount] = useState<number>(0);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [confirmUseGiftCardDialogOpen, setConfirmUseGiftCardDialogOpen] =
    useState(false);
  const [pendingGiftCardCode, setPendingGiftCardCode] = useState<string | null>(
    null
  );

  const [isRedeemed, setIsRedeemed] = useState(false);
  const handleScan = async (data: any) => {
    if (data && !isScanInProgress.current) {
      isScanInProgress.current = true;
      try {
        const response = await scanReferenceCode(data.text);
        const isRedeemed =
          response.data.gift_card_purchase_details[0].gift_cards[0].is_redeemed;
        if (isRedeemed) {
          setIsRedeemed(true);
          isScanInProgress.current = false;
          setScanDialogOpen(false);
          return;
        }
        setredeemAmount(Number(response.data.total_amount));
        if (response.code === 'OK') {
          setScannedCode(
            response.data.gift_card_purchase_details[0].gift_cards[0].code
          );
          setConfirmUseGiftCardDialogOpen(true);
          toast({
            title: 'Ticket Scanned',
            description: 'Ticket Scanned Successfully',
            variant: 'success'
          });
        }
      } catch (error) {
        toast({
          title: 'Scan Error',
          description: 'Failed to process the scanned code.',
          variant: 'destructive'
        });
      } finally {
        isScanInProgress.current = false;
        setScanDialogOpen(false);
      }
    }
  };

  const handleUseGiftCard = async (code: string) => {
    try {
      // Just apply the credit as a payment entry instead of redeem field
      const giftCardPayment = {
        id: uuid(),
        paymentMethod: 'redeem' as const,
        amount: redeemAmount,
        expectedAmount: redeemAmount,
        change: 0,
        surchargeAmount: 0,
        paymentRef: code,
        timestamp: new Date(),
        paymentType: 3 // Gift card redemption
      };

      // Add gift card as a payment entry - let the existing logic calculate remainingAmount
      setPaymentState((prev) => ({
        ...prev,
        payments: [...prev.payments, giftCardPayment]
      }));

      setPendingGiftCardCode(code);
      setConfirmUseGiftCardDialogOpen(false);
      setScannedCode(null);

      toast({
        title: 'Gift Card Applied',
        description: `Gift card credit of $${redeemAmount.toFixed(
          2
        )} applied successfully!`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Error applying gift card:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply gift card.',
        variant: 'destructive'
      });
    }
  };

  const redeemPendingGiftCard = async () => {
    if (!pendingGiftCardCode) return true; // No gift card to redeem

    try {
      const response = await redeemGiftCard(pendingGiftCardCode);
      if (response.code === 'OK') {
        toast({
          title: 'Gift Card Redeemed',
          description: 'Gift card has been successfully redeemed!',
          variant: 'success'
        });
        setPendingGiftCardCode(null); // Clear the pending code
        return true;
      } else {
        toast({
          title: 'Gift Card Redemption Failed',
          description: response.message || 'Failed to redeem gift card.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('Error redeeming gift card:', error);
      toast({
        title: 'Gift Card Redemption Failed',
        description: 'Failed to redeem gift card.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const isCompletedPayment =
    paymentState.remainingAmount <= 0 && paymentState.payments.length > 0;

  // Check if this was a split payment completion
  const isSplitPaymentComplete =
    isCompletedPayment &&
    paymentState.payments.some((payment) => payment.id?.startsWith('split-'));

  useEffect(() => {
    if (isCompletedPayment) {
      if (isSplitPaymentComplete) {
        setOptionMode('split-finish');
      } else {
        setOptionMode('finish');
      }
    } else {
      // Handle revert cases
      if (optionMode === 'split-finish' || optionMode === 'finish') {
        // If we were in finish mode but payment is no longer complete
        // Always go back to default mode to let user choose what to do next
        setOptionMode('default');
      }
    }
  }, [
    isCompletedPayment,
    isSplitPaymentComplete,
    optionMode,
    paymentState.splitType
  ]);

  const handleBackButtonClick = () => {
    if (optionMode === 'finish' || optionMode === 'split-finish') {
      setIsConfirmationReset(true);
    } else {
      setOptionMode('default');
    }
  };

  // Handle split payment cancellation
  const handleCancelSplitPayment = () => {
    // Reset split payment state
    setPaymentState((prev) => ({
      ...prev,
      splitType: 'none',
      splitCount: 0,
      splitItems: [],
      currentPayment: {
        ...prev.currentPayment,
        paymentMethod: '',
        id: undefined
      }
    }));

    // Also reset split item assignments
    setItemSplits({});

    // Reset split UI state
    setSplitStep('select-type');
    setSplitType(null);
    setNumberOfSplits(0);

    // Close modal and close the entire payment modal
    setShowSplitCancelModal(false);
    // close();
  };

  // Handle close with split confirmation
  const handleCloseWithSplitCheck = () => {
    if (paymentState.splitCount > 1) {
      setShowSplitCancelModal(true);
    } else {
      setPaymentState((prev) => ({
        ...prev,
        tip: 0,
        tipRate: 0,
        discount: 0,
        surcharges: [],
        customAmounts: []
      }));
      setTimeout(() => {
        close();
      }, 0);
    }
  };

  // Register the addItemToCurrentSplit function with the parent component
  useEffect(() => {
    if (setAddItemToSplitCallback) {
      setAddItemToSplitCallback(() => addItemToCurrentSplit);
    }
  }, [setAddItemToSplitCallback]);

  // Helper to find the first unpaid split with items
  function getFirstUnpaidSplitNumber(
    itemSplits: SplitItemAssignments,
    paymentState: any
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
  return (
    <div className="relative flex w-full flex-col items-center justify-center border-l border-white p-4 md:w-1/2 lg:w-1/2">
      {loading && (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {/* Default */}
      {optionMode === 'default' && (
        <DefaultPaymentMode
          paymentHelpers={{
            ...paymentHelpers,
            // Override addPayment for split item mode
            addPayment: (overrideState?: any) => {
              const currentState = overrideState || paymentState;
              if (currentState.splitType === 'item') {
                if (currentState.currentPayment.paymentMethod === 'cash') {
                  const targetSplit = getFirstUnpaidSplitNumber(
                    itemSplits,
                    currentState
                  );
                  if (!targetSplit) {
                    toast({
                      title: 'Error',
                      description: 'All splits are already paid.',
                      variant: 'destructive'
                    });
                    return;
                  }
                  const cashAmountValue = parseFloat(cashAmount || '0');
                  handleSplitItemPayment(
                    'cash',
                    undefined,
                    cashAmountValue,
                    targetSplit
                  );
                  setShowCalculator(false);
                  return;
                } else if (
                  currentState.currentPayment.paymentMethod === 'card'
                ) {
                  const targetSplit = getFirstUnpaidSplitNumber(
                    itemSplits,
                    currentState
                  );
                  if (!targetSplit) {
                    toast({
                      title: 'Error',
                      description: 'All splits are already paid.',
                      variant: 'destructive'
                    });
                    return;
                  }
                  handleSplitItemPayment(
                    'card',
                    currentState.currentPayment.feeCreditType,
                    currentState.currentPayment.amount,
                    targetSplit
                  );
                  return;
                }
              }
              paymentHelpers.addPayment(overrideState);
            }
          }}
          posCardSurcharges={posCardSurcharges}
          scanDialogOpen={scanDialogOpen}
          setScanDialogOpen={setScanDialogOpen}
          availableCameras={availableCameras}
          hasCameraPermission={hasCameraPermission}
          cameraError={cameraError}
          handleScanTicketClick={handleScanTicketClick}
          handleScan={handleScan}
          handleError={handleError}
          paymentItems={paymentItems}
          session={session}
          booking={booking}
          tableId={tableId}
          guestName={guestName}
          onPaymentComplete={onPaymentComplete}
          setOptionMode={setOptionMode}
          splitStep={splitStep}
          setSplitStep={setSplitStep}
          itemSplits={itemSplits}
        />
      )}

      {/* Tip */}
      {optionMode === 'tip' && (
        <TipMode
          handleAdditionalChargeChange={handleAdditionalChargeChange}
          setOptionMode={setOptionMode}
        />
      )}

      {/* Discount */}
      {optionMode === 'discount' && (
        <DiscountMode
          originalTotal={paymentState.originalTotal}
          handleAdditionalChargeChange={handleAdditionalChargeChange}
          setOptionMode={setOptionMode}
        />
      )}

      {/* Surcharge */}
      {optionMode === 'surcharge' && (
        <SurchargeMode
          filteredSurcharges={filteredSurcharges}
          setSelectedSurcharges={setSelectedSurcharges}
          setOptionMode={setOptionMode}
          selectedSurcharges={selectedSurcharges}
        />
      )}
      {/* Custom Amount */}
      {optionMode === 'custom-amount' && (
        <CustomAmountMode
          setOptionMode={setOptionMode}
          paymentHelpers={paymentHelpers}
        />
      )}

      {/* Split Payment */}
      {optionMode === 'split-payment' && (
        <SplitPaymentMode
          splitStep={splitStep}
          setSplitStep={setSplitStep}
          splitType={splitType}
          setSplitType={setSplitType}
          numberOfSplits={numberOfSplits}
          setNumberOfSplits={setNumberOfSplits}
          handleSplitTypeSelection={handleSplitTypeSelection}
          handleNumberOfSplitsSelection={handleNumberOfSplitsSelection}
          setOptionMode={setOptionMode}
        />
      )}

      {/* Split payment type selection */}
      {paymentState.currentPayment.paymentMethod === 'split' &&
        paymentState.splitType === 'none' && (
          <SplitTypeSelector
            onSelectSplitType={(type) =>
              setupSplitPayment(type === 'bill' ? 'amount' : 'item')
            }
          />
        )}

      {/* More payment options */}
      {paymentState.currentPayment.paymentMethod === 'more' && (
        <div className="flex w-3/4 flex-col items-center">
          <div className="grid w-full grid-cols-4 gap-4">
            <Button
              className="flex h-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-primary"
              onClick={() => handleButtonClick('card')}
            >
              <CreditCard size={24} />
              <span>Card</span>
            </Button>

            <Button
              onClick={() => handleButtonClick('account')}
              className="flex h-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-primary"
              disabled
            >
              <User size={24} />
              <span>On Account</span>
            </Button>
            <Button
              onClick={() => handleButtonClick('split')}
              className="flex h-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-primary"
            >
              <SplitSquareVertical size={24} />
              <span>Split Payment</span>
            </Button>
          </div>
        </div>
      )}

      {/* Split Payment complete view */}
      {optionMode === 'split-finish' && (
        <ConsolidatedPaymentSummary
          paymentState={paymentState}
          onPrintBill={() => {
            // Handle print bill functionality
            console.log('Print bill clicked');
          }}
          onFinish={async () => {
            // First redeem any pending gift card
            const giftCardRedeemed = await redeemPendingGiftCard();

            // Only proceed with payment submission if gift card redemption succeeded (or no gift card)
            if (giftCardRedeemed) {
              handleSubmitPayment();
            }
          }}
          getChangeAmount={getChangeAmount}
        />
      )}

      {/* Payment complete view */}
      {optionMode === 'finish' && (
        <div className="flex w-full flex-col items-center px-10">
          <div className="mb-6 w-full justify-between rounded-md border border-white px-8 py-4 text-2xl">
            {paymentState.payments.length > 0 &&
              (() => {
                const lastPayment =
                  paymentState.payments[paymentState.payments.length - 1];

                // Calculate total redeem amount from all gift card payments
                const totalRedeemAmount = paymentState.payments
                  .filter((payment) => payment.paymentType === 3)
                  .reduce((sum, payment) => sum + payment.amount, 0);

                return (
                  <>
                    {lastPayment.paymentMethod === 'card' && (
                      <div className="mb-4 border-b border-white pb-4">
                        <div className="flex justify-between">
                          <h2 className="font-semibold">Paid</h2>
                          <p className="font-semibold text-green">
                            ${lastPayment.amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="mt-1 flex justify-between text-base font-semibold text-muted-foreground">
                          <span>
                            {lastPayment.paymentRef || 'Card Payment'} Surcharge{' '}
                            {lastPayment.surchargePercentage}%
                          </span>
                          <span>${lastPayment.surchargeAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {totalRedeemAmount > 0 && (
                      <div className="mb-4 border-b border-white pb-4">
                        <div className="flex justify-between">
                          <h2 className="font-semibold">Gift Card</h2>
                          <p className="font-semibold text-green">
                            -${totalRedeemAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="mt-1 flex justify-between text-base font-semibold">
                          <span
                            className={
                              pendingGiftCardCode
                                ? 'text-orange-400'
                                : 'text-green-400'
                            }
                          >
                            {pendingGiftCardCode
                              ? 'Gift Card (Pending)'
                              : 'Gift Card Applied'}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

            {/* Show pending gift card info */}
            {pendingGiftCardCode && (
              <div className="mb-4 border-b border-orange-400 pb-4">
                <div className="flex justify-between">
                  <h2 className="font-semibold text-orange-300">
                    Gift Card (Pending)
                  </h2>
                  <p className="font-semibold text-orange-300">
                    -${redeemAmount.toFixed(2)}
                  </p>
                </div>
                <div className="mt-1 text-sm text-orange-200">
                  Will be redeemed when payment is finished
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <h2 className="font-semibold">Change</h2>
              <p className="font-semibold text-green">${getChangeAmount()}</p>
            </div>
          </div>
          <div className="flex w-full justify-around gap-6">
            <Button className="flex h-16 w-full border border-white bg-transparent text-lg text-white transition-all hover:bg-gray-800">
              Print Bill
            </Button>
            <Button
              onClick={async () => {
                // First redeem any pending gift card
                const giftCardRedeemed = await redeemPendingGiftCard();

                // Only proceed with payment submission if gift card redemption succeeded (or no gift card)
                if (giftCardRedeemed) {
                  handleSubmitPayment();
                }
              }}
              className="flex h-16 w-full border border-white bg-transparent text-lg text-white transition-all hover:bg-gray-800"
            >
              Finish
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isConfirmationReset} onOpenChange={setIsConfirmationReset}>
        <DialogContent>
          <DialogTitle>Confirmation</DialogTitle>
          <p>
            It seems that Total Due is zero. Would you like to cancel and remove
            all of the payments?
          </p>
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => {
                setIsConfirmationReset(false);
              }}
              variant={'secondary'}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsConfirmationReset(false);
                setPaymentState((prev) => {
                  return {
                    ...prev,
                    payments: [],
                    remainingAmount: prev.finalTotal
                  };
                });
                // Clear pending gift card when resetting payment
                setPendingGiftCardCode(null);
                setOptionMode('default');
              }}
              variant={'danger'}
            >
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRedeemed} onOpenChange={setIsRedeemed}>
        <DialogContent>
          <DialogTitle>Already Redeemed</DialogTitle>
          <p>This gift card has already been redeemed.</p>
          <Button
            onClick={() => {
              setIsRedeemed(false);
              setScannedCode(null);
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmUseGiftCardDialogOpen}
        onOpenChange={setConfirmUseGiftCardDialogOpen}
      >
        <DialogContent>
          <DialogTitle>Use Gift Card</DialogTitle>
          <p className="mb-6 ">Do you want to apply the scanned gift card?</p>
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => {
                if (scannedCode) {
                  handleUseGiftCard(scannedCode);
                }
                setConfirmUseGiftCardDialogOpen(false);
                setScannedCode(null);
              }}
              variant={'submit'}
            >
              Yes
            </Button>
            <Button
              onClick={() => {
                setConfirmUseGiftCardDialogOpen(false);
                setScannedCode(null);
                // Clear any pending gift card info when user says no
                setPendingGiftCardCode(null);
              }}
              variant={'danger'}
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Split Payment Cancel Confirmation Modal */}
      <Dialog
        open={showSplitCancelModal}
        onOpenChange={setShowSplitCancelModal}
      >
        <DialogContent>
          <DialogTitle>Confirmation</DialogTitle>
          <p>Do you want to cancel split payment?</p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowSplitCancelModal(false)}
              variant="outline"
              className=""
            >
              Cancel
            </Button>
            <Button onClick={handleCancelSplitPayment} variant={'danger'}>
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Back button */}
      {optionMode !== 'default' ? (
        <Button
          onClick={handleBackButtonClick}
          className="absolute bottom-5 right-5 rounded-full border border-foreground bg-background px-10  text-foreground"
        >
          <span>Back</span>
        </Button>
      ) : (
        <div className="absolute bottom-5 right-5">
          <Button
            onClick={handleCloseWithSplitCheck}
            className="rounded-full border border-foreground bg-background px-10  text-foreground"
          >
            <span>Back</span>
          </Button>
        </div>
      )}
    </div>
  );
};

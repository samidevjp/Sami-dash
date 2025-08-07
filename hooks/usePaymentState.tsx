import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { PaymentState, CustomAmount, PaymentEntry } from '@/types';
import { roundToTwoDecimals } from '@/lib/calc';

// Type for the usePaymentState hook return value
export interface UsePaymentStateReturn {
  paymentState: PaymentState;
  setPaymentState: React.Dispatch<React.SetStateAction<PaymentState>>;
  cashAmount: string;
  setCashAmount: React.Dispatch<React.SetStateAction<string>>;
  showCalculator: boolean;
  setShowCalculator: React.Dispatch<React.SetStateAction<boolean>>;
  rawCashInput: string;
  handleCurrentPaymentChange: (field: string, value: any) => void;
  handleAdditionalChargeChange: (
    field: keyof PaymentState,
    value: number
  ) => void;
  handleCalculatorInput: (input: string, field?: string) => void;
  handleCashAmountClick: (amount: string) => void;
  resetPaymentState: () => void;
  addPayment: (overrideState?: PaymentState) => void;
  resetNumberPad: () => void;
  getChangeAmount: () => string;
  calcTotalDue: () => string;
  addCustomAmount: (amount: number, note?: string) => void;
  removeCustomAmount: (id: string) => void;
}

export const usePaymentState = (initialTotal: number, items: any[]) => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    originalTotal: initialTotal,
    remainingAmount: initialTotal,
    tip: 0,
    tipRate: 0,
    discount: 0,
    surcharges: [],
    customAmounts: [],
    finalTotal: initialTotal,
    payments: [],
    currentPayment: {
      paymentMethod: '' as '' | 'cash' | 'card' | 'split' | 'account' | 'more',
      amount: initialTotal,
      feeCreditType: 'domestic' as 'domestic' | 'amex',
      surchargeAmount: 0,
      surchargePercentage: undefined,
      change: 0,
      paymentRef: ''
    },
    splitType: 'none' as 'none' | 'amount' | 'item',
    splitCount: 1,
    splitItems: [] as any[]
  });

  const [cashAmount, setCashAmount] = useState<string>('');
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [rawCashInput, setRawCashInput] = useState('');

  const handleCurrentPaymentChange = (field: string, value: any) => {
    setPaymentState((prev) => {
      const updated = { ...prev.currentPayment, [field]: value };
      if (
        field === 'paymentMethod' ||
        field === 'amount' ||
        field === 'feeCreditType'
      ) {
        if (updated.paymentMethod === 'card') {
          const rate = updated.feeCreditType === 'amex' ? 0.029 : 0.019;
          updated.surchargeAmount = parseFloat(
            (updated.amount * rate).toFixed(2)
          );
        } else {
          updated.surchargeAmount = 0;
        }
      }
      if (field === 'amount' && updated.paymentMethod === 'cash') {
        updated.change = roundToTwoDecimals(
          Math.max(0, updated.amount - prev.remainingAmount)
        );
      }

      return { ...prev, currentPayment: updated };
    });
  };

  const handleAdditionalChargeChange = (
    field: keyof PaymentState,
    value: number
  ) => {
    setPaymentState((prev) => {
      const customAmountsTotal = prev.customAmounts.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      // Calculate total redeem amount from payments with paymentType 3 (gift card)
      const redeemAmount = prev.payments
        .filter((payment) => payment.paymentType === 3)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const newFinalTotal =
        prev.originalTotal +
        (field === 'tip' ? value : prev.tip) -
        (field === 'discount' ? value : prev.discount) -
        redeemAmount +
        customAmountsTotal;

      return {
        ...prev,
        [field]: value,
        finalTotal: newFinalTotal,
        remainingAmount: roundToTwoDecimals(
          newFinalTotal -
            prev.payments.reduce((sum, payment) => sum + payment.amount, 0)
        )
      };
    });
  };

  const formatCashAmount = (raw: string) => {
    if (raw.length === 0) return '0.00';
    if (raw.length === 1) return `0.0${raw}`;
    if (raw.length === 2) return `0.${raw}`;
    const whole = raw.slice(0, -2);
    const decimal = raw.slice(-2);
    return `${parseInt(whole, 10)}.${decimal}`;
  };

  const handleCalculatorInput = (input: string, field: string = 'amount') => {
    setRawCashInput((prev) => {
      let next = prev;
      if (input === '<') {
        next = prev.slice(0, -1);
      } else if (/^\d$/.test(input)) {
        next = prev + input;
      }

      const formatted = formatCashAmount(next);
      setCashAmount(formatted);
      handleCurrentPaymentChange(field, parseFloat(formatted));
      return next;
    });
  };

  const handleCashAmountClick = (amount: string) => {
    if (amount === 'Custom') {
      setShowCalculator(true);
    } else {
      const value = parseFloat(amount.replace('$', ''));
      const newAmount = parseFloat(cashAmount || '0') + value;
      setCashAmount(newAmount.toString());
      if (paymentState.splitType === 'none') {
        handleCurrentPaymentChange('amount', newAmount);
      }
    }
  };

  // Helper function to properly initialize currentPayment after a payment is added
  const initializeCurrentPayment = (
    newRemainingAmount: number,
    splitType: 'none' | 'amount' | 'item',
    splitCount: number,
    allPayments: any[]
  ) => {
    // If payment is complete, clear everything
    if (newRemainingAmount <= 0.01) {
      return {
        paymentMethod: '' as const,
        amount: 0,
        feeCreditType: 'domestic' as const,
        surchargeAmount: 0,
        surchargePercentage: undefined,
        change: 0,
        paymentRef: ''
      };
    }

    // If in split mode, find next active split
    if (splitType === 'amount' && splitCount > 1) {
      // Calculate split amount
      const remainingToSplit = newRemainingAmount;
      const splitAmount = remainingToSplit / splitCount;

      // Find next unpaid split
      for (let i = 1; i <= splitCount; i++) {
        const splitPayments = allPayments.filter((p) => p.id === `split-${i}`);
        const splitPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);

        if (splitPaid < splitAmount - 0.01) {
          return {
            paymentMethod: 'split' as const,
            amount: 0, // Always reset to 0 after payment
            feeCreditType: 'domestic' as const,
            surchargeAmount: 0,
            surchargePercentage: undefined,
            change: 0,
            paymentRef: '',
            id: `split-${i}`
          };
        }
      }
    }

    // Default initialization for non-split or completed split
    return {
      paymentMethod: '' as const,
      amount: 0, // Always reset to 0 after payment
      feeCreditType: 'domestic' as const,
      surchargeAmount: 0,
      surchargePercentage: undefined,
      change: 0,
      paymentRef: ''
    };
  };

  const handleSplitPaymentDistribution = (current: PaymentState) => {
    const { currentPayment, splitCount, finalTotal, payments } = current;

    // Calculate remaining amount after pre-split payments
    const preSplitPaidAmount = payments
      .filter((payment) => !payment.id?.startsWith('split-'))
      .reduce((sum, payment) => sum + payment.amount, 0);
    const remainingToSplit = finalTotal - preSplitPaidAmount;
    const splitAmount = remainingToSplit / splitCount;

    let paymentAmount =
      currentPayment.paymentMethod === 'cash'
        ? parseFloat(cashAmount || '0')
        : currentPayment.amount;

    console.log('🔄 Auto split distribution:', {
      paymentAmount,
      splitAmount,
      splitCount,
      remainingToSplit
    });

    // Find the current active split (first unpaid split)
    let currentSplitNumber = 1;
    for (let i = 1; i <= splitCount; i++) {
      const splitPayments = payments.filter((p) => p.id === `split-${i}`);
      const splitEffectivePaid = splitPayments.reduce((sum, p) => {
        return sum + p.amount;
      }, 0);
      if (splitEffectivePaid < splitAmount - 0.01) {
        // Use small threshold for floating point
        currentSplitNumber = i;
        break;
      }
    }

    console.log('🎯 Starting with split:', currentSplitNumber);

    // Apply payment to current active split only
    const existingSplitPayments = payments.filter(
      (p) => p.id === `split-${currentSplitNumber}`
    );
    const alreadyPaidForSplit = existingSplitPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // For card payments, the paymentAmount already includes correct surcharge calculation
    // based on remaining amount, so we should use it as-is
    let effectivePaymentAmount: number;
    let changeAmount: number;

    if (currentPayment.paymentMethod === 'card') {
      // For card payments, use the calculated amount directly (it already accounts for remaining balance)
      effectivePaymentAmount = paymentAmount;
      changeAmount = 0; // Card payments should not have change
    } else {
      // For cash and other payments, calculate based on what's needed for the split
      const neededForSplit = Math.max(0, splitAmount - alreadyPaidForSplit);
      changeAmount = roundToTwoDecimals(
        Math.max(0, paymentAmount - neededForSplit)
      );
      effectivePaymentAmount = Math.min(paymentAmount, neededForSplit);
    }

    console.log(
      `💰 Split ${currentSplitNumber}: already paid $${alreadyPaidForSplit.toFixed(
        2
      )}, payment amount: $${paymentAmount.toFixed(
        2
      )}, effective: $${effectivePaymentAmount.toFixed(2)}`
    );

    console.log(
      `✅ Applying $${effectivePaymentAmount.toFixed(
        2
      )} to Split ${currentSplitNumber}, change: $${changeAmount.toFixed(2)}`
    );

    // Create single payment for current split
    const splitPayment = {
      id: `split-${currentSplitNumber}`,
      paymentMethod: currentPayment.paymentMethod,
      amount: effectivePaymentAmount,
      originalAmount: paymentAmount, // Store the actual amount paid
      expectedAmount: splitAmount,
      change: changeAmount,
      feeCreditType:
        currentPayment.paymentMethod === 'card'
          ? currentPayment.feeCreditType
          : undefined,
      surchargeAmount:
        currentPayment.paymentMethod === 'card'
          ? currentPayment.surchargeAmount // Use the surcharge as calculated in default-payment-mode
          : 0,
      surchargePercentage: currentPayment.surchargePercentage,
      paymentRef: currentPayment.paymentRef,
      timestamp: new Date()
    };

    const newPayments = [splitPayment];
    console.log('💸 Change amount:', changeAmount);

    setPaymentState((prev) => {
      const allPayments = [...prev.payments, ...newPayments];

      // Calculate total effective paid (amount is already effective)
      const totalEffectivePaid = allPayments.reduce((sum, payment) => {
        if ('paymentType' in payment && payment.paymentType === 3) return sum;
        // For split payments, amount is already the effective amount
        return sum + payment.amount;
      }, 0);

      const newRemainingAmount = roundToTwoDecimals(
        prev.finalTotal - totalEffectivePaid
      );

      return {
        ...prev,
        payments: allPayments,
        remainingAmount: newRemainingAmount,
        currentPayment: initializeCurrentPayment(
          0,
          prev.splitType,
          splitCount,
          allPayments
        )
      };
    });

    setCashAmount('');
    setRawCashInput('');
  };

  const resetPaymentState = () => {
    setPaymentState({
      ...paymentState,
      originalTotal: initialTotal,
      remainingAmount: initialTotal,
      finalTotal: initialTotal,
      tip: 0,
      discount: 0,
      customAmounts: [],
      payments: [],
      currentPayment: {
        paymentMethod: '',
        amount: initialTotal,
        feeCreditType: 'domestic',
        surchargeAmount: 0,
        surchargePercentage: undefined,
        change: 0,
        paymentRef: ''
      },
      splitType: 'none',
      splitCount: 1,
      splitItems: []
    });
    setCashAmount('');
    setRawCashInput('');
    setShowCalculator(false);
  };

  const addPayment = (overrideState?: PaymentState) => {
    const current = overrideState || paymentState;
    const {
      currentPayment,
      remainingAmount,
      payments,
      splitType,
      splitCount,
      splitItems
    } = current;

    // Don't add payment if amount is 0 or less
    if (currentPayment.amount <= 0) return;

    // If in split mode, handle automatic split payment distribution
    if (splitType === 'amount' && currentPayment.paymentMethod !== 'split') {
      handleSplitPaymentDistribution(current);
      return;
    }

    // Calculate the expected amount for this payment
    let expectedAmount = remainingAmount;

    // If we're in split mode, calculate the expected amount differently
    if (splitType === 'amount' && currentPayment.paymentMethod !== 'split') {
      expectedAmount = paymentState.finalTotal / splitCount;
    } else if (splitType === 'item') {
      expectedAmount = splitItems.reduce(
        (total: any, item: any) => total + item.price,
        0
      );
    }

    console.log('expectedAmount', expectedAmount);
    console.log('cashAmount', cashAmount);
    console.log('currentPayment.paymentMethod', current);

    // Calculate change for cash payments
    const change =
      currentPayment.paymentMethod === 'cash'
        ? parseFloat(cashAmount || '0') > expectedAmount
          ? roundToTwoDecimals(parseFloat(cashAmount || '0') - expectedAmount)
          : 0
        : 0;

    const newPayment = {
      id: currentPayment.id || uuid(),
      paymentMethod: currentPayment.paymentMethod,
      amount:
        currentPayment.paymentMethod === 'cash'
          ? parseFloat(cashAmount || '0')
          : currentPayment.paymentMethod === 'card'
          ? currentPayment.amount // Use full amount for card (includes surcharge)
          : Math.min(currentPayment.amount, expectedAmount),
      expectedAmount: expectedAmount,
      change: change,
      feeCreditType:
        currentPayment.paymentMethod === 'card'
          ? currentPayment.feeCreditType
          : undefined,
      surchargeAmount: currentPayment.surchargeAmount,
      surchargePercentage: currentPayment.surchargePercentage,
      paymentRef: currentPayment.paymentRef,
      timestamp: new Date(),
      // Store the items that were paid for in this payment
      items: splitType === 'item' ? [...splitItems] : undefined
    };

    // Calculate if all items have been paid for
    const allItemsPaid = () => {
      // Get all items that have been paid for already, including the current payment
      const paidItems = [
        ...payments.flatMap((payment) => payment.items || []),
        ...splitItems
      ];

      // Count how many of each item have been paid for
      const paidCounts = items.reduce((counts, item) => {
        const paidCount = paidItems.filter(
          (paidItem) => paidItem.id === item.id
        ).length;
        counts[item.id] = paidCount;
        return counts;
      }, {});

      // Check if all items have been paid for
      return items.every((item) => paidCounts[item.id] >= item.quantity);
    };

    // Check if all split payments are completed
    const isLastSplitPayment =
      splitType !== 'none' &&
      (splitType === 'amount'
        ? payments.length + 1 >= splitCount
        : allItemsPaid());

    setPaymentState((prev: any) => {
      // Calculate the new remaining amount based on finalTotal and all payments
      const allPayments = [...prev.payments, newPayment];

      // Calculate the effective payment amount toward the original total
      // Exclude gift card payments (paymentType: 3) since they're already accounted for in finalTotal
      const totalEffectivePaid = allPayments.reduce((sum, payment) => {
        // Skip gift card payments as they're already deducted from finalTotal
        if (payment.paymentType === 3) {
          return sum;
        }

        // For split payments, the amount field already contains the effective amount
        if (payment.id?.startsWith('split-')) {
          return sum + payment.amount;
        }

        // For non-split payments, apply the old logic
        if (payment.paymentMethod === 'cash') {
          // For cash: use actual amount paid toward the bill (excluding change)
          return (
            sum +
            Math.min(payment.amount, payment.expectedAmount || payment.amount)
          );
        } else if (payment.paymentMethod === 'card') {
          // For card: only count base amount, not surcharge (surcharge is extra fee)
          return sum + (payment.amount - (payment.surchargeAmount || 0));
        }
        // For other payment methods (account, etc.): use full amount
        return sum + payment.amount;
      }, 0);

      const newRemainingAmount = roundToTwoDecimals(
        prev.finalTotal - totalEffectivePaid
      );

      // Create the new state
      const finalSplitType = isLastSplitPayment ? 'none' : splitType;

      const newState = {
        ...prev,
        payments: allPayments,
        remainingAmount: newRemainingAmount,
        // Use centralized currentPayment initialization
        currentPayment: initializeCurrentPayment(
          newRemainingAmount,
          finalSplitType,
          splitCount,
          allPayments
        ),
        // If this is a split by item payment, clear the split items
        splitItems: splitType === 'item' ? [] : prev.splitItems,
        // Reset split type if this is the last payment
        splitType: finalSplitType
      };

      return newState;
    });

    // Reset cash amount and raw input
    setCashAmount('');
    setRawCashInput('');
  };

  const resetNumberPad = () => {
    setCashAmount('');
    setRawCashInput('');
  };

  const getChangeAmount = () => {
    // In split payment mode, don't show total change (it's already shown per split)
    if (paymentState.splitType !== 'none') {
      return '0.00';
    }

    const totalChange = paymentState.payments.reduce(
      (sum, payment) => sum + (payment.change || 0),
      0
    );
    return totalChange.toFixed(2);
  };
  const calcTotalDue = () => {
    // If remaining amount is already 0 or less, return 0
    if (paymentState.remainingAmount <= 0) {
      return '0.00';
    }

    const totalEffectivePaid = paymentState.payments.reduce((sum, payment) => {
      // Skip gift card payments as they're already deducted from finalTotal
      if (payment.paymentType === 3) {
        return sum;
      }

      // For split payments, the amount field already contains the effective amount
      if (payment.id?.startsWith('split-')) {
        return sum + payment.amount;
      }

      // For non-split payments, apply the old logic
      if (payment.paymentMethod === 'cash') {
        return (
          sum +
          Math.min(payment.amount, payment.expectedAmount || payment.amount)
        );
      } else if (payment.paymentMethod === 'card') {
        return sum + (payment.amount - (payment.surchargeAmount || 0));
      }
      return sum + payment.amount;
    }, 0);

    const calc = paymentState.finalTotal - totalEffectivePaid;

    if (calc <= 0) {
      return '0.00';
    } else {
      return calc.toFixed(2);
    }
  };

  const addCustomAmount = (amount: number, note: string = 'Custom Amount') => {
    const newCustomAmount: CustomAmount = {
      id: uuid(),
      amount,
      note
    };

    setPaymentState((prev) => {
      const newCustomAmounts = [...prev.customAmounts, newCustomAmount];
      const customAmountsTotal = newCustomAmounts.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      // Calculate total redeem amount from payments with paymentType 3 (gift card)
      const redeemAmount = prev.payments
        .filter((payment) => payment.paymentType === 3)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const newFinalTotal =
        prev.originalTotal +
        prev.tip -
        prev.discount -
        redeemAmount +
        customAmountsTotal;

      // Calculate effective payments (excluding surcharges for card payments)
      // Exclude gift card payments as they're already deducted from finalTotal
      const totalEffectivePaid = prev.payments.reduce((sum, payment) => {
        // Skip gift card payments as they're already deducted from finalTotal
        if (payment.paymentType === 3) {
          return sum;
        }

        // For split payments, the amount field already contains the effective amount
        if (payment.id?.startsWith('split-')) {
          return sum + payment.amount;
        }

        // For non-split payments, apply the old logic
        if (payment.paymentMethod === 'cash') {
          return (
            sum +
            Math.min(payment.amount, payment.expectedAmount || payment.amount)
          );
        } else if (payment.paymentMethod === 'card') {
          return sum + (payment.amount - (payment.surchargeAmount || 0));
        }
        return sum + payment.amount;
      }, 0);

      return {
        ...prev,
        customAmounts: newCustomAmounts,
        finalTotal: newFinalTotal,
        remainingAmount: roundToTwoDecimals(newFinalTotal - totalEffectivePaid)
      };
    });
  };

  const removeCustomAmount = (id: string) => {
    setPaymentState((prev) => {
      const newCustomAmounts = prev.customAmounts.filter(
        (item) => item.id !== id
      );
      const customAmountsTotal = newCustomAmounts.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      // Calculate total redeem amount from payments with paymentType 3 (gift card)
      const redeemAmount = prev.payments
        .filter((payment) => payment.paymentType === 3)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const newFinalTotal =
        prev.originalTotal +
        prev.tip -
        prev.discount -
        redeemAmount +
        customAmountsTotal;

      // Calculate effective payments (excluding surcharges for card payments)
      // Exclude gift card payments as they're already deducted from finalTotal
      const totalEffectivePaid = prev.payments.reduce((sum, payment) => {
        // Skip gift card payments as they're already deducted from finalTotal
        if (payment.paymentType === 3) {
          return sum;
        }

        // For split payments, the amount field already contains the effective amount
        if (payment.id?.startsWith('split-')) {
          return sum + payment.amount;
        }

        // For non-split payments, apply the old logic
        if (payment.paymentMethod === 'cash') {
          return (
            sum +
            Math.min(payment.amount, payment.expectedAmount || payment.amount)
          );
        } else if (payment.paymentMethod === 'card') {
          return sum + (payment.amount - (payment.surchargeAmount || 0));
        }
        return sum + payment.amount;
      }, 0);

      return {
        ...prev,
        customAmounts: newCustomAmounts,
        finalTotal: newFinalTotal,
        remainingAmount: roundToTwoDecimals(newFinalTotal - totalEffectivePaid)
      };
    });
  };

  return {
    paymentState,
    setPaymentState,
    cashAmount,
    setCashAmount,
    showCalculator,
    setShowCalculator,
    rawCashInput,
    handleCurrentPaymentChange,
    handleAdditionalChargeChange,
    handleCalculatorInput,
    handleCashAmountClick,
    resetPaymentState,
    addPayment,
    resetNumberPad,
    getChangeAmount,
    calcTotalDue,
    addCustomAmount,
    removeCustomAmount
  } as UsePaymentStateReturn;
};

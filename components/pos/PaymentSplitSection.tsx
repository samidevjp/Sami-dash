import React, { useMemo } from 'react';
import { CheckCircle, Minus } from 'lucide-react';
import { PaymentState, AddOn } from '@/types';
import { getSplitTotal } from '@/utils/common';

interface PaymentSplitSectionProps {
  splitNumber: number;
  paymentState: PaymentState;
  setPaymentState: React.Dispatch<React.SetStateAction<PaymentState>>;

  splitItemAssignments: {
    [splitNumber: number]: Array<{
      itemUuid: string;
      quantity: number;
      itemTitle: string;
      itemPrice: number;
      addOns: AddOn[];
      totalPrice: number;
    }>;
  };
  onRemoveItemFromSplit?: (splitNumber: number, itemIndex: number) => void;
  isSplitPaymentStarted?: boolean;
}

const PaymentSplitSection: React.FC<PaymentSplitSectionProps> = ({
  splitNumber,
  paymentState,
  setPaymentState,
  splitItemAssignments,
  onRemoveItemFromSplit,
  isSplitPaymentStarted
}) => {
  const splitAmount = useMemo(() => {
    if (paymentState.splitType === 'item') {
      // In split item mode, tip and discount are divided equally among splits, regardless of item assignment
      const itemTotal = getSplitTotal(splitItemAssignments, splitNumber);
      const splitCount = paymentState.splitCount || 1;
      const tipPerSplit = (paymentState.tip || 0) / splitCount;
      const discountPerSplit = (paymentState.discount || 0) / splitCount;
      return itemTotal + tipPerSplit - discountPerSplit;
    } else {
      const totalSplitAmount = paymentState.finalTotal;
      const preSplitPaidAmount = paymentState.payments
        .filter((payment) => !payment.id?.startsWith('split-'))
        .reduce((sum, payment) => sum + payment.amount, 0);
      const amountToSplit = Math.max(0, totalSplitAmount - preSplitPaidAmount);
      return amountToSplit / (paymentState.splitCount || 1);
    }
  }, [
    paymentState.splitType,
    paymentState.finalTotal,
    paymentState.payments,
    paymentState.splitCount,
    paymentState.tip,
    paymentState.discount,
    splitItemAssignments,
    splitNumber
  ]);

  const splitPayments = useMemo(
    () => paymentState.payments.filter((p) => p.id === `split-${splitNumber}`),
    [paymentState.payments, splitNumber]
  );

  const totalEffectivePaidForSplit = useMemo(
    () => splitPayments.reduce((sum, p) => sum + p.amount, 0),
    [splitPayments]
  );

  const isFullyPaid = useMemo(
    () => splitAmount > 0 && totalEffectivePaidForSplit >= splitAmount - 0.01,
    [splitAmount, totalEffectivePaidForSplit]
  );

  const assignedItems = useMemo(
    () => splitItemAssignments[splitNumber] || [],
    [splitItemAssignments, splitNumber]
  );

  const splitTotal = useMemo(
    () => getSplitTotal(splitItemAssignments, splitNumber),
    [splitItemAssignments, splitNumber]
  );

  const changePayments = useMemo(
    () =>
      paymentState.payments.filter(
        (payment) =>
          payment.id === `split-${splitNumber}` && payment.change > 0.01
      ),
    [paymentState.payments, splitNumber]
  );

  // Calculate if this split is fully paid (amount is already effective)
  // This split is active if it's the first unpaid split with items
  const isActiveSplit = (() => {
    // For split item mode, only splits with items can be active
    if (paymentState.splitType === 'item') {
      // This split must have items and not be fully paid
      if (splitAmount <= 0 || isFullyPaid) return false;

      // Check if all previous splits with items are fully paid
      for (let i = 1; i < splitNumber; i++) {
        const prevSplitAmount =
          paymentState.splitType === 'item'
            ? getSplitTotal(splitItemAssignments, i)
            : splitAmount; // For bill mode, all splits have same amount

        if (prevSplitAmount > 0) {
          // Only check splits that have items
          const prevSplitPayments = paymentState.payments.filter(
            (p) => p.id === `split-${i}`
          );
          const prevEffectivePaid = prevSplitPayments.reduce(
            (sum, p) => sum + p.amount,
            0
          );
          if (prevEffectivePaid < prevSplitAmount - 0.01) return false;
        }
      }
      return true;
    } else {
      // For split bill mode, use original logic
      return (
        !isFullyPaid &&
        (() => {
          for (let i = 1; i < splitNumber; i++) {
            const prevSplitPayments = paymentState.payments.filter(
              (p) => p.id === `split-${i}`
            );
            const prevEffectivePaid = prevSplitPayments.reduce(
              (sum, p) => sum + p.amount,
              0
            );
            if (prevEffectivePaid < splitAmount - 0.01) return false;
          }
          return true;
        })()
      );
    }
  })();

  // Calculate styling classes
  const containerClass = `flex justify-between rounded p-2 ${
    isActiveSplit ? 'border-2 border-primary' : ''
  }`;

  const splitLabelClass = `font-semibold ${
    isFullyPaid
      ? 'flex items-center gap-2'
      : !isActiveSplit
      ? 'text-yellow-600'
      : ''
  }`;

  const splitAmountClass = `font-semibold ${
    !isActiveSplit && !isFullyPaid ? 'text-yellow-600' : ''
  }`;

  return (
    <div className="mt-6">
      <div className={containerClass}>
        <span className={splitLabelClass}>
          Split #{splitNumber}{' '}
          {isFullyPaid && <CheckCircle className="h-5 w-5 text-primary" />}
        </span>
        <span className={splitAmountClass}>${splitAmount.toFixed(2)}</span>
      </div>

      {/* Show all payments for this specific split */}
      {splitPayments.map((splitPayment, paymentIndex) => (
        <div
          key={`${splitNumber}-${paymentIndex}`}
          className="ml-4 mt-1 rounded bg-gray-800 p-2"
        >
          <p className="grid grid-cols-3 text-xs text-green-400">
            <span className="font-semibold">
              Paid $
              {(() => {
                if (
                  splitPayment.paymentMethod === 'cash' ||
                  splitPayment.paymentMethod === 'redeem' ||
                  splitPayment.paymentMethod === 'account'
                ) {
                  return (
                    splitPayment.originalAmount || splitPayment.amount
                  ).toFixed(2);
                }
                if (splitPayment.paymentMethod === 'card') {
                  return (
                    splitPayment.originalAmount || splitPayment.amount
                  ).toFixed(2);
                }
                return (
                  splitPayment.originalAmount || splitPayment.amount
                ).toFixed(2);
              })()}
            </span>
            <span className="text-center font-semibold">
              {splitPayment.paymentMethod.toUpperCase()}
            </span>
            <button
              className="flex items-center justify-end gap-1 text-xs text-muted-foreground hover:text-red-400"
              onClick={() =>
                setPaymentState((prev) => {
                  const updatedPayments = prev.payments.filter(
                    (p) => p !== splitPayment
                  );
                  const refundedAmount =
                    splitPayment.paymentMethod === 'card'
                      ? splitPayment.amount - splitPayment.surchargeAmount
                      : splitPayment.amount;
                  const remainingAmount = prev.remainingAmount + refundedAmount;
                  return {
                    ...prev,
                    payments: updatedPayments,
                    remainingAmount: remainingAmount
                  };
                })
              }
            >
              <Minus className="h-3 w-3 rounded-full bg-muted-foreground text-black" />
              Revert
            </button>
          </p>
          {splitPayment.paymentMethod === 'card' &&
            splitPayment.surchargeAmount > 0 && (
              <p className="mt-1 text-xs ">
                <span>
                  {splitPayment.paymentRef ||
                    splitPayment.feeCreditType?.toUpperCase()}{' '}
                  {splitPayment.surchargePercentage
                    ? `${splitPayment.surchargePercentage}%`
                    : splitPayment.feeCreditType === 'amex'
                    ? '2.9%'
                    : '1.9%'}
                </span>
                <span className="float-right">
                  ${splitPayment.surchargeAmount.toFixed(2)}
                </span>
              </p>
            )}
        </div>
      ))}

      {/* Show change from payments for this split */}
      {changePayments.map((payment, changeIndex) => (
        <div
          key={`change-${splitNumber}-${changeIndex}`}
          className="ml-4 mt-1 rounded bg-gray-800 p-2"
        >
          <p className="grid grid-cols-3 text-xs ">
            <span className="font-semibold">Change</span>
            <span className="text-center font-semibold">CASH</span>
            <span className="text-right font-semibold">
              ${payment.change.toFixed(2)}
            </span>
          </p>
        </div>
      ))}

      {/* Show split assignment details for split item mode */}
      {paymentState.splitType === 'item' && (
        <div className="ml-4 mt-2 rounded bg-blue-900/20 p-2">
          <div className="text-xs">
            {/* Show assigned items for this split */}
            {(() => {
              if (assignedItems.length === 0) {
                return (
                  <div className="text-gray-400">
                    No items assigned to this split
                  </div>
                );
              }
              return (
                <>
                  <div className="space-y-1">
                    {assignedItems.map((assignedItem, itemIndex) => (
                      <div key={itemIndex} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-white">
                              {assignedItem.quantity}x {assignedItem.itemTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white">
                              $
                              {(
                                assignedItem.itemPrice * assignedItem.quantity
                              ).toFixed(2)}
                            </span>
                            {onRemoveItemFromSplit &&
                              !isSplitPaymentStarted && (
                                <button
                                  onClick={() =>
                                    onRemoveItemFromSplit(
                                      splitNumber,
                                      itemIndex
                                    )
                                  }
                                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                                  title="Remove item from this split"
                                >
                                  <Minus className="h-3 w-3 rounded-full bg-red-400 text-white" />
                                </button>
                              )}
                          </div>
                        </div>
                        {/* Display add-ons */}
                        {assignedItem.addOns?.map((addon, addonIndex) => (
                          <div
                            key={addonIndex}
                            className="ml-4 flex justify-between text-sm text-gray-400"
                          >
                            <span>
                              {addon.quantity}x {addon.name}
                            </span>
                            <span>
                              ${(addon.price * addon.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-gray-600 pt-1">
                    <div className="flex justify-between font-semibold text-green-400">
                      <span>Split Total:</span>
                      <span>${splitTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSplitSection;

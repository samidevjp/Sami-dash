import React from 'react';
import { Button } from '../../ui/button';
import { PaymentState } from '@/types';

interface ConsolidatedPaymentSummaryProps {
  paymentState: PaymentState;
  onPrintBill: () => void;
  onFinish: () => void;
  getChangeAmount: () => string;
}

const ConsolidatedPaymentSummary: React.FC<ConsolidatedPaymentSummaryProps> = ({
  paymentState,
  onPrintBill,
  onFinish,
  getChangeAmount
}) => {
  // Check if this is actually a split payment (more than 1 split)
  const isActualSplit = paymentState.splitCount > 1;

  // Group split payments by split ID
  const splitPayments = paymentState.payments.filter(
    (payment) => payment.id?.startsWith('split-')
  );

  // Group payments by split number
  const paymentsBySplit: { [key: string]: any[] } = {};
  splitPayments.forEach((payment) => {
    const splitId = payment.id!;
    if (!paymentsBySplit[splitId]) {
      paymentsBySplit[splitId] = [];
    }
    paymentsBySplit[splitId].push(payment);
  });

  // Sort split IDs to show them in order (split-1, split-2, etc.)
  const sortedSplitIds = Object.keys(paymentsBySplit).sort((a, b) => {
    const aNum = parseInt(a.replace('split-', ''));
    const bNum = parseInt(b.replace('split-', ''));
    return aNum - bNum;
  });

  // Calculate total redeem amount from all gift card payments
  const totalRedeemAmount = paymentState.payments
    .filter((payment) => payment.paymentType === 3)
    .reduce((sum, payment) => sum + payment.amount, 0);

  // Get all payments (both split and non-split) if splitCount is 1
  const allPayments = isActualSplit
    ? [] // If actual split, handle split payments separately
    : [
        ...paymentState.payments.filter(
          (payment) => !payment.id?.startsWith('split-')
        ),
        ...splitPayments
      ];

  return (
    <div className="flex w-full flex-col items-center px-10">
      <div className="mb-6 max-h-[60svh] w-full overflow-auto rounded-md border border-white px-8 py-4">
        {/* Show regular payments when splitCount is 1 OR show non-split payments */}
        {!isActualSplit ? (
          // When splitCount is 1, show all payments as regular payments
          allPayments.map((payment, index) => (
            <div
              key={payment.id || `payment-${index}`}
              className="mb-4 border-b border-white pb-4 last:border-b-0"
            >
              {/* For Cash payments: only show change */}
              {payment.paymentMethod === 'cash' ? (
                <div className="flex justify-between">
                  <h2 className="text-2xl font-semibold">Change</h2>
                  <p className="text-2xl font-semibold text-green">
                    ${(payment.change || 0).toFixed(2)}
                  </p>
                </div>
              ) : (
                // For Card and other payments: show paid amount, surcharge, and change
                <>
                  <div className="flex justify-between">
                    <h2 className="text-2xl font-semibold">Paid</h2>
                    <p className="text-2xl font-semibold text-green">
                      ${(payment.originalAmount || payment.amount).toFixed(2)}
                    </p>
                  </div>

                  {/* Show surcharge details for card payments */}
                  {payment.paymentMethod === 'card' &&
                    payment.surchargeAmount > 0 && (
                      <div className="mt-1 flex justify-between text-base font-semibold text-muted-foreground">
                        <span>
                          {payment.paymentRef || 'Card Payment'} Surcharge{' '}
                          {payment.surchargePercentage}%
                        </span>
                        <span>${payment.surchargeAmount.toFixed(2)}</span>
                      </div>
                    )}

                  {/* Always show change for card payments (even if $0.00) */}
                  {payment.paymentMethod === 'card' && (
                    <div className="mt-1 flex justify-between">
                      <h2 className="text-2xl font-semibold">Change</h2>
                      <p className="text-2xl font-semibold text-green">
                        ${(payment.change || 0).toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Show change for other non-card payments if there is change */}
                  {payment.paymentMethod !== 'card' && payment.change > 0 && (
                    <div className="mt-1 flex justify-between">
                      <h2 className="text-2xl font-semibold">Change</h2>
                      <p className="text-2xl font-semibold text-green">
                        ${payment.change.toFixed(2)}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          // Original split payment display logic when splitCount > 1
          <>
            {/* Show any non-split payments (pre-split payments) */}
            {paymentState.payments
              .filter((payment) => !payment.id?.startsWith('split-'))
              .map((payment, index) => (
                <div
                  key={payment.id || `non-split-${index}`}
                  className="mb-4 border-b border-white pb-4"
                >
                  {/* For Cash payments: only show change */}
                  {payment.paymentMethod === 'cash' ? (
                    <div className="flex justify-between">
                      <h2 className="text-2xl font-semibold">Change</h2>
                      <p className="text-2xl font-semibold text-green">
                        ${(payment.change || 0).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    // For Card and other payments: show paid amount, surcharge, and change
                    <>
                      <div className="flex justify-between">
                        <h2 className="text-2xl font-semibold">Paid</h2>
                        <p className="text-2xl font-semibold text-green">
                          ${payment.amount.toFixed(2)}
                        </p>
                      </div>

                      {/* Show surcharge details for card payments */}
                      {payment.paymentMethod === 'card' &&
                        payment.surchargeAmount > 0 && (
                          <div className="mt-1 flex justify-between text-base font-semibold text-muted-foreground">
                            <span>
                              {payment.paymentRef || 'Card Payment'} Surcharge{' '}
                              {payment.surchargePercentage}%
                            </span>
                            <span>${payment.surchargeAmount.toFixed(2)}</span>
                          </div>
                        )}

                      {/* Always show change for card payments (even if $0.00) */}
                      {payment.paymentMethod === 'card' && (
                        <div className="mt-1 flex justify-between">
                          <h2 className="text-2xl font-semibold">Change</h2>
                          <p className="text-2xl font-semibold text-green">
                            ${(payment.change || 0).toFixed(2)}
                          </p>
                        </div>
                      )}

                      {/* Show change for other non-card payments if there is change */}
                      {payment.paymentMethod !== 'card' &&
                        payment.change > 0 && (
                          <div className="mt-1 flex justify-between">
                            <h2 className="text-2xl font-semibold">Change</h2>
                            <p className="text-2xl font-semibold text-green">
                              ${payment.change.toFixed(2)}
                            </p>
                          </div>
                        )}
                    </>
                  )}
                </div>
              ))}

            {/* Show payments grouped by split */}
            {sortedSplitIds.map((splitId, splitIndex) => {
              const splitNumber = splitId.replace('split-', '');
              const splitPayments = paymentsBySplit[splitId];

              return (
                <div key={splitId} className="mb-4">
                  {/* Split Header */}
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold ">
                      Split #{splitNumber}
                    </h3>
                  </div>

                  {/* Payments for this split */}
                  {splitPayments.map((payment, paymentIndex) => (
                    <div
                      key={`${splitId}-${paymentIndex}`}
                      className="mb-2 ml-4"
                    >
                      {/* For Cash payments: only show change */}
                      {payment.paymentMethod === 'cash' ? (
                        <>
                          {payment.change <= 0 && (
                            <div className="flex justify-between">
                              <h2 className="text-2xl font-semibold">Paid</h2>
                              <p className="text-2xl font-semibold text-green">
                                ${(payment.amount || 0).toFixed(2)}
                              </p>
                            </div>
                          )}
                          {payment.change > 0 && (
                            <>
                              <div className="flex justify-between">
                                <h2 className="text-2xl font-semibold">Paid</h2>
                                <p className="text-2xl font-semibold text-green">
                                  ${(payment.originalAmount || 0).toFixed(2)}
                                </p>
                              </div>
                              <div className="mt-2 flex justify-between">
                                <h2 className="text-2xl font-semibold">
                                  Change
                                </h2>
                                <p className="text-2xl font-semibold text-green">
                                  ${(payment.change || 0).toFixed(2)}
                                </p>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        // For Card and other payments: show paid amount, surcharge, and change
                        <>
                          <div className="flex justify-between">
                            <h2 className="text-2xl font-semibold">Paid</h2>
                            <p className="text-2xl font-semibold text-green">
                              $
                              {(
                                payment.originalAmount || payment.amount
                              ).toFixed(2)}
                            </p>
                          </div>

                          {/* Show surcharge details for card payments */}
                          {payment.paymentMethod === 'card' &&
                            payment.surchargeAmount > 0 && (
                              <div className="ml-0 mt-1 flex justify-between text-base font-semibold text-muted-foreground">
                                <span>
                                  {payment.paymentRef || 'Card Payment'}{' '}
                                  Surcharge {payment.surchargePercentage}%
                                </span>
                                <span>
                                  ${payment.surchargeAmount.toFixed(2)}
                                </span>
                              </div>
                            )}

                          {/* Always show change for card payments (even if $0.00) */}
                          {/* {payment.paymentMethod === 'card' && (
                            <div className="mt-2 flex justify-between">
                              <h2 className="text-2xl font-semibold">Change</h2>
                              <p className="text-2xl font-semibold text-green">
                                ${(payment.change || 0).toFixed(2)}
                              </p>
                            </div>
                          )} */}

                          {/* Show change for other non-card payments if there is change */}
                          {payment.paymentMethod !== 'card' &&
                            payment.change > 0 && (
                              <div className="mt-2 flex justify-between">
                                <h2 className="text-2xl font-semibold">
                                  Change
                                </h2>
                                <p className="text-2xl font-semibold text-green">
                                  ${payment.change.toFixed(2)}
                                </p>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add border after each split except the last one */}
                  {splitIndex < sortedSplitIds.length - 1 && (
                    <div className="border-b border-white pb-2"></div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Show gift card redemption if any */}
        {totalRedeemAmount > 0 && (
          <div className="mb-4 border-b border-white pb-4">
            <div className="flex justify-between">
              <h2 className="text-2xl font-semibold">Gift Card Redeem</h2>
              <p className="text-2xl font-semibold text-green">
                ${totalRedeemAmount.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex w-full justify-around gap-6">
        <Button
          onClick={onPrintBill}
          className="flex h-16 w-full border border-white bg-transparent text-lg text-white transition-all hover:bg-gray-800"
        >
          Print Bill
        </Button>
        <Button
          onClick={onFinish}
          className="flex h-16 w-full border border-white bg-transparent text-lg text-white transition-all hover:bg-gray-800"
        >
          Finished
        </Button>
      </div>
    </div>
  );
};

export default ConsolidatedPaymentSummary;

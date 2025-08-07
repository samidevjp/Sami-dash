import {
  OrderProduct,
  PaymentEntry,
  PaymentOptionMode,
  SurchargeItem,
  AddOn
} from '@/types';
import { calclateSurcharge } from '@/lib/calc';
import { Minus, Plus } from 'lucide-react';
import { UsePaymentStateReturn } from '@/hooks/usePaymentState';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import PaymentSplitSection from './PaymentSplitSection';
import type { SplitItemAssignments } from '@/types';

interface PaymentModalOrderSummaryProps {
  paymentItems: OrderProduct[];
  booking: any;
  guestName: string;
  tableId: string | null;
  setOptionMode: (val: PaymentOptionMode) => void;
  selectedSurcharges: SurchargeItem[];
  setSelectedSurcharges: React.Dispatch<React.SetStateAction<SurchargeItem[]>>;
  gstAmount: number;
  finalSubtotal: number;
  paymentHelpers: UsePaymentStateReturn;
  onAddItemToSplit?: (
    item: OrderProduct,
    quantity: number,
    splitNumber?: number
  ) => void;
  splitItemAssignments: SplitItemAssignments;
  setSplitItemAssignments: React.Dispatch<
    React.SetStateAction<SplitItemAssignments>
  >;
}

const PaymentModalOrderSummary: React.FC<PaymentModalOrderSummaryProps> = ({
  paymentItems,
  booking,
  guestName,
  tableId,
  setOptionMode,
  selectedSurcharges,
  setSelectedSurcharges,
  gstAmount,
  finalSubtotal,
  paymentHelpers,
  onAddItemToSplit,
  splitItemAssignments,
  setSplitItemAssignments
}) => {
  const { paymentState, setPaymentState, getChangeAmount, calcTotalDue } =
    paymentHelpers;

  // State for split item quantity modal
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedItemForSplit, setSelectedItemForSplit] =
    useState<OrderProduct | null>(null);
  const [splitQuantity, setSplitQuantity] = useState('1');
  // New: State for add-on quantities per split
  const [splitAddOnQuantities, setSplitAddOnQuantities] = useState<{
    [addonIndex: number]: number;
  }>({});

  // Get next available split number
  const getNextSplitNumber = () => {
    for (let i = 1; i <= paymentState.splitCount; i++) {
      const hasPayment = paymentState.payments.some(
        (p) => p.id === `split-${i}`
      );
      if (!hasPayment) {
        return i;
      }
    }
    return 1; // Fallback to split 1
  };

  // Handle adding item to split
  const handleAddItemToSplit = (item?: OrderProduct) => {
    if ((selectedItemForSplit || item) && onAddItemToSplit) {
      const selectedItem: OrderProduct =
        (selectedItemForSplit as OrderProduct) || (item as OrderProduct);
      const quantity = parseInt(splitQuantity);
      const remainingQuantity = getRemainingQuantity(
        selectedItem,
        selectedItem.uuid
      );
      if (quantity > 0 && quantity <= remainingQuantity) {
        // Get current split number
        const currentSplitNumber = getNextSplitNumber();
        // Build assigned add-ons for this split (only what user selected)
        const assignedAddOns: AddOn[] = (selectedItem.addOns || [])
          .map((addon, idx) => ({
            ...addon,
            quantity: splitAddOnQuantities[idx] || 0
          }))
          .filter((a) => a.quantity > 0);
        // Calculate costs including assigned add-ons
        const addOnsTotal = assignedAddOns.reduce(
          (sum, addon) => sum + addon.price * addon.quantity,
          0
        );
        const totalPrice = selectedItem.price * quantity + addOnsTotal;
        setSplitItemAssignments((prev) => {
          const currentAssignments = prev[currentSplitNumber] || [];
          // Always merge into a single assignment for the same itemUuid
          const matchIdx = currentAssignments.findIndex(
            (a) => a.itemUuid === selectedItem.uuid
          );
          if (matchIdx !== -1) {
            // Merge: sum item quantity and add-on quantities (only what user selected)
            const updatedAssignments = [...currentAssignments];
            // Merge add-ons: only add the quantities the user selected
            const addOnMap = new Map();
            updatedAssignments[matchIdx].addOns.forEach((addon) => {
              const key = addon.id || addon.name;
              addOnMap.set(key, { ...addon });
            });
            assignedAddOns.forEach((addon) => {
              const key = addon.id || addon.name;
              if (addOnMap.has(key)) {
                addOnMap.get(key).quantity += addon.quantity;
              } else {
                addOnMap.set(key, { ...addon });
              }
            });
            // Remove add-ons with 0 quantity
            const mergedAddOns = Array.from(addOnMap.values()).filter(
              (a) => a.quantity > 0
            );
            // Recalculate addOnsTotal and totalPrice
            const mergedAddOnsTotal = mergedAddOns.reduce(
              (sum, addon) => sum + addon.price * addon.quantity,
              0
            );
            const mergedQuantity =
              updatedAssignments[matchIdx].quantity + quantity;
            const mergedTotalPrice =
              selectedItem.price * mergedQuantity + mergedAddOnsTotal;
            updatedAssignments[matchIdx] = {
              ...updatedAssignments[matchIdx],
              quantity: mergedQuantity,
              addOns: mergedAddOns,
              totalPrice: mergedTotalPrice
            };
            return {
              ...prev,
              [currentSplitNumber]: updatedAssignments
            };
          } else {
            // Add as new assignment (only what user selected)
            return {
              ...prev,
              [currentSplitNumber]: [
                ...currentAssignments,
                {
                  itemUuid: selectedItem.uuid,
                  quantity,
                  itemTitle: selectedItem.title,
                  itemPrice: selectedItem.price,
                  addOns: assignedAddOns,
                  totalPrice
                }
              ]
            };
          }
        });
      }
    }
    setShowQuantityModal(false);
    setSplitQuantity('1');
    setSelectedItemForSplit(null);
  };

  // Calculate total quantity distributed across all splits for a specific item
  const getTotalDistributedQuantity = (itemUuid: string) => {
    let totalDistributed = 0;
    for (const assignments of Object.values(splitItemAssignments)) {
      // Find ALL assignments for this item in this split (not just the first one)
      const matchingAssignments = assignments.filter(
        (a) => a.itemUuid === itemUuid
      );
      for (const assignment of matchingAssignments) {
        totalDistributed += assignment.quantity;
      }
    }
    return totalDistributed;
  };

  // Calculate remaining quantity for an item
  const getRemainingQuantity = (item: OrderProduct, itemUuid: string) => {
    const totalDistributed = getTotalDistributedQuantity(itemUuid);
    return item.quantity - totalDistributed;
  };

  // Check if all quantities of an item are distributed to splits
  const isItemCompletelyDistributed = (
    item: OrderProduct,
    itemUuid: string
  ) => {
    return getRemainingQuantity(item, itemUuid) <= 0;
  };

  // Handle removing an item from a split
  const handleRemoveItemFromSplit = (
    splitNumber: number,
    assignmentIndex: number
  ) => {
    setSplitItemAssignments((prev) => {
      const updatedAssignments = { ...prev };
      const splitAssignments = updatedAssignments[splitNumber] || [];

      // Remove the assignment at the specified index
      const newSplitAssignments = splitAssignments.filter(
        (_, index) => index !== assignmentIndex
      );

      if (newSplitAssignments.length === 0) {
        // If no assignments left, remove the split entirely
        delete updatedAssignments[splitNumber];
      } else {
        updatedAssignments[splitNumber] = newSplitAssignments;
      }

      return updatedAssignments;
    });

    // Also remove any payments for this split if it becomes empty
    const remainingAssignments = (
      splitItemAssignments[splitNumber] || []
    ).filter((_, index) => index !== assignmentIndex);
    if (remainingAssignments.length === 0) {
      setPaymentState((prev) => ({
        ...prev,
        payments: prev.payments.filter((p) => p.id !== `split-${splitNumber}`)
      }));
    }
  };

  const isDiscount = paymentState.discount > 0;
  const isTip = paymentState.tip > 0;

  // Calculate redeem amount from payments with paymentType 3 (gift card)
  const redeemAmount = paymentState.payments
    .filter((payment) => payment.paymentType === 3)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const isRedeem = redeemAmount > 0;

  const isChange =
    paymentState?.payments.reduce(
      (sum: number, p: PaymentEntry) => sum + (p.change || 0),
      0
    ) > 0;
  // Check if payment has actually started - for regular payments (not split-specific)
  const isPaymentStarted = (() => {
    // For split mode: only check non-split payments (pre-split payments)
    if (paymentState.splitType !== 'none' && paymentState.splitCount > 1) {
      return paymentState.payments.some(
        (payment) => !payment.id?.startsWith('split-')
      );
    }
    // For regular mode: check if there are any payments at all
    return paymentState.payments.length > 0;
  })();

  // Check if a specific split has payments
  const isSplitPaymentStarted = (splitNumber: number) => {
    return paymentState.payments.some(
      (payment) => payment.id === `split-${splitNumber}`
    );
  };

  const userManuallyChangedAddOns = useRef(false);

  // When user changes add-on quantities manually, set the flag
  const handleAddOnQuantityChange = (
    idx: number,
    newVal: number,
    available: number
  ) => {
    userManuallyChangedAddOns.current = true;
    setSplitAddOnQuantities((q) => ({
      ...q,
      [idx]: Math.max(0, Math.min(available, newVal))
    }));
  };

  // Add this effect to auto-assign all add-ons if splitQuantity == remainingQty
  useEffect(() => {
    if (!selectedItemForSplit) return;
    const remainingQty = getRemainingQuantity(
      selectedItemForSplit,
      selectedItemForSplit.uuid
    );
    if (
      parseInt(splitQuantity) === remainingQty &&
      !userManuallyChangedAddOns.current
    ) {
      // Assign all available add-ons
      const newAddOns: { [idx: number]: number } = {};
      selectedItemForSplit.addOns?.forEach((addon, idx) => {
        // Calculate available
        let totalAssigned = 0;
        Object.values(splitItemAssignments).forEach((assignments) => {
          assignments.forEach((a) => {
            if (a.itemUuid === selectedItemForSplit.uuid && a.addOns) {
              const found = a.addOns.find((ad) => ad.name === addon.name);
              if (found) totalAssigned += found.quantity;
            }
          });
        });
        const available = addon.quantity - totalAssigned;
        newAddOns[idx] = available;
      });
      setSplitAddOnQuantities(newAddOns);
    } else if (
      parseInt(splitQuantity) < remainingQty &&
      !userManuallyChangedAddOns.current
    ) {
      // Reset add-ons if not max
      setSplitAddOnQuantities({});
    }
  }, [splitQuantity, selectedItemForSplit]);

  // Reset manual flag when modal closes or item changes
  useEffect(() => {
    userManuallyChangedAddOns.current = false;
  }, [showQuantityModal, selectedItemForSplit]);

  return (
    <div className="flex h-full w-full flex-col bg-black p-4 text-white md:w-1/2 lg:w-1/2">
      <div className="relative h-full ">
        {/* Header */}
        <div className="flex justify-between">
          <p className="text-sm font-semibold">{guestName}</p>
          <div className="text-right">
            {tableId && <p className="text-xs ">{tableId}</p>}
            {booking?.party_size && (
              <p className="text-xs ">{booking.party_size} Guests</p>
            )}
          </div>
        </div>
        <h1 className="my-2 flex justify-between text-4xl font-bold">
          <span>${calcTotalDue()}</span>
          <span className="text-2xl">Total Due</span>
        </h1>
        <div className="max-h-72 overflow-auto">
          {isTip && (
            <div className="mt-2 flex  justify-between">
              <p className="text-xs font-semibold text-red">
                {(paymentState.tipRate * 100).toFixed(1)}% Tip applied - $
                {paymentState.tip.toFixed(2)}
              </p>
              {!isPaymentStarted && (
                <div className="mt-1 flex justify-end">
                  <button
                    className="flex items-center gap-1 text-xs text-red"
                    onClick={() =>
                      setPaymentState((prev) => ({
                        ...prev,
                        tip: 0,
                        tipRate: 0
                      }))
                    }
                  >
                    <Minus className="h-3 w-3 rounded-full bg-red text-black" />
                    Removed
                  </button>
                </div>
              )}
            </div>
          )}

          {isDiscount && (
            <div className="mt-2 flex justify-between">
              <p className="text-xs font-semibold text-red">
                {(
                  (paymentState.discount / (paymentState.originalTotal || 1)) *
                  100
                ).toFixed(1)}
                % Discount applied - ${paymentState.discount.toFixed(2)}
              </p>
              {!isPaymentStarted && (
                <div className="mt-1 flex justify-end">
                  <button
                    className="flex items-center gap-1 text-xs text-red"
                    onClick={() =>
                      setPaymentState((prev) => ({
                        ...prev,
                        discount: 0
                      }))
                    }
                  >
                    <Minus className="h-3 w-3 rounded-full bg-red text-black" />
                    Removed
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Regular Payment Display - Show payments that were made BEFORE split mode */}
          {isPaymentStarted && (
            <>
              {paymentState.payments
                .filter(
                  (payment) =>
                    !payment.id?.startsWith('split-') &&
                    paymentState.currentPayment.paymentMethod !== 'split'
                )
                .map((payment, index) => (
                  <div key={payment.id || index} className="mt-2">
                    <p className="grid grid-cols-3 text-xs text-green">
                      <span className="font-semibold">
                        Paid ${payment.amount.toFixed(2)}
                      </span>
                      <span className="text-center font-semibold">
                        {payment.paymentMethod.toUpperCase()}
                      </span>
                      <button
                        className="flex items-center justify-end gap-1 text-xs text-muted-foreground"
                        onClick={() =>
                          setPaymentState((prev) => {
                            const updatedPayments = prev.payments.filter(
                              (p) => p.id !== payment.id
                            );
                            const refundedAmount = payment.amount;
                            const remainingAmount =
                              prev.remainingAmount + refundedAmount;
                            if (remainingAmount >= 0) setOptionMode('default');
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
                    {payment.paymentMethod === 'card' &&
                      payment.surchargeAmount > 0 && (
                        <p className="mt-1 text-xs text-gray-400">
                          <span>
                            {payment.paymentRef}{' '}
                            {payment.surchargePercentage
                              ? `${payment.surchargePercentage}%`
                              : payment.feeCreditType === 'amex'
                              ? '2.9%'
                              : '1.95%'}
                          </span>
                          <span className="float-right">
                            ${payment.surchargeAmount.toFixed(2)}
                          </span>
                        </p>
                      )}
                  </div>
                ))}
            </>
          )}

          {/* Pre-split payments - Show when in split mode */}
          {paymentState.currentPayment.paymentMethod === 'split' && (
            <>
              {paymentState.payments
                .filter((payment) => !payment.id?.startsWith('split-'))
                .map((payment, index) => (
                  <div key={payment.id || index} className="mt-2">
                    <p className="grid grid-cols-3 text-xs text-green">
                      <span className="font-semibold">
                        Paid ${payment.amount.toFixed(2)}
                      </span>
                      <span className="text-center font-semibold">
                        {payment.paymentMethod.toUpperCase()}
                      </span>
                      <button
                        className="flex items-center justify-end gap-1 text-xs text-muted-foreground"
                        onClick={() =>
                          setPaymentState((prev) => {
                            const updatedPayments = prev.payments.filter(
                              (p) => p.id !== payment.id
                            );
                            const refundedAmount = payment.amount;
                            const remainingAmount =
                              prev.remainingAmount + refundedAmount;
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
                    {payment.paymentMethod === 'card' &&
                      payment.surchargeAmount > 0 && (
                        <p className="mt-1 text-xs text-gray-400">
                          <span>
                            {payment.paymentRef}{' '}
                            {payment.surchargePercentage
                              ? `${payment.surchargePercentage}%`
                              : payment.feeCreditType === 'amex'
                              ? '2.9%'
                              : '1.95%'}
                          </span>
                          <span className="float-right">
                            ${payment.surchargeAmount.toFixed(2)}
                          </span>
                        </p>
                      )}
                  </div>
                ))}
            </>
          )}

          {/* Split Payment Display - Show after existing payments */}
          {paymentState.splitType !== 'none' &&
            paymentState.splitCount &&
            paymentState.splitCount > 1 && (
              <div className="mt-4">
                {Array.from(
                  { length: paymentState.splitCount || 0 },
                  (_, index) => (
                    <PaymentSplitSection
                      key={`split-${index + 1}`}
                      splitNumber={index + 1}
                      paymentState={paymentState}
                      setPaymentState={setPaymentState}
                      splitItemAssignments={splitItemAssignments}
                      onRemoveItemFromSplit={handleRemoveItemFromSplit}
                      isSplitPaymentStarted={isSplitPaymentStarted(index + 1)}
                    />
                  )
                )}
              </div>
            )}

          {isChange && (
            <p className="mt-2 grid grid-cols-3 text-xs font-semibold text-muted-foreground">
              <span>Change</span>
              <span className="text-center">${getChangeAmount()}</span>
              <span></span>
            </p>
          )}
        </div>

        <hr className="my-1 border-gray-700" />

        {/* Item list */}
        <div className="max-h-64 space-y-2 overflow-auto text-sm">
          {paymentItems.map((item, idx) => {
            // Only hide item if ALL quantities are distributed to splits
            if (isItemCompletelyDistributed(item, item.uuid)) {
              return null;
            }

            const remainingQuantity = getRemainingQuantity(item, item.uuid);
            const displayQuantity =
              paymentState.splitType === 'item'
                ? remainingQuantity
                : item.quantity;

            return (
              <div key={idx}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-semibold">
                      {displayQuantity}x {item.title}
                      {paymentState.splitType === 'item' &&
                        remainingQuantity < item.quantity && (
                          <span className="ml-2 text-xs text-yellow-400">
                            ({item.quantity - remainingQuantity} assigned to
                            splits)
                          </span>
                        )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      ${(item.price * displayQuantity).toFixed(2)}
                    </span>
                    {/* Plus button for split item mode - only show after split count is set and if there are remaining items */}
                    {paymentState.splitType === 'item' &&
                      paymentState.splitCount > 1 &&
                      remainingQuantity > 0 && (
                        <button
                          onClick={() => {
                            if (item.quantity === 1) {
                              handleAddItemToSplit(item);
                              return;
                            }
                            // Show quantity modal for this item
                            setSelectedItemForSplit(item);
                            setShowQuantityModal(true);
                          }}
                          className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-white hover:bg-primary/90"
                        >
                          +
                        </button>
                      )}
                  </div>
                </div>
                {item.addOns?.map((addon, i) => {
                  // Calculate total assigned for this add-on across all splits
                  let totalAssigned = 0;
                  Object.values(splitItemAssignments).forEach((assignments) => {
                    assignments.forEach((a) => {
                      if (a.itemUuid === item.uuid && a.addOns) {
                        const found = a.addOns.find(
                          (ad) => ad.name === addon.name
                        );
                        if (found) totalAssigned += found.quantity;
                      }
                    });
                  });
                  if (totalAssigned >= addon.quantity) return null;
                  // Only show if not fully distributed
                  return (
                    <div
                      key={i}
                      className="ml-2 flex justify-between text-gray-500"
                    >
                      <span>
                        {addon.quantity - totalAssigned}x {addon.name}
                      </span>
                      <span>
                        $
                        {(
                          addon.price *
                          (addon.quantity - totalAssigned)
                        ).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                {item.note && (
                  <p className="ml-4 text-xs font-semibold text-red">
                    Note**
                    <br />
                    {item.note}
                  </p>
                )}
              </div>
            );
          })}

          {/* Custom Amounts */}
          {paymentState.customAmounts.length > 0 && (
            <>
              {paymentState.customAmounts.map((customAmount) => (
                <div
                  key={customAmount.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-semibold">{customAmount.note}</span>
                      <span className="font-semibold text-white">
                        ${customAmount.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {!isPaymentStarted && (
                    <div className="ml-2 flex justify-end">
                      <button
                        className="flex items-center gap-1 text-xs text-red"
                        onClick={() =>
                          paymentHelpers.removeCustomAmount(customAmount.id)
                        }
                      >
                        <Minus className="h-3 w-3 rounded-full bg-red text-black" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="bottom-0 w-full md:absolute">
          <div className="mt-2 flex justify-between border-gray-700 text-sm font-bold text-gray-400">
            <span>SUB TOTAL</span>
            <span>${finalSubtotal.toFixed(2)}</span>
          </div>

          <hr className="border-gray-700" />

          <div className="flex justify-between">
            {/* Static Surcharges */}
            <div className="w-1/2 space-y-1 pt-4 text-sm text-gray-400">
              <div className="flex justify-between gap-2">
                <span>GST Inc 10%</span>
                <span className="font-semibold text-white">
                  {paymentState.originalTotal > 0
                    ? '$' + gstAmount.toFixed(2)
                    : '0.00'}
                </span>
              </div>

              {/* Payment Surcharges */}
              {isPaymentStarted &&
                paymentState.payments.some(
                  (p) => p.paymentMethod === 'card' && p.surchargeAmount > 0
                ) && (
                  <div className="mt-2 space-y-1">
                    {paymentState.payments
                      .filter(
                        (p) =>
                          p.paymentMethod === 'card' && p.surchargeAmount > 0
                      )
                      .map((payment, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span>
                            {payment.paymentRef}{' '}
                            {payment.surchargePercentage
                              ? `${payment.surchargePercentage}%`
                              : payment.feeCreditType === 'amex'
                              ? '2.9%'
                              : '1.95%'}
                          </span>
                          <span className="font-semibold text-white">
                            ${payment.surchargeAmount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              {selectedSurcharges.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedSurcharges.map((surcharge, i) => (
                    <div key={i}>
                      <div className="flex w-full items-center justify-between gap-4">
                        <div className="flex w-full justify-between gap-2">
                          <span>{surcharge.name}</span>

                          <span className="font-semibold text-white">
                            $
                            {calclateSurcharge(
                              paymentState.originalTotal,
                              Number(surcharge.value) / 100
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1  flex justify-end">
                        <button
                          className="flex items-center gap-1 text-xs text-red"
                          onClick={() =>
                            setSelectedSurcharges((prev) =>
                              prev.filter((_, index) => index !== i)
                            )
                          }
                        >
                          <Minus className="h-3 w-3 rounded-full bg-red text-black" />{' '}
                          Removed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Buttons */}
            <div className="w-1/2 space-y-2 pt-4 text-right text-sm text-white">
              <div>
                <button
                  disabled={
                    paymentState.splitType !== 'none' ||
                    paymentState.tip > 0 ||
                    isPaymentStarted
                  }
                  onClick={() => {
                    setOptionMode('tip');
                  }}
                  className={` ${
                    paymentState.splitType !== 'none' ||
                    paymentState.tip > 0 ||
                    isPaymentStarted
                      ? 'text-muted-foreground'
                      : 'text-white hover:underline'
                  }`}
                >
                  Add Tip &gt;
                </button>
              </div>
              <div>
                <button
                  disabled={
                    paymentState.splitType !== 'none' ||
                    paymentState.discount > 0 ||
                    isPaymentStarted
                  }
                  onClick={() => {
                    setOptionMode('discount');
                  }}
                  className={`${
                    paymentState.splitType !== 'none' ||
                    paymentState.discount > 0 ||
                    isPaymentStarted
                      ? 'text-muted-foreground'
                      : 'text-white hover:underline'
                  }`}
                >
                  Add Discount &gt;
                </button>
              </div>
              <div>
                <button
                  disabled={
                    paymentState.splitType !== 'none' || isPaymentStarted
                  }
                  onClick={() => {
                    setOptionMode('surcharge');
                  }}
                  className={`${
                    paymentState.splitType !== 'none' || isPaymentStarted
                      ? 'text-muted-foreground'
                      : 'text-white hover:underline'
                  }`}
                >
                  Add Surcharge &gt;
                </button>
              </div>
              <div>
                <button
                  disabled={
                    paymentState.splitType !== 'none' || isPaymentStarted
                  }
                  onClick={() => {
                    setOptionMode('custom-amount');
                  }}
                  className={`${
                    paymentState.splitType !== 'none' || isPaymentStarted
                      ? 'text-muted-foreground'
                      : 'text-white hover:underline'
                  }`}
                >
                  Add Custom Amount &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quantity Modal for Split Items */}
      <Dialog open={showQuantityModal} onOpenChange={setShowQuantityModal}>
        <DialogContent>
          <DialogTitle>How many?</DialogTitle>
          {selectedItemForSplit && (
            <>
              {(() => {
                const remainingQty = getRemainingQuantity(
                  selectedItemForSplit,
                  selectedItemForSplit.uuid
                );
                const distributedQty =
                  selectedItemForSplit.quantity - remainingQty;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p>Please enter quantity to split.</p>
                        {distributedQty > 0 && (
                          <p className="text-xs text-yellow-400">
                            Note: {distributedQty} of{' '}
                            {selectedItemForSplit.quantity} already assigned to
                            splits.
                            {remainingQty} remaining.
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setSplitQuantity((prev) => {
                              const val = Math.max(1, parseInt(prev) - 1);
                              return val.toString();
                            });
                          }}
                          variant="outline"
                          className="h-10 w-10 rounded-full bg-secondary p-0"
                          disabled={parseInt(splitQuantity) <= 1}
                        >
                          <Minus size={14} />
                        </Button>
                        <p className="w-8 text-center">{splitQuantity}</p>
                        <Button
                          onClick={() => {
                            setSplitQuantity((prev) => {
                              const val = Math.min(
                                remainingQty,
                                parseInt(prev) + 1
                              );
                              return val.toString();
                            });
                          }}
                          variant="outline"
                          className="h-10 w-10 rounded-full bg-secondary p-0"
                          disabled={parseInt(splitQuantity) >= remainingQty}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {/* New: Add-on assignment section */}
                      {selectedItemForSplit.addOns &&
                        selectedItemForSplit.addOns.length > 0 && (
                          <div className="space-y-4">
                            <p className="text-gray-300">
                              Assign Add-ons to this split:
                            </p>
                            {selectedItemForSplit.addOns.map((addon, idx) => {
                              // Calculate remaining available for this add-on
                              // (total addon.quantity - sum assigned in other splits)
                              let totalAssigned = 0;
                              Object.values(splitItemAssignments).forEach(
                                (assignments) => {
                                  assignments.forEach((a) => {
                                    if (
                                      a.itemUuid ===
                                        selectedItemForSplit.uuid &&
                                      a.addOns
                                    ) {
                                      const found = a.addOns.find(
                                        (ad) => ad.name === addon.name
                                      );
                                      if (found)
                                        totalAssigned += found.quantity;
                                    }
                                  });
                                }
                              );
                              const available = addon.quantity - totalAssigned;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-4"
                                >
                                  <span className="flex-1">
                                    {addon.name} (Available: {available})
                                  </span>
                                  <Button
                                    onClick={() =>
                                      handleAddOnQuantityChange(
                                        idx,
                                        (splitAddOnQuantities[idx] || 0) - 1,
                                        available
                                      )
                                    }
                                    variant="outline"
                                    className="h-10 w-10 rounded-full bg-secondary p-0"
                                    disabled={
                                      (splitAddOnQuantities[idx] || 0) <= 0
                                    }
                                  >
                                    <Minus size={14} />
                                  </Button>
                                  <p className="w-8 text-center">
                                    {splitAddOnQuantities[idx] || 0}
                                  </p>
                                  <Button
                                    onClick={() =>
                                      handleAddOnQuantityChange(
                                        idx,
                                        (splitAddOnQuantities[idx] || 0) + 1,
                                        available
                                      )
                                    }
                                    variant="outline"
                                    className="h-10 w-10 rounded-full bg-secondary p-0"
                                    disabled={
                                      (splitAddOnQuantities[idx] || 0) >=
                                      available
                                    }
                                  >
                                    <Plus size={14} />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      <div className="flex justify-center gap-4">
                        <Button
                          onClick={() => {
                            setShowQuantityModal(false);
                            setSelectedItemForSplit(null);
                            setSplitQuantity('1');
                            setSplitAddOnQuantities({});
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleAddItemToSplit()}
                          variant="submit"
                          disabled={
                            !splitQuantity ||
                            parseInt(splitQuantity) < 1 ||
                            parseInt(splitQuantity) > remainingQty ||
                            (selectedItemForSplit.addOns &&
                              selectedItemForSplit.addOns.some((addon, idx) => {
                                // Don't allow over-assigning add-ons
                                let totalAssigned = 0;
                                Object.values(splitItemAssignments).forEach(
                                  (assignments) => {
                                    assignments.forEach((a) => {
                                      if (
                                        a.itemUuid ===
                                          selectedItemForSplit.uuid &&
                                        a.addOns
                                      ) {
                                        const found = a.addOns.find(
                                          (ad) => ad.name === addon.name
                                        );
                                        if (found)
                                          totalAssigned += found.quantity;
                                      }
                                    });
                                  }
                                );
                                const available =
                                  addon.quantity - totalAssigned;
                                return (
                                  (splitAddOnQuantities[idx] || 0) > available
                                );
                              }))
                          }
                        >
                          Okay
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentModalOrderSummary;

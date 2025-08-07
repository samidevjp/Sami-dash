import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { useToast } from '@/components/ui/use-toast';
import { useCreateTransaction } from './useCreateTransaction';
import { useCreatePayment } from './useCreatePayment';
import { getSum } from '@/lib/utils';

interface Payment {
  value: number;
  paidValue: number;
  typePaid: string;
  change: number;
  paid: boolean;
  itemName?: string;
}

interface PaymentDetails {
  payment_type: number;
  terminal_id: string;
  note: string;
  surcharge_amount: number;
  payed_amount: number;
  cash_amount: number;
  payment_intent_id: string | null;
}

interface PaymentState {
  tipAmount: number;
  remainingPayments: Payment[];
  accumulatedPayments: PaymentDetails[];
  itemsState: any[];
  selectedItems: any[];
  allValues: Payment[];
  selectedPayment: Payment | null;
  isSplitByValue: boolean;
  isSplitByItem: boolean;
  customValue: any[];
}

const formatAmount = (value: any) => {
  if (!value) return '0.00';
  const numericValue = parseInt(String(value), 10);
  const cents = numericValue % 100;
  const dollars = Math.floor(numericValue / 100);
  return `${dollars.toLocaleString()}.${cents < 10 ? `0${cents}` : cents}`;
};

export const usePayment = (employee: any) => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    tipAmount: 0,
    remainingPayments: [],
    accumulatedPayments: [],
    itemsState: [],
    selectedItems: [],
    allValues: [],
    selectedPayment: null,
    isSplitByValue: false,
    isSplitByItem: false,
    customValue: []
  });

  const { createOrder } = useApi();
  const { createTransaction } = useCreateTransaction();
  const { processNextPayment } = useCreatePayment();
  const { toast } = useToast();

  const updatePaymentState = useCallback((updates: Partial<PaymentState>) => {
    setPaymentState((prevState) => ({ ...prevState, ...updates }));
  }, []);

  const handlePayment = useCallback(
    async (amount: number, paymentType: string) => {
      const {
        remainingPayments,
        allValues,
        itemsState,
        accumulatedPayments,
        tipAmount
      } = paymentState;

      const creditSurcharge = paymentType === 'credit' ? 0.017 : 0;
      const totalSurcharge = creditSurcharge + 0;

      const percentage = 0.028;
      const fixedFee = 0.065;

      let paymentAmount = (amount + fixedFee) / (1 - percentage);
      paymentAmount = Math.round(paymentAmount * 100);

      try {
        const payment =
          paymentType === 'credit'
            ? await processNextPayment(paymentAmount)
            : null;

        if (paymentType === 'cash' || payment) {
          const newChange =
            paymentType === 'cash'
              ? amount -
                (paymentState.selectedPayment!.value + paymentState.tipAmount)
              : 0;

          const paymentsPaid = paymentState.allValues.reduce(
            (acc, pmt) => acc + pmt.paidValue,
            0
          );
          const remainingValue = getSum(paymentState.itemsState) - paymentsPaid;

          const paymentDetails: PaymentDetails = {
            payment_type: paymentType === 'cash' ? 1 : 2,
            terminal_id: '',
            note: paymentType === 'cash' ? 'Cash' : 'Credit',
            surcharge_amount:
              creditSurcharge > 0 ? amount * creditSurcharge : 0,
            payed_amount: remainingValue,
            cash_amount: amount,
            payment_intent_id: payment ? payment.id : null
          };

          const updatedAccumulatedPayments = [
            ...accumulatedPayments,
            paymentDetails
          ];

          const customValue = itemsState
            .map((item) =>
              item.custom_item
                ? { value: item.price, type: 2, name: 'Custom Payment' }
                : null
            )
            .filter((item) => item !== null);

          updatePaymentState({
            customValue,
            accumulatedPayments: updatedAccumulatedPayments
          });

          const updatedAllValues = allValues.map((payment) => {
            if (payment === paymentState.selectedPayment) {
              const newValue = payment.value - amount;
              const valuePaid = payment.paidValue + amount;
              return {
                ...payment,
                paidValue: valuePaid,
                paid: payment.value <= paymentAmount / 100,
                typePaid: paymentType,
                change: newChange > 0 ? newChange : 0,
                value: newValue < 0 ? 0 : newValue
              };
            }
            return payment;
          });

          updatePaymentState({ allValues: updatedAllValues });

          const newRemainingPayments = updatedAllValues.filter(
            (payment) => payment.paid !== true
          );
          updatePaymentState({ remainingPayments: newRemainingPayments });

          paymentDetails.payed_amount = paymentAmount;

          if (newRemainingPayments.length === 0) {
            await finalizeOrder(
              updatedAccumulatedPayments,
              itemsState,
              formatAmount(getSum(itemsState) * 100),
              tipAmount,
              customValue
            );
          } else {
            toast({
              title: 'Payment successful',
              description: 'Payment successful',
              variant: 'success',
              duration: 3000
            });
            // navigation.navigate('PaymentLoading');
            // navigateToReceiptScreen(
            //   paymentDetails.payed_amount,
            //   newRemainingPayments,
            //   itemsState,
            //   updatedAllValues
            // );
          }
        } else {
          toast({
            title: 'Payment failed',
            description: 'Payment failed',
            variant: 'destructive',
            duration: 3000
          });
        }
      } catch (err: any) {
        console.log('Error during payment:', err);
        toast({
          title: 'Payment failed',
          description: err.message,
          variant: 'destructive',
          duration: 3000
        });
      }
    },
    [paymentState, processNextPayment, toast, updatePaymentState]
  );

  const finalizeOrder = useCallback(
    async (
      updatedAccumulatedPayments: PaymentDetails[],
      itemsState: any[],
      totalItems: string,
      tipAmount: number,
      customValue: any
    ) => {
      updatePaymentState({
        itemsState: [],
        remainingPayments: [],
        selectedItems: [],
        allValues: [],
        selectedPayment: null,
        isSplitByValue: false,
        isSplitByItem: false,
        tipAmount: 0,
        accumulatedPayments: [],
        customValue: []
      });

      toast({
        title: 'All payments completed and order finalized',
        description: 'All payments completed and order finalized',
        variant: 'success',
        duration: 3000
      });
    },
    [createOrder, createTransaction, toast, updatePaymentState, employee]
  );

  const handleAddTip = useCallback(
    (tip: number) => {
      updatePaymentState({
        tipAmount: getSum(paymentState.itemsState) * tip
      });
    },
    [paymentState.itemsState, updatePaymentState]
  );

  const handleSplitSubmit = useCallback(
    async (type: string, numPeople: number) => {
      const totalValue = getSum(paymentState.itemsState);
      if (type === 'value') {
        const values = Array(numPeople).fill(totalValue / numPeople);
        const allValues = values.map((value) => ({
          value,
          paidValue: 0,
          typePaid: '',
          change: 0,
          paid: false
        }));
        updatePaymentState({
          isSplitByValue: true,
          isSplitByItem: false,
          remainingPayments: allValues,
          allValues
        });
      } else {
        let allValues: any = [];
        paymentState.itemsState.forEach((item: any) => {
          for (let i = 0; i < item.quantity; i++) {
            allValues.push({
              value: item.price,
              paidValue: 0,
              typePaid: '',
              change: 0,
              paid: false,
              itemName: item.title
            });
          }
        });
        updatePaymentState({
          isSplitByValue: false,
          isSplitByItem: true,
          remainingPayments: allValues,
          allValues
        });
      }
    },
    [paymentState.itemsState, updatePaymentState]
  );

  return {
    paymentState,
    updatePaymentState,
    handlePayment,
    handleAddTip,
    handleSplitSubmit,
    finalizeOrder
  };
};

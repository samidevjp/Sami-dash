import { SurchargeItem } from '@/types';

// Helper function to round to 2 decimal places
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const calculateTipByRate = (
  subtotal: number,
  discount: number,
  redeem: number,
  rate: number
) => {
  const result = (subtotal - discount - redeem) * rate;
  return roundToTwoDecimals(result);
};

export const calclateDiscountByRate = (subtotal: number, rate: number) => {
  const result = subtotal * rate;
  return roundToTwoDecimals(result);
};

export const calculateFinalSubtotal = (
  subtotal: number,
  discount: number,
  redeem: number
) => {
  const result = subtotal - discount - redeem;
  return roundToTwoDecimals(result);
};

export const calculateGST = (
  finalSubtotal: number,
  tip: number,
  surcharges: number[]
) => {
  const sumSurcharges: number = surcharges.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  const result = ((finalSubtotal + tip + sumSurcharges) / 1.1) * 0.1;
  return roundToTwoDecimals(result);
};

export const calclateTotal = (
  finalSubtotal: number,
  surcharges: number[],
  tip: number
) => {
  const result =
    finalSubtotal + tip + surcharges.reduce((acc, curr) => acc + curr, 0);
  return roundToTwoDecimals(result);
};

export const calclateSurcharge = (finalSubtotal: number, rate: number) => {
  const result = finalSubtotal * rate;
  return roundToTwoDecimals(result);
};

export const getSelectedSurchargePrices = (
  finalSubtotal: number,
  surcharges: SurchargeItem[]
): number[] => {
  return surcharges.map((surcharge) => {
    const result = calclateSurcharge(
      finalSubtotal,
      Number(surcharge.value) / 100
    );
    return roundToTwoDecimals(result);
  });
};

export const formatDisplayAmount = (amount: string): string => {
  const numeric = parseFloat(amount.replace(/,/g, '') || '0');
  return numeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

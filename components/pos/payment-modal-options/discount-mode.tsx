'use client';
import React from 'react';

import { calclateDiscountByRate } from '@/lib/calc';
import { Button } from '@/components/ui/button';
import { PaymentOptionMode } from '@/types';

interface DiscountModeProps {
  originalTotal: number;
  handleAdditionalChargeChange: (field: 'discount', amount: number) => void;
  setOptionMode: (mode: PaymentOptionMode) => void;
}
const discounts = [5, 10, 20, 25, 50];

const DiscountMode: React.FC<DiscountModeProps> = ({
  originalTotal,
  handleAdditionalChargeChange,
  setOptionMode
}) => {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      {discounts.map((discount) => (
        <Button
          key={discount}
          className="mb-2 w-full bg-[#1F2122] py-8 text-white hover:bg-primary"
          onClick={() => {
            const discountAmount = calclateDiscountByRate(
              originalTotal,
              discount / 100
            );
            handleAdditionalChargeChange('discount', discountAmount);
            setOptionMode('default');
          }}
        >
          {discount.toFixed(1)}%
        </Button>
      ))}
      {/* <Button
        className="w-full bg-[#1F2122] py-8 text-white hover:bg-primary"
        onClick={() => setOptionMode('custom-discount')}
      >
        Custom Amount
      </Button> */}
    </div>
  );
};

export default DiscountMode;

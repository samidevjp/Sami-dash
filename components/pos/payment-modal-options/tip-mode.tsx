'use client';
import { Button } from '@/components/ui/button';
import { PaymentOptionMode } from '@/types';
import React from 'react';
const tipRates = [2, 5, 10, 15, 20];

interface TipModeProps {
  handleAdditionalChargeChange: (field: 'tipRate', value: number) => void;
  setOptionMode: (mode: PaymentOptionMode) => void;
}

const TipMode: React.FC<TipModeProps> = ({
  handleAdditionalChargeChange,
  setOptionMode
}) => {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      {tipRates.map((tipRate) => (
        <Button
          key={tipRate}
          className="mb-2 w-full bg-[#1F2122] py-8 text-white hover:bg-primary"
          onClick={() => {
            handleAdditionalChargeChange('tipRate', tipRate / 100);
            setOptionMode('default');
          }}
        >
          {tipRate.toFixed(1)}%
        </Button>
      ))}
      {/* <Button
        className="w-full bg-[#1F2122] py-8 text-white hover:bg-primary"
        onClick={() => {
          setOptionMode('custom-tip');
        }}
      >
        Custom Amount
      </Button> */}
    </div>
  );
};

export default TipMode;

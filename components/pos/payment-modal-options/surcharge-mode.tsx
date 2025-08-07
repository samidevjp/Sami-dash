'use client';
import React from 'react';
import { PaymentOptionMode, SurchargeItem } from '@/types';
import { Button } from '@/components/ui/button';

interface SurchargeModeProps {
  filteredSurcharges: SurchargeItem[];
  setSelectedSurcharges: React.Dispatch<React.SetStateAction<SurchargeItem[]>>;
  setOptionMode: (mode: PaymentOptionMode) => void;
  selectedSurcharges: SurchargeItem[];
}

const SurchargeMode: React.FC<SurchargeModeProps> = ({
  filteredSurcharges,
  setSelectedSurcharges,
  setOptionMode,
  selectedSurcharges
}) => {
  const isSelected = (surcharge: SurchargeItem) =>
    selectedSurcharges.some((s) => s.id === surcharge.id);

  const toggleSurcharge = (surcharge: SurchargeItem) => {
    setSelectedSurcharges((prev) => {
      const alreadySelected = prev.some((s) => s.id === surcharge.id);
      if (alreadySelected) {
        return prev.filter((s) => s.id !== surcharge.id);
      } else {
        return [...prev, surcharge];
      }
    });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      {filteredSurcharges.map((surcharge) => {
        const selected = isSelected(surcharge);
        return (
          <Button
            key={surcharge.id}
            className={`mb-2 w-full py-8 text-white transition-colors ${
              selected ? 'bg-primary ' : 'bg-[#1F2122] hover:bg-primary'
            }`}
            onClick={() => {
              toggleSurcharge(surcharge);
              setOptionMode('default');
            }}
          >
            {surcharge.name} {surcharge.value}%
          </Button>
        );
      })}
    </div>
  );
};

export default SurchargeMode;

'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentOptionMode } from '@/types';
import { UsePaymentStateReturn } from '@/hooks/usePaymentState';
import React, { useState } from 'react';
import NumberPad from './number-pad';
import { formatDisplayAmount } from '@/lib/calc';

interface CustomAmountModeProps {
  setOptionMode: (mode: PaymentOptionMode) => void;
  paymentHelpers: UsePaymentStateReturn;
}

const CustomAmountMode: React.FC<CustomAmountModeProps> = ({
  setOptionMode,
  paymentHelpers
}) => {
  const [noteInput, setNoteInput] = useState('');
  const { addCustomAmount, handleCalculatorInput, cashAmount, resetNumberPad } =
    paymentHelpers;

  const handleAddCustomAmount = () => {
    const amount = parseFloat(cashAmount || '0');
    if (amount > 0) {
      addCustomAmount(
        amount,
        noteInput.trim() ? '1x ' + noteInput.trim() : '1x Custom Amount'
      );
      resetNumberPad();
      setNoteInput('');
      setOptionMode('default');
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      {/* Amount Display */}
      <div className="mb-4 w-full rounded border border-white px-4 py-2 text-left text-4xl text-white">
        ${formatDisplayAmount(cashAmount)}
      </div>

      {/* Note Input */}
      <div className="mb-4 w-full">
        <Input
          type="text"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Add Note"
          className="rounded border-white"
        />
      </div>

      {/* Number Pad */}
      <NumberPad
        handleCalculatorInput={handleCalculatorInput}
        onAddCustomAmount={handleAddCustomAmount}
      />
    </div>
  );
};

export default CustomAmountMode;

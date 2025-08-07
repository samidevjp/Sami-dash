'use client';
import React from 'react';
import { Button } from '../../ui/button';

interface NumberPadProps {
  handleCalculatorInput: (input: string, field?: string) => void;
  field?: string;
  className?: string;
  onAddCustomAmount?: () => void; // New prop for custom amount functionality
}

const NumberPad: React.FC<NumberPadProps> = ({
  handleCalculatorInput,
  field,
  className = 'grid w-3/4 grid-cols-3 gap-4',
  onAddCustomAmount
}) => {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className={className}>
      {keys.map((key) => (
        <Button
          key={key}
          className="h-20 bg-[#1F2122] text-2xl text-white hover:bg-primary"
          onClick={() => handleCalculatorInput(String(key), field)}
        >
          {key}
        </Button>
      ))}

      {/* Add Custom Amount button or Empty */}
      <Button
        className="h-20 bg-[#1F2122] text-sm text-white hover:bg-primary"
        onClick={onAddCustomAmount}
        disabled={!onAddCustomAmount}
      >
        {onAddCustomAmount ? 'Add Custom Amount' : ''}
      </Button>

      <Button
        className="h-20 bg-[#1F2122] text-2xl text-white hover:bg-primary"
        onClick={() => handleCalculatorInput('0', field)}
      >
        0
      </Button>

      <Button
        className="h-20 bg-[#1F2122] text-2xl text-white hover:bg-primary"
        onClick={() => handleCalculatorInput('<', field)}
      >
        &lt;
      </Button>
    </div>
  );
};

export default NumberPad;

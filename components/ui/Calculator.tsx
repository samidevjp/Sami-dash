import React from 'react';

interface CalculatorProps {
  onAmountChange: (input: string) => void;
  cashAmount: string;
  total: string;
}

const Calculator: React.FC<CalculatorProps> = ({
  onAmountChange,
  cashAmount,
  total
}) => {
  const buttons = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '.',
    '0',
    '<',
    '+'
  ];

  return (
    <div className="flex w-full max-w-xs flex-col gap-4 overflow-hidden rounded-lg">
      <div className="bg-[#1F2122] p-4 text-right">
        <p className="text-2xl font-semibold text-white">Total Due</p>
        <p className="text-3xl font-bold text-white">
          {Number(total).toFixed(2)}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1">
        {buttons.map((btn) => (
          <button
            key={btn}
            className={`h-16 rounded bg-[#1F2122] text-xl font-semibold text-white
                ${btn === '+' ? 'col-span-3' : ''}
                ${btn === '<' ? 'bg-gray-600' : ''}
                transition-colors hover:bg-gray-600`}
            onClick={() => onAmountChange(btn)}
          >
            {btn === '<' ? '⌫' : btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;

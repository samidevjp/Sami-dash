import React from 'react';

interface ShiftIndicatorProps {
  setSelectedDate: (date: Date) => void;
  selectedShift: number | undefined;
  isSpecialDay?: boolean;
}

const ShiftIndicator: React.FC<ShiftIndicatorProps> = ({
  setSelectedDate,
  selectedShift,
  isSpecialDay
}) => {
  const goToCurrentDate = () => {
    setSelectedDate(new Date());
  };

  return (
    <div
      className="bg-dray-dark flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow" // if you want to add shadow, put "shadow-custom-inset" here
      onClick={goToCurrentDate}
    >
      <div
        className={`${
          selectedShift !== undefined
            ? isSpecialDay
              ? 'bg-red'
              : 'bg-green'
            : 'bg-red'
        } h-4 w-4 rounded-full`}
      />
    </div>
  );
};

export default ShiftIndicator;

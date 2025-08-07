import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';

interface SortTransactionsProps {
  date: string;
  shiftId: number;
  allShifts: any[];
  paymentType: number;
  orderType: number;
  keyword: string;
  setKeyword: (value: string) => void;
  togglePaymentType: () => void;
  toggleOrderType: () => void;
  toggleShiftId: () => void;
  changeDate: (days: number) => void;
}
const SortTransactions: React.FC<SortTransactionsProps> = ({
  date,
  shiftId,
  allShifts,
  paymentType,
  orderType,
  keyword,
  setKeyword,
  togglePaymentType,
  toggleOrderType,
  toggleShiftId,
  changeDate
}) => {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-4">
        {/* Sort by Date */}
        <div className="">
          <p className="mb-1 text-xs">Date</p>
          <div className="flex items-center rounded-md border border-border px-3 py-2 shadow-sm sm:text-sm">
            <button onClick={() => changeDate(-1)}>{'<'}</button>
            <span className="mx-4 text-foreground">{date}</span>
            <button onClick={() => changeDate(1)}>{'>'}</button>
          </div>
        </div>
        {/* Sort by Shift */}
        <div className="">
          <p className="mb-1 text-xs">Shift</p>
          <Button
            className="w-44 rounded-md px-4 py-2"
            variant="secondary"
            onClick={toggleShiftId}
          >
            {/* {shiftId === 4 ? 'Lunch' : 'Dinner'} */}
            {allShifts.find((shift) => shift.id === shiftId)?.name}
          </Button>
        </div>
        {/* Button for Payment Type */}
        <div className="">
          <p className="mb-1 text-xs">Payment Type</p>
          <Button
            className="w-44 rounded-md px-4 py-2"
            variant="secondary"
            onClick={togglePaymentType}
          >
            {paymentType === 0 ? 'All' : paymentType === 1 ? 'Cash' : 'Credit'}
          </Button>
        </div>
        {/* Button for Order Type */}
        <div className="">
          <p className="mb-1 text-xs">Order Type</p>
          <Button
            className="w-44 rounded-md px-4 py-2"
            variant="secondary"
            onClick={toggleOrderType}
          >
            {orderType === 0
              ? 'All'
              : orderType === 1
              ? 'Dine In'
              : 'Take Away'}
          </Button>
        </div>
        {/* Name or Receipt # */}
        <div className="">
          <p className="mb-1 text-xs">Search</p>
          {/* <label className="block text-sm font-medium text-foreground"> </label> */}
          <Input
            className="block w-80 rounded-md px-3 py-2"
            placeholder=" Name or Receipt#"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
export default SortTransactions;

import React, { useEffect, useState } from 'react';

import { daysOfWeek } from '../../common/const';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PayRate } from '@/types';
interface PayRatesProps {
  payRates: PayRate[];
  setPayRates: (newPayRates: PayRate[]) => void;
}
const PayRates: React.FC<PayRatesProps> = ({ payRates = [], setPayRates }) => {
  const [initializedPayRates, setInitializedPayRates] = useState<PayRate[]>([]);
  useEffect(() => {
    const allDays = Object.keys(daysOfWeek).map((day) => {
      const dayNumber = daysOfWeek[day];
      return (
        payRates.find((rate) => rate.day_number === dayNumber) || {
          day_number: dayNumber,
          rate: 0
        }
      );
    });
    setInitializedPayRates(allDays);
    if (payRates.length !== allDays.length) {
      setPayRates(allDays);
    }
  }, [payRates, setPayRates]);
  const handleRateChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newPayRates = [...initializedPayRates];
    newPayRates[index].rate = parseFloat(event.target.value);
    setInitializedPayRates(newPayRates);
    setPayRates(newPayRates);
  };
  return (
    <div className="">
      {initializedPayRates.map((payRate: PayRate, index: number) => {
        const dayName = Object.keys(daysOfWeek).find(
          (key) => daysOfWeek[key] === payRate.day_number
        );
        if (!dayName) {
          return null;
        }
        return (
          <div key={index} className="mb-4 w-full">
            <Label className="">
              <p className="mb-2 text-muted-foreground">{dayName}</p>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={payRate.rate}
                  onChange={(event) => handleRateChange(index, event)}
                  className="w-full pl-8"
                  placeholder="Enter rate"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">
                  per hour
                </span>
              </div>
            </Label>
          </div>
        );
      })}
    </div>
  );
};
export default PayRates;

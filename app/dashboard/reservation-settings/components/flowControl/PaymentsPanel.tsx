import React from 'react';
import { Input } from '@/components/ui/input';
import { CreditCard, XCircle, LockKeyhole } from 'lucide-react';
interface PaymentsPanelProps {
  paymentType: string;
  setPaymentType: (value: string) => void;
  paymentValue: number;
  setPaymentValue: (value: number) => void;
}
const PaymentsPanel: React.FC<PaymentsPanelProps> = ({
  paymentType,
  setPaymentType,
  paymentValue,
  setPaymentValue
}) => {
  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        {/* No Payment Button */}
        <div
          onClick={() => setPaymentType('0')}
          className={`flex h-40 w-40 cursor-pointer flex-col items-center justify-center space-y-2 rounded-lg p-4 ${
            paymentType === '0' ? 'bg-primary text-white' : 'bg-secondary'
          }`}
        >
          <XCircle size={40} />
          <span>No Payment</span>
        </div>
        {/* Booking Fee Button */}
        <div
          onClick={() => setPaymentType('1')}
          className={`flex h-40 w-40 cursor-pointer flex-col items-center justify-center space-y-2 rounded-lg p-4 ${
            paymentType === '1' ? 'bg-primary text-white' : 'bg-secondary'
          }`}
        >
          <CreditCard size={40} />
          <span>Booking Fee</span>
        </div>
        <div
          onClick={() => setPaymentType('2')}
          className={`flex h-40 w-40 cursor-pointer flex-col items-center justify-center space-y-2 rounded-lg p-4 ${
            paymentType === '2' ? 'bg-primary text-white' : 'bg-secondary'
          }`}
        >
          <LockKeyhole size={40} />
          <span>Require Credit Card Details</span>
        </div>
      </div>
      {/* Amount Input - only shown if "Booking Fee" is selected */}
      {paymentType === '1' && (
        <div>
          <label className="mb-2 block">Amount</label>
          <div className="flex items-center">
            <span className="mr-2">$</span>
            <Input
              type="number"
              value={paymentValue}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0) {
                  setPaymentValue(value);
                }
              }}
              className="w-40"
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default PaymentsPanel;

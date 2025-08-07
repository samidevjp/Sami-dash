// context/PaymentContext.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { usePaymentState } from '@/hooks/usePaymentState';
import { PaymentState } from '@/types';

type PaymentContextType = ReturnType<typeof usePaymentState>;

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

type PaymentProviderProps = {
  initialTotal: number;
  items: any[];
  children: React.ReactNode;
};

export const PaymentProvider = ({
  children,
  initialTotal,
  items
}: {
  children: React.ReactNode;
  initialTotal: number;
  items: any[];
}) => {
  const payment = usePaymentState(initialTotal, items);

  return (
    <PaymentContext.Provider value={payment}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (!context)
    throw new Error('usePaymentContext must be used within PaymentProvider');
  return context;
};

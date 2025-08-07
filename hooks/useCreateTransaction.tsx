// useCreateTransaction.ts
import { useState } from 'react';
import { useApi } from './useApi';

export const useCreateTransaction = () => {
  const [error, setError] = useState('');
  const { createTransaction: createTransactionApi } = useApi();

  const createTransaction = async (transaction: any) => {
    try {
      console.log('transaction inside', transaction);
      const apiResponse = await createTransactionApi(transaction);
      return apiResponse;
    } catch (error) {
      setError('Failed to create transaction');
      console.error(error);
    }
  };

  return { createTransaction, error };
};

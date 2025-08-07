import { useState, useEffect, useCallback } from 'react';

import { addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useApi } from '@/hooks/useApi';

interface Invoice {
  id: number;
  amount: number;
  supplier: string;
  invoice_no: string;
  receive_by: string;
  date: string;
  file_path: string | null;
  products: Product[];
  stock_number: string;
  paid: boolean;
}

interface Product {
  item_name: string;
  quantity: number;
  price: string;
  total_amount: string;
}

const useInvoiceTotals = () => {
  const { getInvoiceData } = useApi();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceTotals, setInvoiceTotals] = useState({
    today: 0,
    week: 0,
    twoweeks: 0,
    month: 0,
    total: 0
  });

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await getInvoiceData();
      if (response.code === 'OK') {
        setInvoices(response.data.invoices.reverse());
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  }, [getInvoiceData]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    calculateInvoiceTotals();
  }, [invoices]);

  const calculateInvoiceTotals = () => {
    const today = startOfDay(new Date());
    const weekStart = addDays(today, -7);
    const twoWeekStart = addDays(today, -14);
    const monthStart = addDays(today, -30);
    // const monthStart = startOfMonth(new Date());

    const totals = invoices.reduce(
      (acc, invoice) => {
        const invoiceDate = new Date(invoice.date);
        const amount = invoice.amount;

        acc.total += amount;

        if (
          isWithinInterval(invoiceDate, { start: today, end: endOfDay(today) })
        ) {
          acc.today += amount;
        }
        if (
          isWithinInterval(invoiceDate, {
            start: weekStart,
            end: endOfDay(today)
          })
        ) {
          acc.week += amount;
        }
        if (
          isWithinInterval(invoiceDate, {
            start: twoWeekStart,
            end: endOfDay(today)
          })
        ) {
          acc.twoweeks += amount;
        }
        if (
          isWithinInterval(invoiceDate, {
            start: monthStart,
            end: endOfDay(today)
          })
        ) {
          acc.month += amount;
        }

        return acc;
      },
      { today: 0, week: 0, twoweeks: 0, month: 0, total: 0 }
    );

    setInvoiceTotals(totals);
  };

  return { invoiceTotals, invoices, fetchInvoices };
};

export default useInvoiceTotals;

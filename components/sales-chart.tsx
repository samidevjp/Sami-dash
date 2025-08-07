'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface SalesData {
  sales: {
    cash: number;
    credit: number;
    amex: number;
    eftpos: number;
  };
}

export function SalesChart({ data }: { data: SalesData }) {
  const chartData = [
    { name: 'Cash', value: data.sales.cash },
    { name: 'Credit', value: data.sales.credit },
    { name: 'AMEX', value: data.sales.amex },
    { name: 'EFTPOS', value: data.sales.eftpos }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

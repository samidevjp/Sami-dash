'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface EmployeeSale {
  employee_name: string;
  total_sales: number;
}

export function EmployeeSalesChart({ data }: { data: EmployeeSale[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="employee_name" />
        <YAxis />
        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
        <Bar dataKey="total_sales" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

'use client';

import { useEffect } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface CategorySalesItem {
  name: string;
  total_count: number;
  total_sales: number;
  sales_percentage: string;
}

interface CategorySalesData {
  items: CategorySalesItem[];
}
interface CategorySalesChartProps {
  data: CategorySalesData;
  width?: any;
  height?: number;
}

export function CategorySalesChart({
  data,
  width = 100,
  height = 400
}: CategorySalesChartProps) {
  const hasNoData = !data.items || data.items.length === 0;
  const hasNoSales = data.items?.every((item) => item.total_count === 0);

  const chartData = data.items
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 10); // Show top 10 categories

  return (
    <ResponsiveContainer width="100%" height={height}>
      {hasNoData || hasNoSales ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No sales data available for this period
        </div>
      ) : (
        <BarChart data={chartData} layout="vertical" className="text-xs">
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={width} />
          <Tooltip
            cursor={{ fill: 'rgba(76, 81, 191, 0.1)' }}
            labelClassName="text-muted-foreground"
            formatter={(value, name, props) => [
              `$${Number(value).toFixed(2)}`,
              `${Number(props.payload.sales_percentage).toFixed(2)}%`
            ]}
            contentStyle={{
              padding: '2px 6px',
              lineHeight: '1.5',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#000000'
            }}
          />
          <Bar
            dataKey="total_sales"
            fill="#4C51BF"
            maxBarSize={10}
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}

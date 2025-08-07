'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface OverviewProps {
  data: Array<{
    name: string;
    total_sales: number;
  }>;
}

export function Overview({ data }: OverviewProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    total: item.total_sales
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No sales data available for this period
        </div>
      ) : (
        <BarChart data={chartData} className="text-xs">
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip
            cursor={{ fill: 'rgba(255, 204, 128, 0.2)' }}
            formatter={(value) => [`$${value}`, 'Total']}
            contentStyle={{
              padding: '2px 6px',
              lineHeight: '1.5',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#000000'
            }}
          />
          <Bar dataKey="total" fill="#FFCC80" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}

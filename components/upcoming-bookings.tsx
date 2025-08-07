'use client';
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
  total_covers: number;
  total_bookings: number;
}
interface CategorySalesData {
  items: CategorySalesItem[];
  all_covers: number;
  all_bookings: number;
}
interface UpcomingBookingsProps {
  data: CategorySalesData;
  width?: any;
  height?: number;
}
export function UpcomingBookings({
  data,
  width = 100,
  height = 400
}: UpcomingBookingsProps) {
  const chartData = data.items
    .sort((a, b) => b.total_covers - a.total_covers)
    .slice(0, 10);
  return (
    <ResponsiveContainer width="100%" height={height} className="text-xs">
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={width} />
        <Tooltip
          labelClassName="text-muted-foreground"
          formatter={(value, name, entry) => {
            const { total_covers, total_bookings } = entry.payload;
            return [`${total_bookings} Parties / ${total_covers} Covers`, ''];
          }}
          cursor={{ fill: 'rgba(76, 81, 191, 0.1)' }}
          contentStyle={{
            padding: '2px 6px',
            lineHeight: '1.5',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            color: '#000000'
          }}
        />
        <Bar
          dataKey="total_covers"
          fill="#4C51BF"
          maxBarSize={10}
          radius={[0, 6, 6, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

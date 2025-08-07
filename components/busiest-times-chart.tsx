'use client';

import { useEffect } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';

interface BusiestTimeItem {
  time: string; // Example: '12pm'
  total_sales: number;
}

interface BusiestTimesData {
  items: BusiestTimeItem[];
}

function convertTo24HourFormat(timeStr: string): string {
  const [hourStr, modifier] = timeStr.toLowerCase().split(/(am|pm)/);
  let hour = parseInt(hourStr.trim(), 10);

  if (modifier === 'pm' && hour !== 12) hour += 12;
  if (modifier === 'am' && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, '0')}:00`;
}

function convertToAmPmFormat(hourStr: string): string {
  const hour = parseInt(hourStr.split(':')[0], 10);
  const suffix = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}${suffix}`;
}

function generateHourRange(startHour: number, endHour: number): string[] {
  const range: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    range.push(`${h.toString().padStart(2, '0')}:00`);
  }
  return range;
}

export function BusiestTimesChart({ data }: { data: BusiestTimesData }) {
  const convertedTimes = data.items.map((item) =>
    convertTo24HourFormat(item.time)
  );
  const hourNumbers = convertedTimes.map((t) => parseInt(t.split(':')[0], 10));
  const minHour = Math.min(...hourNumbers);
  const maxHour = Math.max(...hourNumbers);

  const allTimes = generateHourRange(minHour, maxHour);

  const chartData = allTimes.map((hour) => {
    const found = data.items.find(
      (item) => convertTo24HourFormat(item.time) === hour
    );
    return {
      time24: hour,
      sales: found ? found.total_sales : 0
    };
  });

  useEffect(() => {
    console.log(chartData);
  }, [chartData]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      {data.items.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No sales data available for this period
        </div>
      ) : (
        <BarChart data={chartData} className="text-xs">
          <XAxis
            dataKey="time24"
            tickFormatter={(tick) => convertToAmPmFormat(tick)}
          />
          <YAxis />
          <Tooltip
            cursor={{ fill: 'rgba(130, 202, 157, 0.1)' }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
            labelFormatter={(label: string) => convertToAmPmFormat(label)}
            contentStyle={{
              padding: '2px 6px',
              lineHeight: '1.5',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#000000'
            }}
          />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <Bar
            dataKey="sales"
            fill="#82ca9d"
            maxBarSize={10}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}

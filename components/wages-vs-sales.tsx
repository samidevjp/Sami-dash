import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatNumberWithCommas } from '@/lib/utils';
import { Infinity } from 'lucide-react';

interface WagesVsSalesProps {
  totalWage: number;
  totalSales: number;
}

export const WagesVsSales: React.FC<WagesVsSalesProps> = ({
  totalWage = 0,
  totalSales = 0
}) => {
  const isInfinite = Number(totalSales) === 0 && Number(totalWage) > 0;
  const isNoData = Number(totalSales) === 0 && Number(totalWage) === 0;

  const getWagePercentageDisplay = () => {
    if (isNoData) {
      return <span className="text-xs">No Data</span>;
    }
    if (isInfinite) {
      return <span className="text-xs">No Sales</span>;
    }
    if (Number(totalWage) === 0) {
      return '0%';
    }
    return ((totalWage / totalSales) * 100).toFixed(2) + '%';
  };

  const wagePercentage = getWagePercentageDisplay();
  const isWagePercentageFull =
    isInfinite || isNoData || (totalWage / totalSales) * 100 > 100;

  const chartData = isWagePercentageFull
    ? [{ name: 'Nodata', value: 1, color: '#1f2937' }]
    : [
        { name: 'Wages', value: totalWage, color: '#1f2937' },
        { name: 'Remaining', value: totalSales - totalWage, color: '#485df9' }
      ];

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        {/* Left side - Circular Chart */}
        <div className=" flex justify-center sm:justify-start">
          <div className="relative h-32 w-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={59}
                  outerRadius={60}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="transparent"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold">{wagePercentage}</span>
            </div>
          </div>
        </div>

        {/* Right side - Financial Metrics */}
        <div className="flex flex-col items-center space-y-3 sm:items-start">
          <div className="text-center text-sm sm:text-left">
            <p className="text-xs text-gray-500">Total wages</p>
            <p className="flex items-center gap-1">
              <span className="text-xs">$</span>
              <span className="text-xl font-medium">
                {formatNumberWithCommas(totalWage)}
              </span>
            </p>
          </div>
          <div className="text-center text-sm sm:text-left">
            <p className="text-xs text-gray-500">Total Sales</p>
            <p className="flex items-center gap-1">
              <span className="text-xs font-normal">$</span>
              <span className="text-xl font-medium">
                {formatNumberWithCommas(totalSales)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

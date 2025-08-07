import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IconBadge from '@/components/ui/iconBadge';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import moment from 'moment';

interface SalesData {
  result: Record<string, { sales: string }>;
  total_sold_items: number;
}

interface AnalyticsChartData {
  date: string;
  value: number;
}

interface SalesDashboardProps {
  dayViewSales: SalesData | null;
  analyticsChartData: AnalyticsChartData[];
  filter: string;
}

export default function SalesDashboard({
  dayViewSales,
  analyticsChartData,
  filter
}: SalesDashboardProps) {
  const totalSales = Object.values(dayViewSales?.result || {})
    .reduce((acc: number, curr: any) => acc + parseFloat(curr.sales), 0)
    .toFixed(2);

  const formatDate = (value: string) => {
    if (filter === 'today') {
      return value;
    } else if (filter === '14 days' || filter === '30 days') {
      return moment(value, 'YYYY-MM-DD').format('MMM D');
    } else {
      return value;
    }
  };

  return (
    <div>
      <Card variant="secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconBadge icon={TrendingUp} />
            <span>Sales Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8 px-6 md:w-1/2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="border-none">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <IconBadge icon={DollarSign} />
                    <span>Total Sales</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-1 text-3xl font-medium">
                    <span className="text-base">$</span>
                    {totalSales}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <IconBadge icon={ShoppingCart} />
                    <span>Total Items Sold</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="ml-4 text-3xl font-medium">
                    {dayViewSales?.total_sold_items || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip
                  labelStyle={{ color: 'black' }}
                  formatter={(value: any) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4C51BF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IconBadge from '@/components/ui/iconBadge';
import { LayoutGrid, Clock, PackageCheck, List } from 'lucide-react';
import { CategorySalesChart } from '@/components/category-sales-chart';
import { BusiestTimesChart } from '@/components/busiest-times-chart';
import { Overview } from '@/components/overview';
import { OrderTypesChart } from '@/components/order-types-chart';

interface AnalyticsData {
  category_solds: any;
  busiest_times: any;
  item_sold: {
    items: any;
  };
  orders: any;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card variant="secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconBadge icon={LayoutGrid} />
            <span>Sales by Category</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategorySalesChart data={data.category_solds} />
        </CardContent>
      </Card>
      <Card variant="secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconBadge icon={Clock} />
            <span>Busiest Times</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BusiestTimesChart data={data.busiest_times} />
        </CardContent>
      </Card>
      <Card variant="secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconBadge icon={PackageCheck} />
            <span>Sold Products</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Overview data={data.item_sold.items} />
        </CardContent>
      </Card>
      <Card variant="secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconBadge icon={List} />
            <span>Order Types</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTypesChart data={data.orders} />
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import IconBadge from '@/components/ui/iconBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  ChevronUp,
  Package,
  AlertCircle,
  Flame,
  BarChart2
} from 'lucide-react';

interface BarGraphProps {
  data: any;
  dataKeyX: string;
  dataKeyY: string;
  title: string;
  fill?: string;
}

function BarGraph({
  data,
  dataKeyX,
  dataKeyY,
  title,
  fill = '#3b82f6'
}: BarGraphProps) {
  return (
    <div className="lg:[35vw] h-[300px] w-[80vw] md:w-[40vw]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <XAxis dataKey={dataKeyX} />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey={dataKeyY}
            className="rounded-t-xl"
            fill={fill}
            background={{ fill: 'rgba(59, 130, 246, 0.2)' }}
            radius={[10, 10, 0, 0]}
            barSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function InventoryOverview({ analyticsData }: any) {
  const [totalStockValue, setTotalStockValue] = useState<any>(0);
  const [lowStockItems, setLowStockItems] = useState<any>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<any>([]);
  const [highStockProducts, setHighStockProducts] = useState<any>([]);
  const [categoryStockValues, setCategoryStockValues] = useState<any>({});
  const [stockOnHand, setStockOnHand] = useState<any>([]);
  const [monthlyStockCost, setMonthlyStockCost] = useState<any>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  useEffect(() => {
    const storedHiddenCategories = localStorage.getItem('hiddenCategories');
    if (storedHiddenCategories) {
      setHiddenCategories(JSON.parse(storedHiddenCategories));
    }
  }, []);

  useEffect(() => {
    hiddenCategories.length > 0 &&
      localStorage.setItem(
        'hiddenCategories',
        JSON.stringify(hiddenCategories)
      );
  }, [hiddenCategories]);

  const toggleCategoryVisibility = (category: string) => {
    setHiddenCategories((prevHiddenCategories) =>
      prevHiddenCategories.includes(category)
        ? prevHiddenCategories.filter((cat) => cat !== category)
        : [...prevHiddenCategories, category]
    );
  };

  const showHiddenCategory = (category: string) => {
    setHiddenCategories((prevHiddenCategories) =>
      prevHiddenCategories.filter((cat) => cat !== category)
    );
  };

  useEffect(() => {
    if (analyticsData) {
      // Low Stock Items
      const lowStock = analyticsData
        ?.filter(
          (item: any) =>
            item.pos_inventory_item_stock &&
            Number(item.pos_inventory_item_stock.total_stock_unit) <
              Number(item.par_level_unit)
        )
        .sort((a: any, b: any) => {
          const aValue =
            (Number(a.pos_inventory_item_stock?.total_stock_unit) /
              Number(a.par_level_unit)) *
            100;
          const bValue =
            (Number(b.pos_inventory_item_stock?.total_stock_unit) /
              Number(b.par_level_unit)) *
            100;
          return bValue - aValue;
        });

      setLowStockItems(lowStock);

      // High Stock Products
      const highStock = analyticsData
        .filter((item: any) => item.pos_inventory_item_stock)
        .sort((a: any, b: any) => {
          const aStock = Number(a.pos_inventory_item_stock?.total_stock_unit);
          const bStock = Number(b.pos_inventory_item_stock?.total_stock_unit);
          return bStock - aStock;
        })
        .slice(0, 5); // Limit to top 5 high stock products
      setHighStockProducts(highStock);

      // Top Selling Products
      const topSelling = analyticsData
        .filter((item: any) => item.pos_inventory_item_stock)
        .sort((a: any, b: any) => {
          const aSold =
            Number(a.stock_amount) -
            Number(a.pos_inventory_item_stock?.total_stock_unit);
          const bSold =
            Number(b.stock_amount) -
            Number(b.pos_inventory_item_stock?.total_stock_unit);
          return bSold - aSold;
        });
      setTopSellingProducts(topSelling);

      // Calculate total stock value
      const totalValue = analyticsData.reduce((acc: any, item: any) => {
        const stockValue =
          Number(item.pos_inventory_item_stock?.total_stock_unit || 0) *
          Number(item.last_cost || 0);
        return acc + stockValue;
      }, 0);
      setTotalStockValue(totalValue);

      // Calculate stock value by category
      const categoryStock = analyticsData.reduce((acc: any, item: any) => {
        const category =
          item.pos_inventory_item_categories?.item_category || 'Uncategorized';
        const stockValue =
          Number(item.pos_inventory_item_stock?.total_stock_unit || 0) *
          Number(item.last_cost || 0);

        if (!acc[category]) {
          acc[category] = 0;
        }

        acc[category] += stockValue;
        return acc;
      }, {});
      setCategoryStockValues(categoryStock);

      // Stock on Hand List sorted by total stock
      const sortedStockOnHand = analyticsData
        .filter((item: any) => item.pos_inventory_item_stock)
        .sort((a: any, b: any) => {
          const aStock = Number(a.pos_inventory_item_stock?.total_stock_unit);
          const bStock = Number(b.pos_inventory_item_stock?.total_stock_unit);
          return bStock - aStock;
        });
      setStockOnHand(sortedStockOnHand);

      // Calculate monthly stock cost (dummy data, replace with real logic)
      const dummyMonthlyCost = [
        { month: 'Jan', value: 200 },
        { month: 'Feb', value: 250 },
        { month: 'Mar', value: 300 },
        { month: 'Apr', value: 350 },
        { month: 'May', value: 400 },
        { month: 'Jun', value: 450 },
        { month: 'Jul', value: 500 },
        { month: 'Aug', value: 550 },
        { month: 'Sep', value: 600 },
        { month: 'Oct', value: 650 },
        { month: 'Nov', value: 700 },
        { month: 'Dec', value: 750 }
      ];
      setMonthlyStockCost(dummyMonthlyCost);
    }
  }, [analyticsData]);

  return (
    <TabsContent
      value="overview"
      className="mt-8 space-y-8 bg-secondary md:p-6"
    >
      {hiddenCategories.length > 0 && (
        <div className="flex items-center justify-start space-x-4">
          {/* Trigger Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Show Hidden Categories
              </Button>
            </PopoverTrigger>

            {/* Popover Content with Dropdown */}
            <PopoverContent className="p-2">
              <div className="space-y-2">
                <select
                  onChange={(e) => showHiddenCategory(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                  <option value="">Select a Category</option>
                  {hiddenCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      <div className="flex flex-col justify-between gap-6 lg:flex-row">
        <div className="grid w-full grid-cols-2 gap-4 xl:grid-cols-3">
          {/* Total Stock on Hand */}
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="flex items-center gap-2">
                <IconBadge icon={Package} />
                <span className="text-xs font-medium text-muted-foreground">
                  Total Stock on Hand
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-8">
              <div className="flex items-center gap-1 text-2xl font-medium tracking-tight">
                <span className="text-sm">$</span>
                {totalStockValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {Object.entries(categoryStockValues)
            .filter(([category]) => !hiddenCategories.includes(category))
            .map(([category, value]: any) => (
              <Card key={category} className="relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <IconBadge icon={Package} />
                    <span className="text-xs font-medium text-muted-foreground">
                      Total {category} Stock
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-8">
                  <div className="flex items-center gap-1 text-2xl font-medium tracking-tight">
                    <span className="text-sm">$</span>
                    {value.toFixed(2)}
                  </div>
                  <button
                    onClick={() => toggleCategoryVisibility(category)}
                    className="absolute bottom-2 right-4 flex items-center justify-center gap-1 text-xs text-red-600"
                  >
                    <ChevronUp size={12} />
                    <span>Hide</span>
                  </button>
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="w-full lg:w-[50%]">
          <Card className="flex flex-col items-center shadow-lg">
            <CardHeader>
              <CardTitle className="text-md font-semibold text-foreground xl:text-xl">
                Cost of Goods Per Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarGraph
                data={monthlyStockCost}
                dataKeyX="month"
                dataKeyY="value"
                title="Cost of Goods Per Month"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low Stock Items */}
        <Card className="bg-background p-2 shadow-lg">
          <CardHeader>
            <CardTitle className="font-semibold">❗️ Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent className="h-[40vh] overflow-y-scroll p-2">
            <ul className="space-y-4">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between space-x-4 rounded-lg p-2  shadow-sm transition-colors hover:bg-muted"
                  >
                    <div className="flex w-full items-center space-x-4">
                      {item.photo ? (
                        <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_IMG_URL}${item.photo}`}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-tertiary">
                          <IconBadge icon={AlertCircle} />
                        </div>
                      )}
                      <div className="flex flex-grow flex-col justify-center">
                        <span className="text-sm font-semibold">
                          {item.product_name.slice(0, 15)}
                        </span>
                        <Progress
                          value={
                            (Number(
                              item.pos_inventory_item_stock?.total_stock_unit
                            ) /
                              Number(item.par_level_unit)) *
                            100
                          }
                          className="mt-1 w-full"
                          variant="default"
                        />
                      </div>
                    </div>
                    <div className="mt-7 flex w-[175px] items-center justify-center">
                      <span className="text-sm font-semibold text-foreground">
                        {(
                          (Number(
                            item.pos_inventory_item_stock?.total_stock_unit
                          ) /
                            Number(item.par_level_unit)) *
                          100
                        ).toFixed(1)}
                        % Par Level
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <p className="px-8 text-sm text-muted-foreground">
                  No low stock items! No need to worry about restocking right
                  now.
                </p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="rounded-lg bg-background p-2 shadow-lg">
          <CardHeader className="rounded-t-lg p-4">
            <CardTitle className="flex items-center space-x-2 font-semibold">
              <span>🔥</span>
              <span>Top Selling Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[40vh] overflow-y-scroll p-4">
            <ul className="space-y-4">
              {topSellingProducts.length > 0 ? (
                topSellingProducts.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-background p-2 shadow-sm transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center space-x-4">
                      {item.photo ? (
                        <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_IMG_URL}${item.photo}`}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-tertiary">
                          <IconBadge icon={Flame} />
                        </div>
                      )}
                      <span className="text-sm font-semibold">
                        {item.product_name.slice(0, 20)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="default"
                        className={`text-sm font-semibold ${
                          Number(item.stock_amount) -
                            Number(
                              item.pos_inventory_item_stock.total_stock_unit
                            ) >
                          50
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        } text-white`}
                      >
                        {Number(item.stock_amount) -
                          Number(
                            item.pos_inventory_item_stock.total_stock_unit
                          )}{' '}
                        Sold
                      </Badge>
                    </div>
                  </li>
                ))
              ) : (
                <p className="px-8 text-sm text-muted-foreground">
                  No top-selling products yet. Let&apos;s look forward to future
                  sales!
                </p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Stock on Hand List */}
        <Card className="rounded-lg bg-background p-2 shadow-lg">
          <CardHeader className="rounded-t-lg bg-background p-4">
            <CardTitle className="flex items-center space-x-2 font-semibold">
              <span>📦</span>
              <span>Stock on Hand List</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[40vh] overflow-y-scroll p-4">
            <ul className="space-y-4">
              {stockOnHand.length > 0 ? (
                stockOnHand.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-background p-2 shadow-sm transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center space-x-4">
                      {item.photo ? (
                        <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_IMG_URL}${item.photo}`}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-tertiary">
                          <IconBadge icon={Package} />
                        </div>
                      )}
                      <span className="text-sm font-semibold">
                        {item.product_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className="text-sm font-semibold"
                      >
                        {item.pos_inventory_item_stock?.total_stock_unit || 0}{' '}
                        {item.measurement_desc}
                      </Badge>
                    </div>
                  </li>
                ))
              ) : (
                <p className="px-8 text-sm text-muted-foreground">
                  Your inventory is empty. Add products to get started!
                </p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* High Stock Products */}
        <Card className="rounded-lg bg-background p-2 shadow-lg">
          <CardHeader className="rounded-t-lg bg-background p-4">
            <CardTitle className="flex items-center space-x-2 font-semibold">
              <span>📊</span>
              <span>High Stock Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[40vh] overflow-y-scroll p-4">
            <ul className="space-y-4">
              {highStockProducts.length > 0 ? (
                highStockProducts.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-background p-2 shadow-sm transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center space-x-4">
                      {item.photo ? (
                        <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_IMG_URL}${item.photo}`}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-tertiary">
                          <IconBadge icon={BarChart2} />
                        </div>
                      )}
                      <span className="text-sm font-semibold">
                        {item.product_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className="text-sm font-semibold"
                      >
                        {item.pos_inventory_item_stock?.total_stock_unit}{' '}
                        {item.measurement_desc}
                      </Badge>
                    </div>
                  </li>
                ))
              ) : (
                <p className="px-8 text-sm text-muted-foreground">
                  No high stock products. Your inventory is well balanced!
                </p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}

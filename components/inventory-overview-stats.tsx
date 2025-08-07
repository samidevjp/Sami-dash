import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IconBadge from '@/components/ui/iconBadge';
import { DollarSign, ShoppingCart } from 'lucide-react';
import { formatNumberWithCommas } from '@/lib/utils';

interface InventoryOverviewStatsProps {
  totalReceived: number;
  stockOnHand: number;
  categoryStockValues: Record<string, number>;
}

export const InventoryOverviewStats: React.FC<InventoryOverviewStatsProps> = ({
  totalReceived,
  stockOnHand,
  categoryStockValues
}) => {
  return (
    <>
      <div className="mb-6 gap-2">
        <Card className="mb-4 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconBadge icon={DollarSign} />
              <span>Received Today</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-1 text-3xl font-medium">
              <span className="text-base">$</span>
              {totalReceived.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-auto border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconBadge icon={ShoppingCart} />
              <span>Stock On hand</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-1 text-3xl font-medium">
              <span className="text-base">$</span>
              {stockOnHand.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {Object.entries(categoryStockValues).map(([category, value]) => (
          <div
            className="flex items-center justify-between border-b px-2 py-2"
            key={category}
          >
            <p className="text-xs">{category}</p>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-xs">$</span>
                <span className="text-sm">
                  {formatNumberWithCommas(value.toFixed(2))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { formatNumberWithCommas } from '@/lib/utils';

interface SalesOverviewStatsProps {
  salesData: {
    sales: {
      customers: number;
      sales_per_customer: number;
      cash: number;
      windcave: number;
      credit: number;
      amex: number;
      'uber eats': number;
      'tap to pay': number;
      'via eft': number;
      "goff's bar": number;
      voucher: number;
      paid_sales: number;
      ongoing_sales: number;
      on_account_sales: number;
      total_sales: number;
    };
    breakdown: {
      tax: number;
      discount: number;
      tip: number;
      surcharge: number;
      custom_amount: number;
      deleted_items: number;
      credit_surcharge: number;
    };
  };
  onBreakdownClick: () => void;
  onOngoingSalesClick: () => void;
}

export const SalesOverviewStats: React.FC<SalesOverviewStatsProps> = ({
  salesData,
  onBreakdownClick,
  onOngoingSalesClick
}) => {
  const { sales, breakdown } = salesData;

  return (
    <>
      <div className="max-h-[220px] overflow-y-auto">
        <div className="px-2">
          <div className="flex items-center justify-between gap-4 border-b py-3">
            <p className="text-xs font-semibold">Total Sales</p>
            <div className="flex items-center gap-1">
              <span className="text-xs">$</span>
              <span className="text-sm">
                {formatNumberWithCommas(sales.total_sales.toFixed(2))}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-3">
            <p className="text-xs font-semibold">Paid Sales</p>
            <div className="flex items-center gap-1">
              <span className="text-xs">$</span>
              <span className="text-sm">
                {formatNumberWithCommas(sales.paid_sales.toFixed(2))}
              </span>
            </div>
          </div>
          <div className="flex justify-between gap-4 border-b pb-1 pt-3">
            <p className="text-xs font-semibold">Ongoing Sales</p>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-sm">
                <span className="text-xs">$</span>
                <span>
                  {formatNumberWithCommas(sales.ongoing_sales.toFixed(2))}
                </span>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={onOngoingSalesClick}
                className="p-0 text-xs"
              >
                <div className="flex items-center gap-1">
                  <span>View Details</span>
                  <ChevronRight size={14} />
                </div>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-3">
            <p className="text-xs font-semibold">On Account Sales</p>
            <div className="flex items-center gap-1">
              <span className="text-xs">$</span>
              <span className="text-sm">
                {formatNumberWithCommas(sales.on_account_sales.toFixed(2))}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-3">
            <p className="text-xs font-semibold">Customers</p>
            <div className="flex items-center gap-1">
              <span className="text-xs"></span>
              <span className="text-sm">
                {formatNumberWithCommas(sales.customers)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-3">
            <p className="text-xs font-semibold">Avg. Sale per Customer</p>
            <div className="flex items-center gap-1">
              <span className="text-xs">$</span>
              <span className="text-sm">
                {formatNumberWithCommas(sales.sales_per_customer.toFixed(2))}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-3">
            <p className="text-xs font-semibold">Tax</p>
            <div className="flex items-center gap-1">
              <span className="text-xs">$</span>
              <span className="text-sm">
                {formatNumberWithCommas(breakdown.tax.toFixed(2))}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-3">
            <p className="text-xs font-semibold">Tip</p>
            <div className="flex items-center gap-1">
              <span className="text-xs">$</span>
              <span className="text-sm">
                {formatNumberWithCommas(breakdown.tip.toFixed(2))}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-3">
            <p className="text-xs font-semibold">Discount</p>
            <div className="flex items-center gap-1">
              <span className="text-xs">$</span>
              <span className="text-sm">
                {formatNumberWithCommas(breakdown.discount.toFixed(2))}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-3">
            <p className="text-xs font-semibold">Credit Surcharge</p>
            <div className="flex items-center gap-1">
              <span className="text-xs">$</span>
              <span className="text-sm">
                {formatNumberWithCommas(
                  breakdown.credit_surcharge.toFixed(2) || 0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <Button variant="outline" size="sm" onClick={onBreakdownClick}>
          <div className="flex items-center gap-2">
            <span>Break down</span>
            <ChevronRight size={16} />
          </div>
        </Button>
      </div>
    </>
  );
};

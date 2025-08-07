import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Category } from '@/types';
import { DialogTitle } from '@radix-ui/react-dialog';
import { set } from 'lodash';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { DateTime } from 'luxon';
import { Checkbox } from '../ui/checkbox';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AllDayItemsModalProps {
  showAllDayModal: boolean;
  setShowAllDayModal: (open: boolean) => void;
  currentOrders: any[];
  setSearchText: (text: string) => void;
  categories: Category[];
  allOrders: any[];
}
export function AllDayItemsModal({
  showAllDayModal,
  setShowAllDayModal,
  currentOrders,
  setSearchText,
  categories,
  allOrders
}: AllDayItemsModalProps) {
  const [tabValue, setTabValue] = useState<'all' | 'filtered'>('all');

  const getCategorizedTotals = (isFilter: boolean = false) => {
    const categorized: Record<string, { name: string; quantity: number }[]> =
      {};

    const ordersToUse = isFilter ? currentOrders : allOrders;
    ordersToUse.forEach((order) => {
      order.bump_order_products.forEach((product: any) => {
        const categoryId = product.pos_product_category_id?.toString();
        const categoryObj = categories.find(
          (cat) => cat.id.toString() === categoryId
        );
        const categoryName = categoryObj?.name || 'Uncategorized';

        if (!categorized[categoryName]) categorized[categoryName] = [];

        const existing = categorized[categoryName].find(
          (p) => p.name === product.title
        );
        if (existing) {
          existing.quantity += product.quantity;
        } else {
          categorized[categoryName].push({
            name: product.title,
            quantity: product.quantity
          });
        }
      });
    });
    Object.keys(categorized).forEach((category) => {
      categorized[category].sort((a, b) => b.quantity - a.quantity);
    });

    return categorized;
  };
  const [useFilteredOrders, setUseFilteredOrders] = useState(false);
  const categorizedTotals = getCategorizedTotals(tabValue === 'filtered');
  return (
    <Dialog open={showAllDayModal} onOpenChange={setShowAllDayModal}>
      <DialogContent className="">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-lg font-bold">All Day Items</DialogTitle>
          {/* <div className="pt-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={useFilteredOrders}
                onCheckedChange={(checked) => {
                  checked
                    ? setUseFilteredOrders(checked as boolean)
                    : setUseFilteredOrders(false);
                }}
              />
              Show only filtered results
            </label>
          </div> */}
        </div>
        <div className="flex justify-center">
          <Tabs
            value={tabValue}
            onValueChange={(val) => setTabValue(val as 'all' | 'filtered')}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="filtered">Filtered</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="max-h-[60vh] min-h-[60vh] overflow-y-auto">
          {Object.entries(categorizedTotals).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h3 className="text-md mb-1 border-b pb-1 font-semibold">
                {category}
              </h3>
              <ul className="space-y-1 pl-4 text-sm">
                {items.map(({ name, quantity }) => (
                  <li
                    key={name}
                    className="cursor-pointer hover:text-primary"
                    onClick={() => {
                      setSearchText(name);
                      toast({
                        description: `Filtered by "${name}"`,
                        duration: 2000
                      });
                      setShowAllDayModal(false);
                    }}
                  >
                    {quantity} × {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

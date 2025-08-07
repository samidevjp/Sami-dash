import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';

interface CategoryStockValues {
  [category: string]: number;
}

const useInventoryStockValues = () => {
  const { fetchAnalyticsInventoryProducts } = useApi();
  const [categoryStockValues, setCategoryStockValues] =
    useState<CategoryStockValues>({});
  const [totalStockValue, setTotalStockValue] = useState<number>(0);

  const fetchInventoryData = useCallback(async () => {
    try {
      const analyticsData = await fetchAnalyticsInventoryProducts();
      if (!analyticsData) return;

      const totalValue = analyticsData.reduce((acc: number, item: any) => {
        const stockValue =
          Number(item.pos_inventory_item_stock?.total_stock_unit || 0) *
          Number(item.last_cost || 0);
        return acc + stockValue;
      }, 0);
      setTotalStockValue(totalValue);

      const categoryStock = analyticsData.reduce(
        (acc: CategoryStockValues, item: any) => {
          const category =
            item.pos_inventory_item_categories?.item_category ||
            'Uncategorized';
          const stockValue =
            Number(item.pos_inventory_item_stock?.total_stock_unit || 0) *
            Number(item.last_cost || 0);

          acc[category] = (acc[category] || 0) + stockValue;
          return acc;
        },
        {} as CategoryStockValues
      );

      setCategoryStockValues(categoryStock);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  }, [fetchAnalyticsInventoryProducts]);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  return { categoryStockValues, totalStockValue, fetchInventoryData };
};

export default useInventoryStockValues;

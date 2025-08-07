import {
  TableForFixedHeader,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useProducts } from '@/hooks/useProducts';
import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { formatNumberWithCommas } from '@/lib/utils';

interface ItemSold {
  prod_id: number;
  name: string;
  photo?: string;
  price: number;
  qty: number;
  total_sales: number;
}

interface ItemSoldData {
  items: ItemSold[];
}

type SortField = 'qty' | 'total_sales' | 'name' | 'price';
type SortDirection = 'asc' | 'desc';

export function ItemSalesGrid({ data }: { data: ItemSoldData }) {
  const { products: categories } = useProducts();
  const [sortField, setSortField] = useState<SortField>('qty');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );

  const products = categories?.map((category) => category.products).flat();
  const itemsWithPhotos = data.items.map((item) => {
    const matchingProduct = products?.find((p) => p.id === item.prod_id);
    return {
      ...item,
      photo: matchingProduct?.photo
    };
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleImageError = (imagePath: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [imagePath]: true
    }));
  };

  const sortedItems = [...itemsWithPhotos].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'name') {
      return modifier * a.name.localeCompare(b.name);
    }
    return modifier * (a[sortField] - b[sortField]);
  });

  return (
    <div className="max-h-[500px] w-full overflow-auto">
      <TableForFixedHeader className="md:table-fixed">
        <TableHeader className="sticky top-0 z-10 bg-secondary">
          <TableRow>
            <TableHead className="pl-4 md:w-[200px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="pl-0 hover:bg-transparent"
              >
                Item
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="pl-4">
              <Button
                variant="ghost"
                onClick={() => handleSort('price')}
                className="pl-0 hover:bg-transparent"
              >
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-36 pl-4 text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('qty')}
                className="pl-0 hover:bg-transparent"
              >
                Items sold
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="pl-4">
              <Button
                variant="ghost"
                onClick={() => handleSort('total_sales')}
                className="pl-0 hover:bg-transparent"
              >
                Sales
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item, index) => (
            <TableRow key={index} className="h-12">
              <TableCell className="pl-4">
                <div className="flex items-center gap-2">
                  <Image
                    width={32}
                    height={32}
                    src={
                      imageErrors[item.photo || '']
                        ? '/placeholder-img.png'
                        : item.photo?.startsWith('/')
                        ? item.photo
                        : '/' + item.photo
                    }
                    alt={item.name}
                    className="h-8 w-8 rounded-full"
                    onError={() => handleImageError(item.photo || '')}
                  />
                  {item.name}
                </div>
              </TableCell>
              <TableCell className="pl-4">
                ${formatNumberWithCommas(item.price.toFixed(2))}
              </TableCell>
              <TableCell className="pl-4 text-center">{item.qty}</TableCell>
              <TableCell className="pl-4">
                ${formatNumberWithCommas(item.total_sales.toFixed(2))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableForFixedHeader>
    </div>
  );
}

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface UnderPerformingItem {
  name: string;
  qty: number;
}

export function UnderPerformingItems({
  items
}: {
  items: UnderPerformingItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.qty}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

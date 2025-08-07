import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface SalesData {
  customers: number;
  sales_per_customer: number;
  cash: number;
  windcave: number;
  eftpos: number;
  credit: number;
  amex: number;
  kilburn: number;
  'corp living': number;
  'uber eats': number;
  mastercard: number;
  discover: number;
  stripe: number;
  total_sales: number;
}

export function SalesTable({ data }: { data: SalesData }) {
  const salesItems = Object.entries(data).filter(
    ([key]) =>
      key !== 'total_sales' &&
      key !== 'customers' &&
      key !== 'sales_per_customer'
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Payment Method</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {salesItems.map(([key, value]) => (
          <TableRow key={key}>
            <TableCell>{key.charAt(0).toUpperCase() + key.slice(1)}</TableCell>
            <TableCell>${value.toFixed(2)}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell className="font-bold">Total Sales</TableCell>
          <TableCell className="font-bold">
            ${data.total_sales.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

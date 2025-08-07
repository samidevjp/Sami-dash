import { Download, Ellipsis, ExternalLink } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Button } from '../ui/button';

interface InvoiceTableProps {
  invoices: any[];
  hasMore: boolean;
  handleLoadMore: () => void;
  openDialog: (invoice: any) => void;
}

export const InvoiceTable = ({
  invoices,
  hasMore,
  handleLoadMore,
  openDialog
}: InvoiceTableProps) => {
  const getStatusBadge = (status: string) => {
    const statusStyles: Record<
      string,
      { bgColor: string; textColor: string; label: string }
    > = {
      paid: {
        bgColor: 'bg-green-200',
        textColor: 'text-green-800',
        label: 'Paid'
      },
      open: {
        bgColor: 'bg-blue-200',
        textColor: 'text-blue-800',
        label: 'Open'
      },
      void: {
        bgColor: 'bg-gray-200',
        textColor: 'text-gray-800',
        label: 'Deactivated'
      },
      draft: {
        bgColor: 'bg-gray-200',
        textColor: 'text-gray-800',
        label: 'Draft'
      }
    };

    const { bgColor, textColor, label } = statusStyles[status] || {
      bgColor: 'bg-gray-200',
      textColor: 'text-gray-800',
      label: status
    };

    return (
      <span className={`rounded-full px-2 py-1 ${bgColor} ${textColor}`}>
        {label}
      </span>
    );
  };
  return (
    <>
      <Table
        wrapperClass="max-md:w-[calc(100vw-32px)] max-lg:w-[calc(100vw-108px)]"
        className=" border-separate border-spacing-0 rounded-lg border bg-secondary "
      >
        <TableHeader>
          <TableRow>
            <TableHead className="border-b p-4 text-left">Amount</TableHead>
            <TableHead className="border-b p-4 text-left">Frequency</TableHead>
            <TableHead className="border-b p-4 text-left">
              Invoice number
            </TableHead>
            <TableHead className="border-b p-4 text-left">
              Customer email
            </TableHead>
            <TableHead className="border-b p-4 text-left">Due</TableHead>
            <TableHead className="border-b p-4 text-left">Paid</TableHead>
            <TableHead className="border-b p-4 text-left">Created</TableHead>
            <TableHead className="sticky right-0 rounded-tr-lg border-b bg-secondary p-4 text-left">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice, index) => (
            <TableRow
              key={invoice.id}
              className={`group cursor-pointer border-b hover:bg-hoverTable ${
                index === invoices.length - 1 ? 'rounded-bl-lg' : ''
              }`}
              onClick={() => openDialog(invoice)}
            >
              <TableCell
                className={`p-4 ${
                  index === invoices.length - 1 ? '' : 'border-b'
                }`}
              >
                ${(invoice.amount_due / 100).toFixed(2)}{' '}
                {invoice.currency.toUpperCase()}
              </TableCell>
              <TableCell
                className={`p-4 ${
                  index === invoices.length - 1 ? '' : 'border-b'
                }`}
              >
                {invoice.billing_reason === 'subscription' ? (
                  <span className="flex items-center space-x-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3"
                      />
                    </svg>
                    <span>Monthly</span>
                  </span>
                ) : (
                  <span>One-time</span>
                )}
              </TableCell>
              <TableCell
                className={` p-4 ${
                  index === invoices.length - 1 ? '' : 'border-b'
                }`}
              >
                {invoice.number || 'N/A'}
              </TableCell>
              <TableCell
                className={`p-4 ${
                  index === invoices.length - 1 ? '' : 'border-b'
                }`}
              >
                {invoice.customer_email || 'N/A'}
              </TableCell>
              <TableCell
                className={`p-4 ${
                  index === invoices.length - 1 ? '' : 'border-b'
                }`}
              >
                {new Date(invoice.due_date * 1000).toLocaleDateString()}
              </TableCell>
              <TableCell
                className={`p-4 ${
                  index === invoices.length - 1 ? '' : 'border-b'
                }`}
              >
                {getStatusBadge(invoice.status)}
              </TableCell>
              <TableCell
                className={`p-4 ${
                  index === invoices.length - 1 ? '' : 'border-b'
                }`}
              >
                {new Date(invoice.created * 1000).toLocaleString()}
              </TableCell>
              <TableCell
                className={`sticky right-0 bg-secondary p-4 transition-colors group-hover:bg-hoverTable ${
                  index === invoices.length - 1 ? 'rounded-br-lg' : 'border-b'
                }`}
              >
                <Select
                  onValueChange={(value) => {
                    if (value === 'invoice_PDF') {
                      window.location.href = invoice.invoice_pdf;
                    } else {
                      window.open(
                        invoice.hosted_invoice_url,
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }
                  }}
                  value={''}
                  defaultValue={undefined}
                >
                  <SelectTrigger className="m-auto flex h-7 w-7 items-center justify-center">
                    <SelectValue>
                      <Ellipsis width={18} height={18} />
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="invoice_PDF">
                      <div className="flex items-center">
                        <Download className="mr-2 inline" width={16} />
                        Download PDF
                      </div>
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="invoice_Link">
                      <div className="flex items-center">
                        <ExternalLink className="mr-2 inline" width={16} />
                        Payment Page
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button onClick={handleLoadMore}>Load More</Button>
        </div>
      )}
    </>
  );
};

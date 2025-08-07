import { CircleAlert } from 'lucide-react';
import { Icons } from '../icons';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';

interface PaymentLink {
  id: string;
  url: string;
  active: boolean;
  currency: string;
  metadata: any;
  // Add other relevant fields from the Stripe PaymentLink object if needed
}
interface PaymentLinkTableProps {
  existingLinks: PaymentLink[];
  toast: any;
  hasMorePaymentLinks: boolean;
  isPaymentLinkLoading: boolean;
  fetchPaymentLink: (reset?: boolean) => void;
}

export const PaymentLinksTable = ({
  existingLinks,
  toast,
  hasMorePaymentLinks,
  isPaymentLinkLoading,
  fetchPaymentLink
}: PaymentLinkTableProps) => {
  return (
    <>
      {existingLinks.length > 0 && (
        <Table
          wrapperClass="max-md:w-[calc(100vw-32px)] max-lg:w-[calc(100vw-108px)]"
          className=" border-separate border-spacing-0 rounded-lg border bg-secondary "
        >
          <TableHeader>
            <TableRow>
              <TableHead className="border-b p-4 text-left">URL</TableHead>
              <TableHead className="border-b p-4 text-center">Status</TableHead>
              <TableHead className="border-b p-4 text-center">
                Currency
              </TableHead>
              <TableHead className="sticky right-0 rounded-tr-lg border-b bg-secondary p-4 text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {existingLinks.map((link, index) => (
              <TableRow
                key={link.id + Math.random()}
                className={`group border-b hover:bg-hoverTable ${
                  index === existingLinks.length - 1 ? 'rounded-bl-lg' : ''
                }`}
              >
                <TableCell
                  className={`p-4 ${
                    index === existingLinks.length - 1 ? '' : 'border-b'
                  }`}
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block max-w-xs truncate text-blue-600 hover:underline sm:max-w-sm md:max-w-md"
                  >
                    {link.url}
                  </a>
                </TableCell>
                <TableCell
                  className={`p-4 text-center ${
                    index === existingLinks.length - 1 ? '' : 'border-b'
                  }`}
                >
                  <Badge variant={link.active ? 'success' : 'secondary'}>
                    {link.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`p-4 text-center ${
                    index === existingLinks.length - 1 ? '' : 'border-b'
                  }`}
                >
                  {link.currency.toUpperCase()}
                </TableCell>
                <TableCell
                  className={`sticky right-0 w-32 bg-secondary p-4 text-center transition-colors group-hover:bg-hoverTable ${
                    index === existingLinks.length - 1 ? '' : 'border-b'
                  }`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(link.url)
                        .then(() => toast({ title: 'Copied!' }))
                    }
                  >
                    Copy Link
                  </Button>
                  {/* Add more actions like deactivate/view line items if needed */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {existingLinks.length === 0 && !isPaymentLinkLoading && (
        <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center py-8">
          <CircleAlert className="h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No payment links found.
          </p>
        </div>
      )}
      {isPaymentLinkLoading && (
        <div className="flex justify-center py-4">
          <Icons.spinner className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2">Loading links...</p>
        </div>
      )}
      {hasMorePaymentLinks && !isPaymentLinkLoading && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => fetchPaymentLink()}
            disabled={isPaymentLinkLoading}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  );
};

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { getRelativeLuminance } from '@/utils/common';
import { ArrowDown } from 'lucide-react';
interface InvoiceEmailPreviewProps {
  logoUrl: string | null;
  session: any;
  businessSettings: any;
  showInvoiceForm: boolean;
  selectedCustomer: string | null;
  customers: { id: string; email: string }[];
  calculateTotal: () => number;
  selectedInvoice: any;
  handleRemoveItem: (index: number) => void;
  selectedItems: any;
}

const InvoiceEmailPreview: React.FC<InvoiceEmailPreviewProps> = ({
  logoUrl,
  session,
  businessSettings,
  showInvoiceForm,
  selectedInvoice,
  selectedCustomer,
  customers,
  calculateTotal,
  selectedItems,
  handleRemoveItem
}) => {
  return (
    <div
      className={`invoice-preview flex justify-center rounded p-8 text-black shadow-md`}
      style={{
        backgroundColor: businessSettings?.settings.branding.primary_color
      }}
    >
      <div className="w-[440px]">
        <div className="mb-4 flex items-center">
          {logoUrl && (
            <Avatar className="mr-3">
              <AvatarImage
                // @ts-ignore
                src={logoUrl}
                alt="Business Logo"
              />
            </Avatar>
          )}
          <h2
            className="text-sm font-medium text-black"
            style={{
              color: getRelativeLuminance(
                businessSettings?.settings.branding.primary_color
              )
            }}
          >
            {session?.user.name}
          </h2>
        </div>
        <div className="mb-4 rounded-lg bg-gray-100 p-6">
          <p className="mb-2 text-xs text-gray-600">
            {showInvoiceForm ? 'Invoice from' : 'Subscription from'}{' '}
            {session?.user.name}
          </p>
          <div className="flex justify-between">
            <div className="mb-2 w-2/3 border-b border-gray-200">
              <h3 className="mb-2 text-2xl font-medium text-black">
                A${calculateTotal().toFixed(2)}
              </h3>
              <p className="text-xs text-gray-500">
                Due {new Date().toDateString()}
              </p>
            </div>
            <Image
              src="/invoices_invoice_illustration.png"
              alt="Business Logo"
              width={80}
              height={40}
            />
          </div>
          <p className="mb-5 flex hidden gap-1 text-xs text-gray-500">
            <ArrowDown width={16} height={16} />
            Download invoice
          </p>
          <p className="mb-1 text-xs text-gray-700">
            <span>To:</span>{' '}
            {selectedCustomer
              ? customers.find((c) => c.id === selectedCustomer)?.email
              : 'Example Customer'}
          </p>
          <p className="text-xs text-gray-700">
            <span>From:</span> {session?.user.name}
          </p>

          <Button
            className="mt-5 w-full"
            style={{
              backgroundColor:
                businessSettings.settings.branding.secondary_color,
              color: getRelativeLuminance(
                businessSettings?.settings.branding.secondary_color
              )
            }}
            onClick={() => {}}
          >
            Pay this invoice
          </Button>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 text-xs">
          <p className=" mb-4 font-medium text-gray-700">
            {showInvoiceForm ? 'Invoice' : 'Subscription'}{' '}
            {selectedInvoice?.number ? selectedInvoice.number : '#EXAMPLE-0001'}
          </p>
          {selectedItems.length !== 0 && (
            <div className="flex flex-col gap-2 border-t border-gray-200 py-2">
              {selectedItems.map((item: any, index: number) => (
                <div key={index} className="flex justify-between ">
                  <p>
                    {item.description ? item.description : item.name}
                    <br />
                    <span className="text-[10px] text-gray-400">
                      Qty {item.quantity}
                    </span>
                  </p>
                  <p className="text-right">
                    $
                    {((item.price?.unit_amount * item.quantity) / 100).toFixed(
                      2
                    )}
                    {item?.quantity > 1 && (
                      <span className="block text-[10px] text-gray-400">
                        A{(item.price?.unit_amount / 100).toFixed(2)} each
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between border-t border-gray-200 py-2">
            <p className="">Total due</p>
            <p className="">A${calculateTotal().toFixed(2)}</p>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <p className="">Amount paid</p>
            <p className="">A$0.00</p>
          </div>
          <div className="mt-2 flex justify-between border-b border-gray-200 pb-2">
            <p className="">Amount remaining</p>
            <p className="">A${calculateTotal().toFixed(2)}</p>
          </div>
          <div className="mt-4 text-center text-xs text-gray-900">
            <p>
              Questions? Contact us at{' '}
              <a
                href={`mailto:${session?.user.email}`}
                className="font-semibold text-primary"
              >
                {session?.user.email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEmailPreview;

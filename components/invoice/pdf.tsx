import React from 'react';
import Image from 'next/image';

interface InvoicePDFPreviewProps {
  logoUrl?: string | null;
  selectedCustomer?: string | null;
  customers: { id: string; email: string }[];
  selectedItems: any;
  description: string;
  footer: string;
  selectedInvoice: any;
  customFields: any[];
  calculateTotal: () => number;
  checkedStates: any;
}

const InvoicePDFPreview: React.FC<InvoicePDFPreviewProps> = ({
  logoUrl,
  selectedCustomer,
  customers,
  selectedItems,
  description,
  footer,
  selectedInvoice,
  customFields,
  calculateTotal,
  checkedStates
}) => {
  const total = calculateTotal();
  const customerEmail = selectedCustomer
    ? customers.find((c) => c.id === selectedCustomer)?.email
    : 'Example Customer';

  const todayDate = new Date().toDateString();
  const invoiceNumber = selectedInvoice?.number || '#EXAMPLE-0001';
  return (
    <div className="invoice-pdf-preview relative h-full rounded bg-white p-8 font-invoice text-black shadow-md">
      <div className="min-h-96">
        <h2 className="mb-4 text-xl font-medium text-black">Invoice</h2>
        {logoUrl && (
          <Image
            src={logoUrl}
            alt="Business Logo"
            className="absolute right-4 top-4"
            width={40}
            height={40}
          />
        )}

        <div className="mb-8 flex justify-between">
          <table>
            <tbody className="text-xs">
              <tr className="font-medium">
                <td className="pr-2">Invoice number</td>
                <td>{invoiceNumber}</td>
              </tr>

              <tr>
                <td>Date of issue</td>
                <td>{todayDate}</td>
              </tr>
              <tr>
                <td>Date due</td>
                <td>{todayDate}</td>
              </tr>
              {checkedStates.customField &&
                customFields.length > 0 &&
                customFields?.map((field, idx) =>
                  field.name && field.value ? (
                    <tr key={idx}>
                      <td>{field.name}</td>
                      <td>{field.value}</td>
                    </tr>
                  ) : null
                )}
            </tbody>
          </table>
        </div>

        <div className="mb-8 flex gap-20">
          <div>
            <p className="text-xs font-medium">Wabi</p>
            <p className="text-xs">wabi@wabify.com</p>
          </div>
          <div className="text-xs">
            <div className="font-medium">Bill to</div>
            <div className="break-all">{customerEmail}</div>
          </div>
        </div>

        <h3 className="mb-2 text-sm font-medium text-black">
          A${total.toFixed(2)} due {todayDate}
        </h3>

        {checkedStates.memo && description && (
          <p className="whitespace-pre-wrap text-[10px]">{description}</p>
        )}

        <table className="my-4 w-full">
          <thead>
            <tr className="border-b border-black pb-1 text-right text-[10px]">
              <th className="w-1/2 pb-1 text-left font-normal">Description</th>
              <th className="w-1/6 font-normal">Qty</th>
              <th className="w-1/6 font-normal">Unit price</th>
              <th className="w-1/6 font-normal">Amount</th>
            </tr>
          </thead>
          <tbody className="mt-1">
            {selectedItems.map((item: any) => (
              <tr key={item.id} className="text-right text-[11px]">
                <td className="pt-1 text-left font-normal">
                  {item.description ? item.description : item.name}
                </td>
                <td className="font-normal">{item.quantity}</td>
                <td className="font-normal">
                  A${(item.price?.unit_amount / 100).toFixed(2)}
                </td>
                <td className="font-normal">
                  A$
                  {((item.price?.unit_amount * item?.quantity) / 100).toFixed(
                    2
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="flex justify-end text-xs">
          <div className="boder-gray-200 flex w-1/2 justify-between border-t py-1">
            <dt className="text-left">Subtotal</dt>
            <dd className="text-right">A${total.toFixed(2)}</dd>
          </div>
        </dl>

        <dl className="flex justify-end text-xs">
          <div className="boder-gray-200 flex w-1/2 justify-between border-t py-1">
            <dt className="text-left">Total</dt>
            <dd className="text-right">A${total.toFixed(2)}</dd>
          </div>
        </dl>

        <dl className="flex justify-end text-xs">
          <div className="boder-gray-200 flex w-1/2 justify-between border-t py-1 font-medium">
            <dt className="text-left">Amount due</dt>
            <dd className="text-right">A${total.toFixed(2)}</dd>
          </div>
        </dl>
      </div>
      {checkedStates.footer && footer && (
        <p className="my-8 whitespace-pre-wrap text-xs text-gray-900">
          {footer}
        </p>
      )}
      <div className="mt-auto border-t border-gray-200 pt-8 text-xs text-gray-900">
        <p className="text-[10px]">
          {invoiceNumber} - due {todayDate}
        </p>
      </div>
    </div>
  );
};

export default InvoicePDFPreview;

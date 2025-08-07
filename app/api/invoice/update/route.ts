import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const {
        customer,
        invoiceId,
        items,
        accountId,
        description,
        footer,
        customFields
      } = await req.json();

      // Retrieve the existing invoice
      const invoice = await stripe.invoices.retrieve(invoiceId, {
        stripeAccount: accountId
      });

      // Check if the invoice is open (or has other statuses where voiding is applicable)
      if (invoice.status === 'open') {
        // Void the current invoice
        await stripe.invoices.voidInvoice(invoiceId, {
          stripeAccount: accountId
        });

        // Create a new draft invoice
        const newInvoice = await stripe.invoices.create(
          {
            customer: customer,
            collection_method: 'send_invoice',
            days_until_due: 30,
            description: description,
            footer: footer,
            custom_fields: customFields
          },
          { stripeAccount: accountId }
        );

        // Add the new items to the new invoice
        const createInvoiceItems = items.map(async (item: any) => {
          const itemExists = await stripe.prices.retrieve(
            item.priceId,
            {},
            { stripeAccount: accountId }
          );

          if (itemExists) {
            return await stripe.invoiceItems.create(
              {
                customer: customer,
                invoice: newInvoice.id,
                price: item.priceId,
                quantity: item.quantity
              },
              { stripeAccount: accountId }
            );
          } else {
            throw new Error('Price does not exist');
          }
        });

        // Wait for all the items to be created
        await Promise.all(createInvoiceItems);

        // Optionally, send the new invoice if required
        const invoiceSent = await stripe.invoices.sendInvoice(newInvoice.id, {
          stripeAccount: accountId
        });

        return NextResponse.json({
          invoice: invoiceSent
        });
      } else {
        throw new Error('Invoice is not in an open status.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  }
}

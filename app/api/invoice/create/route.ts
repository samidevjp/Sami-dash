import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { customer, items, accountId, description, footer, customFields } =
        await req.json();

      const totalItems = items.reduce(
        (acc: any, item: any) => acc + item.quantity,
        0
      );

      console.log('totalItems', totalItems);

      const applicationFeeAmount = totalItems * 0.02;

      console.log('applicationFeeAmount', applicationFeeAmount);

      // Create an Invoice
      const invoice = await stripe.invoices.create(
        {
          customer,
          collection_method: 'send_invoice',
          days_until_due: 30,
          description: description,
          footer: footer,
          custom_fields: customFields,
          // issuer: {type: 'account', account: accountId },
          // on_behalf_of: accountId,
          application_fee_amount: applicationFeeAmount * 100
        },
        { stripeAccount: accountId }
      );
      // console.log('Invoice created:', invoice);

      // Create all invoice items
      const createInvoiceItems = items.map(async (item: any) => {
        // Retrieve the price to ensure it exists
        const itemExists = await stripe.prices.retrieve(
          item.priceId,
          {},
          { stripeAccount: accountId }
        );
        // console.log('Item exists:', itemExists);

        if (itemExists) {
          // Create an invoice item
          return await stripe.invoiceItems.create(
            {
              customer: customer,
              price: item.priceId,
              quantity: item.quantity,
              invoice: invoice.id
            },
            { stripeAccount: accountId }
          );
        } else {
          throw new Error('Price does not exist');
        }
      });

      // Wait for all invoice items to be created
      await Promise.all(createInvoiceItems);

      // console.log('All invoice items created successfully.');

      // Send the Invoice
      const invoiceSent = await stripe.invoices.sendInvoice(invoice.id, {
        stripeAccount: accountId
      });
      // console.log('Invoice sent:', invoiceSent);

      return NextResponse.json({
        invoice: invoiceSent
      });
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an invoice:',
        error
      );
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  }
}

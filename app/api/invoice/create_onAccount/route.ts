import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';
import { metadata } from '@/app/layout';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { customer, items, accountId, description } = await req.json();

      const totalItems = items.reduce(
        (acc: any, item: any) => acc + item.quantity * item.price,
        0
      );
      const applicationFeeAmount = totalItems * 0.02 * 100;
      console.log(applicationFeeAmount, 'applicationFeeAmount');

      console.log(
        Number(applicationFeeAmount.toFixed(2)),
        'Number(applicationFeeAmount.toFixed(2))'
      );

      const invoice = await stripe.invoices.create(
        {
          customer: customer,
          collection_method: 'send_invoice',
          days_until_due: 30,
          description: description,
          application_fee_amount: Number(
            Math.round(Number(applicationFeeAmount)).toFixed(2)
          )
        },
        { stripeAccount: accountId }
      );

      const createInvoiceItems = items.map(async (item: any) => {
        return await stripe.invoiceItems.create(
          {
            customer: customer,
            unit_amount: item.price * 100,
            quantity: item.quantity,
            description: item.title,
            invoice: invoice.id
          },
          { stripeAccount: accountId }
        );
      });

      await Promise.all(createInvoiceItems);

      // Send the Invoice
      const invoiceSent = await stripe.invoices.sendInvoice(invoice.id, {
        stripeAccount: accountId
      });

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

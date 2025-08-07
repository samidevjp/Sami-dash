import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const CUSTOMERS = [];
      const { email, value, accountId } = await req.json();
      let customer;
      let customerId;
      if (!customer) {
        // Create a new Customer
        customer = await stripe.customers.create(
          {
            email,
            description: 'Invoice'
          },
          { stripeAccount: accountId }
        );
        // Store the Customer ID in your database to use for future purchases
        CUSTOMERS.push({ stripeId: customer.id, email: email });
        customerId = customer.id;
      }
      //   else {
      //     // Read the Customer ID from your database
      //     customerId = customer.stripeId;
      //   }

      // Create an Invoice
      const invoice = await stripe.invoices.createPreview(
        {
          customer: customerId
        },
        { stripeAccount: accountId }
      );

      // Create an Invoice Item with the Price, and Customer you want to charge
      //   const invoiceItem = await stripe.invoiceItems.create({
      //     customer: customerId || "",
      //     price: value,
      //     invoice: invoice.id
      //   }, {stripeAccount: accountId});

      //   // Send the Invoice
      //   const invoiceSent = await stripe.invoices.sendInvoice(invoice.id, {stripeAccount: accountId});
      return NextResponse.json({
        invoice
      });
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create a payment link:',
        error
      );
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  }
}

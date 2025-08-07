import { NextResponse } from 'next/server';
// import { stripe } from '../../../../lib/utils';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { accountId, invoiceId } = await req.json();

      const invoices = await stripe.invoiceItems.retrieve(invoiceId, {
        stripeAccount: accountId
      });

      return NextResponse.json({
        invoices
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

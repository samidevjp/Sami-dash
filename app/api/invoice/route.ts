import { NextResponse } from 'next/server';
// import { stripe } from '../../../../lib/utils';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { accountId, starting_after, status = null } = await req.json();

      // Create an Invoice
      if (starting_after) {
        const invoices = await stripe.invoices.list(
          status ? { starting_after, status } : { starting_after },
          { stripeAccount: accountId }
        );
        return NextResponse.json({
          invoices
        });
      }
      const invoices = await stripe.invoices.list(status ? { status } : {}, {
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

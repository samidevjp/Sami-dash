import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { paymentIntentId, accountId } = await req.json();

      const paymentIntent = await stripe.paymentIntents.update(
        paymentIntentId,
        {
          metadata: { cash_received: 'true' }
        },
        { stripeAccount: accountId }
      );

      const paymentIntent2 = await stripe.paymentIntents.cancel(
        paymentIntentId,
        {
          // amount_to_capture: 100,
          // receipt_email: 'test@example.com',
        },
        { stripeAccount: accountId }
      );

      return NextResponse.json({
        paymentIntent: paymentIntent2
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

import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { reader, paymentIntent, accountId } = await req.json();
      console.log('value', reader, paymentIntent);

      const processPayment = await stripe.terminal.readers.processPaymentIntent(
        reader.id,
        {
          payment_intent: paymentIntent.id,
          process_config: {
            enable_customer_cancellation: true
          }
        },
        {
          stripeAccount: accountId
        }
      );
      return NextResponse.json({
        processPayment: processPayment
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

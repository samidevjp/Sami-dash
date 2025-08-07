import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { reader, accountId } = await req.json();
      //   console.log('value', reader, paymentIntent);
      const cancelPayment = await stripe.terminal.readers.cancelAction(
        reader.id,
        { stripeAccount: accountId }
      );
      return NextResponse.json({
        cancelPayment
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

import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { value, accountId } = await req.json();

      const paymentIntent = await stripe.paymentIntents.create(
        {
          currency: 'aud',
          payment_method_types: ['card_present'],
          capture_method: 'manual',
          amount: value * 100
        },
        { stripeAccount: accountId }
      );
      return NextResponse.json({
        paymentIntent: paymentIntent
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

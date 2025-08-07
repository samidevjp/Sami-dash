import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { priceId, accountId, feature } = await req.json();

      const session = await stripe.checkout.sessions.create(
        {
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: priceId,
              quantity: 1
            }
          ],
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}&feature=${feature}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription`
        },
        { stripeAccount: accountId }
      );

      return NextResponse.json({ url: session.url });
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create a subscription:',
        error
      );
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  }
}

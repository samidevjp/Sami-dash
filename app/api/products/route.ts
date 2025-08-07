import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { accountId } = await req.json();
      // console.log('items', items);

      const product = await stripe.products.list(
        { limit: 200 },
        {
          stripeAccount: accountId
        }
      );

      const prices = await stripe.prices.list(
        { limit: 200 },
        {
          stripeAccount: accountId
        }
      );

      return NextResponse.json({
        products: product,
        prices: prices
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

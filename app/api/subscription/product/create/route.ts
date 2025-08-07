import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { currency, unit_amount, interval, productName, accountId } =
        await req.json();

      // First, check if a price with this name already exists
      const existingPrices = await stripe.prices.list(
        {
          lookup_keys: [productName],
          expand: ['data.product']
        },
        { stripeAccount: accountId }
      );

      if (existingPrices.data.length > 0) {
        // If a price already exists, return it
        return NextResponse.json({ price: existingPrices.data[0] });
      }

      // If no price exists, create a new one
      const price = await stripe.prices.create(
        {
          currency,
          unit_amount,
          recurring: { interval },
          product_data: { name: productName },
          lookup_key: productName
        },
        { stripeAccount: accountId }
      );

      return NextResponse.json({ price });
    } catch (error) {
      console.error(
        'An error occurred while creating the subscription plan:',
        error
      );
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  }
}

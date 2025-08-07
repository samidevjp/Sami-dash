import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils'; // Assuming your Stripe instance is here

export async function POST(req: Request) {
  try {
    const { account, limit, starting_after } = await req.json();

    if (!account) {
      return NextResponse.json(
        { error: 'Stripe account ID is required' },
        { status: 400 }
      );
    }

    const params: any = {
      limit: limit || 10
    };

    if (starting_after) {
      params.starting_after = starting_after;
    }

    const paymentLinks = await stripe.paymentLinks.list(params, {
      stripeAccount: account
    });

    return NextResponse.json(paymentLinks);
  } catch (error: any) {
    console.error('Error fetching payment links:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment links' },
      { status: 500 }
    );
  }
}

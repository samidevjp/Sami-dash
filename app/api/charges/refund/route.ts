import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { accountId, chargeId } = await req.json();

    const refund = await stripe.refunds.create(
      {
        payment_intent: chargeId
      },
      {
        stripeAccount: accountId
      }
    );

    return NextResponse.json({ refund });
  } catch (error) {
    console.error('Error refunding charge:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

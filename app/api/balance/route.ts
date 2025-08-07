import { NextApiRequest } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// import { stripe } from '../../../../lib/utils';
import { stripe } from '@/lib/utils';
// import useStripe from '@/hooks/useStripe';

export async function POST(req: Request) {
  const { accountId } = await req.json();

  // console.log(req.);
  // const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || '', {
  //   apiVersion: '2024-06-20',
  //   // stripeAccount: session?.user?.stripeAccount
  // });
  // const { stripe } = useStripe();
  try {
    if (!accountId) {
      return NextResponse.json(
        { error: 'No account ID provided' },
        { status: 400 }
      );
    }
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId
    });
    return NextResponse.json({
      balance
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

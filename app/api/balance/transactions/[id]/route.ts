import { NextResponse } from 'next/server';
// import { stripe } from '../../../../lib/utils';
import { stripe } from '@/lib/utils';
import { NextApiRequest } from 'next';

export async function POST(req: Request) {
  const { transactionId, accountId } = await req.json();
  try {
    console.log(transactionId);
    const transaction = await stripe.charges.retrieve(
      (transactionId as string) || '',
      { stripeAccount: accountId }
    );
    return NextResponse.json({
      transaction
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

import { NextResponse } from 'next/server';
// import { stripe } from '../../../../lib/utils';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { accountId } = await req.json();

      const account = await stripe.accounts.retrieve(accountId);
      return NextResponse.json({
        account
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

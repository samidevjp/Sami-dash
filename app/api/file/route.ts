import { NextResponse } from 'next/server';
// import { stripe } from '../../../../lib/utils';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { fileId, accountId } = await req.json();

      const file = await stripe.files.retrieve(
        fileId
        //   {
        //   stripeAccount: accountId
        // }
      );
      return NextResponse.json({
        file
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

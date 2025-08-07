import { NextResponse } from 'next/server';
// import { stripe } from '../../../../lib/utils';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      //   const CUSTOMERS = [];
      const { email, description, accountId } = await req.json();
      const customerExists = await stripe.customers.list(
        {
          email,
          limit: 1
        },
        { stripeAccount: accountId }
      );
      console.log('customerExists', customerExists);
      if (customerExists.data.length > 0) {
        return NextResponse.json({
          customer: customerExists.data[0]
        });
      }
      const customer = await stripe.customers.create(
        {
          email,
          description
        },
        {
          stripeAccount: accountId
        }
      );

      return NextResponse.json({
        customer
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

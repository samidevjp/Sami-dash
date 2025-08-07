import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { accountId, nextPage, startDate, endDate } = await req.json();
    const startDateTimestamp = startDate
      ? Math.floor(new Date(startDate).getTime() / 1000)
      : undefined;

    // Adjust endDate to include the entire day
    const endDateTimestamp = endDate
      ? Math.floor(
          new Date(new Date(endDate).setHours(23, 59, 59, 999)).getTime() / 1000
        )
      : undefined;
    const paymentIntents = await stripe.paymentIntents.list(
      {
        limit: 10,
        starting_after: nextPage ? nextPage : undefined,
        created: {
          gte: startDateTimestamp,
          lte: endDateTimestamp
        }
      },
      { stripeAccount: accountId }
    );
    return NextResponse.json({
      paymentIntents
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

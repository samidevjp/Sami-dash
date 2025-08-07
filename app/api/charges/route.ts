import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { accountId, nextPage, startDate, endDate } = await req.json();

    let charges: any = [];
    let hasMore = true;
    let startingAfter = nextPage;
    const startDateTimestamp = startDate
      ? Math.floor(new Date(startDate).getTime() / 1000)
      : undefined;

    // Adjust endDate to include the entire day
    const endDateTimestamp = endDate
      ? Math.floor(
          new Date(new Date(endDate).setHours(23, 59, 59, 999)).getTime() / 1000
        )
      : undefined;

    while (hasMore) {
      const response = await stripe.charges.list(
        {
          limit: 100,
          starting_after: startingAfter ? startingAfter : undefined,
          created: {
            gte: startDateTimestamp,
            lte: endDateTimestamp
          }
        },
        { stripeAccount: accountId }
      );

      charges = charges.concat(response.data);
      hasMore = response.has_more;
      startingAfter = response.data[response.data.length - 1]?.id;
    }

    return NextResponse.json({
      charges
    });
  } catch (error) {
    console.error('An error occurred when calling the Stripe API:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

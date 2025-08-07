import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { payment_link_id, account } = await req.json();

      if (!payment_link_id || !account) {
        return NextResponse.json(
          { error: 'Payment link ID and account are required' },
          { status: 400 }
        );
      }

      // Retrieve the payment link
      const paymentLink = await stripe.paymentLinks.retrieve(payment_link_id, {
        stripeAccount: account
      });

      // Check if there are any completed sessions for this payment link
      const sessions = await stripe.checkout.sessions.list(
        {
          payment_link: payment_link_id,
          limit: 1
        },
        { stripeAccount: account }
      );

      const completedSession = sessions.data.find(
        (session) => session.payment_status === 'paid'
      );

      return NextResponse.json({
        completed: !!completedSession,
        payment_link: paymentLink,
        session: completedSession || null
      });
    } catch (error) {
      console.error(
        'An error occurred when checking payment link status:',
        error
      );
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const paymentLinkId = searchParams.get('payment_link_id');
    const account = searchParams.get('account');
    const type = searchParams.get('type') || 'payment_link'; // Default to payment_link for backward compatibility

    if (!paymentLinkId || !account) {
      return NextResponse.json(
        { error: 'Missing payment_link_id or account parameter' },
        { status: 400 }
      );
    }

    let isCompleted = false;
    let latestSession = null;
    let url = '';

    if (type === 'checkout_session') {
      // For checkout sessions, check the session directly
      try {
        const session = await stripe.checkout.sessions.retrieve(paymentLinkId, {
          stripeAccount: account
        });

        isCompleted = session.payment_status === 'paid';
        latestSession = session;
        url = session.url || '';

        console.log('Checkout session status:', session.payment_status);
      } catch (error) {
        console.error('Error retrieving checkout session:', error);
      }
    } else {
      // For payment links, check associated checkout sessions
      try {
        const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId, {
          stripeAccount: account
        });
        url = paymentLink.url;

        // Check if there are any completed checkout sessions for this payment link
        const sessions = await stripe.checkout.sessions.list(
          {
            payment_link: paymentLinkId,
            status: 'complete'
          },
          { stripeAccount: account }
        );

        isCompleted = sessions.data.length > 0;
        latestSession = sessions.data[0]; // Most recent session
      } catch (error) {
        console.error('Error retrieving payment link:', error);
      }
    }

    return NextResponse.json({
      payment_link_id: paymentLinkId,
      status: isCompleted ? 'completed' : 'pending',
      url: url,
      type: type,
      session_id: latestSession?.id || null,
      payment_intent_id: latestSession?.payment_intent || null,
      amount_total: latestSession?.amount_total || null,
      completed_at: latestSession
        ? new Date(latestSession.created * 1000).toISOString()
        : null
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}

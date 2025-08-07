import { NextResponse } from 'next/server';
// import { stripe } from '../../../../lib/utils';
import { stripe } from '@/lib/utils';

const endpointSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_KEY;

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      let { event } = await req.json();
      // Only verify the event if you have an endpoint secret defined.
      // Otherwise use the basic event deserialized with JSON.parse
      if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = event.headers['stripe-signature'];
        try {
          event = stripe.webhooks.constructEvent(
            event,
            signature,
            endpointSecret
          );
        } catch (err) {
          console.log(
            `⚠️  Webhook signature verification failed.`,
            (err as Error).message
          );
          return NextResponse.json(
            { error: (err as Error).message },
            { status: 400 }
          );
        }
      }

      // Handle the event
      switch (event.type) {
        case 'invoice.payment_failed':
          const invoice = event.data.object;
          // Then define and call a method to handle the failed payment of an Invoice.
          // handleFailedInvoice(invoice);
          break;
        case 'checkout.session.completed':
          const session = event.data.object;
          console.log('Payment completed for session:', session.id);

          try {
            // Check if this is from a payment link
            if (session.payment_link) {
              // Retrieve the payment link to get metadata
              const paymentLink = await stripe.paymentLinks.retrieve(
                session.payment_link
              );
              console.log('Payment link metadata:', paymentLink.metadata);

              // If we have booking metadata, handle booking completion
              if (paymentLink.metadata && paymentLink.metadata.booking_id) {
                await handleBookingPaymentCompletion({
                  booking_id: paymentLink.metadata.booking_id,
                  session: session,
                  paymentLink: paymentLink
                });
              }
            }
            // Also check if this is a direct checkout session with booking metadata (e.g., automatic discount sessions)
            else if (session.metadata && session.metadata.booking_id) {
              console.log(
                'Direct checkout session metadata:',
                session.metadata
              );
              await handleBookingPaymentCompletion({
                booking_id: session.metadata.booking_id,
                session: session,
                paymentLink: null // No payment link for direct checkout sessions
              });
            }
          } catch (error) {
            console.error('Error handling checkout session completion:', error);
          }
          break;
        default:
          // Unexpected event type
          console.log(`Unhandled event type ${event.type}.`);
      }

      // Return a 200 response to acknowledge receipt of the event
      return NextResponse.json({
        success: true
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

// Helper function to handle booking completion
async function handleBookingPaymentCompletion({
  booking_id,
  session,
  paymentLink
}: {
  booking_id: string;
  session: any;
  paymentLink: any | null;
}) {
  try {
    console.log(`Processing booking completion for booking ${booking_id}`);

    // Here you would typically:
    // 1. Update booking status to "finished" or "paid"
    // 2. Create transaction records
    // 3. Send confirmation emails
    // 4. Update any other related records

    // You can call your existing API endpoints or database operations here
    // For example, you might want to call your booking update API:

    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase && booking_id) {
      // Update booking status via your API
      const bookingUpdateResponse = await fetch(
        `${apiBase}booking/update-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // You might need to add authentication headers here
          },
          body: JSON.stringify({
            booking_id: booking_id,
            status: 'finished', // or whatever status indicates completion
            payment_session_id: session.id,
            payment_amount: session.amount_total,
            payment_method: 'stripe_payment_link'
          })
        }
      );

      if (bookingUpdateResponse.ok) {
        console.log(
          `Successfully updated booking ${booking_id} to finished status`
        );
      } else {
        console.error(
          `Failed to update booking ${booking_id}:`,
          await bookingUpdateResponse.text()
        );
      }
    }
  } catch (error) {
    console.error('Error in handleBookingPaymentCompletion:', error);
  }
}

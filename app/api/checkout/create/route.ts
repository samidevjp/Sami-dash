import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { account, items } = await req.json();
      console.log('items', items);
      const itemsObject = items.map((item: any) => ({
        price_data: {
          currency: 'aud',
          product_data: {
            name: item.title
          },
          unit_amount: item.price * 100
        },
        quantity: 1
      }));
      const session = await stripe.checkout.sessions.create(
        {
          line_items: [
            {
              price_data: {
                currency: 'aud',
                product_data: {
                  name: items[0].title
                },
                unit_amount: items[0].price * 100
              },
              quantity: 1
            }
          ],
          payment_intent_data: {
            application_fee_amount: 123
          },
          mode: 'payment',
          ui_mode: 'embedded',
          return_url: `https://wabi-dashboard.vercel.app/dashboard/checkout`
        },
        {
          stripeAccount: account
        }
      );

      return NextResponse.json({
        session: session
      });
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create a checkout session:',
        error
      );
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  }
}

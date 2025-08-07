// pages/api/account_session.js
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  const { account_id } = await req.json();
  if (req.method === 'POST') {
    try {
      const accountSession = await stripe.accountSessions.create({
        account: account_id,
        components: {
          payments: {
            enabled: true,
            features: {
              refund_management: true,
              dispute_management: true,
              capture_payments: true,
              destination_on_behalf_of_charge_management: false
            }
          },
          balances: {
            enabled: true,
            features: {
              instant_payouts: true,
              standard_payouts: true,
              edit_payout_schedule: true
            }
          },
          account_onboarding: {
            enabled: true
          },
          payouts_list: {
            enabled: true
          },
          account_management: {
            enabled: true,
            features: {
              external_account_collection: true
            }
          }
        }
      });
      console.log('section', accountSession);
      return NextResponse.json({
        client_secret: accountSession.client_secret
      });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  } else {
    NextResponse.json({ error: `Method ${req.method} Not Allowed` });
  }
}

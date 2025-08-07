// pages/api/account_session.js
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  const { accountId } = await req.json();
  if (req.method === 'POST') {
    try {
      const readers = await stripe.terminal.readers.list(
        { limit: 10, status: 'online' },
        { stripeAccount: accountId }
      );
      return NextResponse.json({
        readers: readers
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

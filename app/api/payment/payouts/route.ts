import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get balance information
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId
    });

    // Get payouts list with expected arrival date
    const payouts = await stripe.payouts.list(
      {
        limit,
        expand: ['data.destination']
      },
      {
        stripeAccount: accountId
      }
    );

    // Get account info for payout schedule
    const account = await stripe.accounts.retrieve(accountId);

    // Calculate next expected payout date based on schedule
    const payoutSchedule = account.settings?.payouts?.schedule;
    let nextPayoutDate = null;

    if (payoutSchedule) {
      const now = new Date();
      const delayDays = payoutSchedule.delay_days || 2; // Default 2 days

      if (payoutSchedule.interval === 'daily') {
        nextPayoutDate = new Date(
          now.getTime() + delayDays * 24 * 60 * 60 * 1000
        );
      } else if (payoutSchedule.interval === 'weekly') {
        const weeklyAnchor = Number(payoutSchedule.weekly_anchor) || 1;
        const daysUntilNextWeekday = (7 - now.getDay() + weeklyAnchor) % 7;
        nextPayoutDate = new Date(
          now.getTime() +
            (daysUntilNextWeekday + delayDays * 7) * 24 * 60 * 60 * 1000
        );
      } else if (payoutSchedule.interval === 'monthly') {
        const monthlyAnchor = Number(payoutSchedule.monthly_anchor) || 1;
        const nextMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          monthlyAnchor
        );
        nextPayoutDate = new Date(
          nextMonth.getTime() + delayDays * 24 * 60 * 60 * 1000
        );
      }
    }

    // Format payout data
    const formattedPayouts = payouts.data.map((payout) => ({
      id: payout.id,
      amount: payout.amount / 100, // Convert from cents
      currency: payout.currency.toUpperCase(),
      status: payout.status,
      method: payout.method,
      type: payout.type,
      created: new Date(payout.created * 1000),
      arrival_date: payout.arrival_date
        ? new Date(payout.arrival_date * 1000)
        : null,
      automatic: payout.automatic,
      description: payout.description,
      failure_code: payout.failure_code,
      failure_message: payout.failure_message
    }));

    return NextResponse.json({
      success: true,
      balance: {
        available: balance.available.map((b) => ({
          amount: b.amount / 100,
          currency: b.currency.toUpperCase()
        })),
        pending: balance.pending.map((b) => ({
          amount: b.amount / 100,
          currency: b.currency.toUpperCase()
        }))
      },
      payoutSchedule: {
        interval: payoutSchedule?.interval || 'manual',
        delay_days: payoutSchedule?.delay_days || 2,
        weekly_anchor: payoutSchedule?.weekly_anchor,
        monthly_anchor: payoutSchedule?.monthly_anchor
      },
      nextPayoutDate,
      payouts: formattedPayouts
    });
  } catch (error: any) {
    console.error('Error fetching payout data:', error);
    return NextResponse.json(
      { error: 'Error fetching payout data: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    if (action === 'request_instant_payout') {
      // Get current balance
      const balance = await stripe.balance.retrieve({
        stripeAccount: accountId
      });

      const availableAmount = balance.available[0]?.amount || 0;
      const payoutAmount = amount
        ? Math.min(amount * 100, availableAmount)
        : availableAmount;

      if (payoutAmount <= 0) {
        return NextResponse.json(
          { error: 'No funds available for payout' },
          { status: 400 }
        );
      }

      // Get account information to check payout destinations
      const account = await stripe.accounts.retrieve(accountId);

      // Check if instant payouts are supported for this account's payout method
      let canUseInstantPayout = false;
      let payoutMethod: 'standard' | 'instant' = 'standard'; // Default to standard

      if (
        account.external_accounts?.data &&
        account.external_accounts.data.length > 0
      ) {
        const externalAccount = account.external_accounts.data[0];

        // For Australia, instant payouts are only supported for debit cards, not bank accounts
        if (externalAccount.object === 'card') {
          canUseInstantPayout = true;
          payoutMethod = 'instant';
        } else if (externalAccount.object === 'bank_account') {
          // Bank accounts in Australia don't support instant payouts
          canUseInstantPayout = false;
          payoutMethod = 'standard';
        }
      }

      // Create payout with appropriate method
      const payout = await stripe.payouts.create(
        {
          amount: payoutAmount,
          currency: 'aud',
          method: payoutMethod,
          description: canUseInstantPayout
            ? 'Manual instant payout requested from admin dashboard'
            : 'Manual standard payout requested from admin dashboard'
        },
        {
          stripeAccount: accountId
        }
      );

      return NextResponse.json({
        success: true,
        payout: {
          id: payout.id,
          amount: payout.amount / 100,
          currency: payout.currency.toUpperCase(),
          method: payout.method,
          status: payout.status,
          arrival_date: payout.arrival_date
            ? new Date(payout.arrival_date * 1000)
            : null,
          isInstant: canUseInstantPayout
        },
        message: canUseInstantPayout
          ? 'Instant payout requested successfully'
          : 'Standard payout requested'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing payout request:', error);
    return NextResponse.json(
      { error: 'Error processing payout: ' + error.message },
      { status: 500 }
    );
  }
}

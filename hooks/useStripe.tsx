import { useSession } from 'next-auth/react';
import Stripe from 'stripe';

const useStripe = () => {
  const { data: session } = useSession();
  const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20',
    stripeAccount: session?.user?.stripeAccount
  });

  return { stripe };
};

export default useStripe;

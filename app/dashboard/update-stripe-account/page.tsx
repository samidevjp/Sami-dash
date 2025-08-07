'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';

interface ApiResponse {
  status_code: number;
  message?: string;
  data?: {
    user_id: number;
    stripe_account_id: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
}

export default function UpdateStripeAccount() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const updateStripeAccount = async () => {
      const accountId = searchParams.get('account_id');
      console.log('updateStripeAccount', accountId);

      if (!accountId) {
        toast({
          title: 'Error',
          description: 'No account ID provided',
          variant: 'destructive'
        });
        router.push('/dashboard');
        return;
      }

      try {
        const response = await axios({
          method: 'POST',
          url: `${process.env.NEXT_PUBLIC_API_URL}stripe-account-ids/save`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.token}`
          },
          data: {
            connected_account_id: accountId,
            is_deleted: false
          }
        });

        const data: ApiResponse = response.data;
        console.log('updateStripeAccount', data);
        if (data.status_code === 200) {
          toast({
            title: 'Success',
            description: 'Your payment account has been connected successfully',
            variant: 'success'
          });
        } else {
          throw new Error(data.message || 'Failed to update stripe account');
        }
      } catch (error) {
        console.log(
          'updateStripeAccount',
          (error as AxiosError)?.response?.data || ''
        );
        console.error('Error updating stripe account:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update stripe account';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    };

    if (session?.user?.token) {
      updateStripeAccount();
    }
  }, [searchParams, session?.user?.token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">
          Updating your payment account...
        </h1>
        <p className="text-muted-foreground">
          Please wait while we complete your setup.
        </p>
      </div>
    </div>
  );
}

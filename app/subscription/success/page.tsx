'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import Sidebar from '@/components/layout/sidebar';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const [feature, setFeature] = useState<string | null>(null);

  useEffect(() => {
    const feature = searchParams.get('feature');
    setFeature(feature);
  }, [searchParams]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <PageContainer>
          <div className="mx-auto mt-16 w-full max-w-3xl text-center">
            <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
            <h1 className="mt-6 text-4xl font-bold text-primary">
              Subscription Successful!
            </h1>
            <p className="mt-4 text-xl text-secondary-foreground">
              Thank you for subscribing to our {feature} plan.
            </p>
            <p className="mt-2 text-lg text-secondary-foreground">
              Your new features will be available in a few minutes.
            </p>
            <div className="mt-8 space-y-4">
              <p className="text-muted-foreground">
                While you wait, here are a few things you can do:
              </p>
              <ul className="mx-auto max-w-md list-inside list-disc text-left">
                <li>Explore other features of our platform</li>
                <li>Set up your profile information</li>
                <li>Invite team members to collaborate</li>
              </ul>
            </div>
            <div className="mt-12 space-x-4">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/subscription">View Subscription Details</Link>
              </Button>
            </div>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}

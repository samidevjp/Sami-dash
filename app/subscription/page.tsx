'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Sidebar from '@/components/layout/sidebar';
import PageContainer from '@/components/layout/page-container';
import { Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const featureContent = {
  invoicing: {
    title: 'Streamline Your Billing Process',
    description:
      'Create and manage professional invoices effortlessly, saving time and improving cash flow.',
    benefits: [
      'Generate professional invoices in seconds',
      'Track payments and send reminders automatically',
      'Integrate with your accounting software'
    ],
    image: '/placeholder-img.png',
    price: 30
  },
  pos: {
    title: 'Powerful Point of Sale System',
    description:
      'Manage your in-store and online sales with our intuitive POS solution.',
    benefits: [
      'Process transactions quickly and securely',
      'Manage inventory in real-time',
      'Generate detailed sales reports'
    ],
    image: '/placeholder-img.png',
    price: 30
  },
  inventory: {
    title: 'Efficient Inventory Management',
    description:
      'Keep track of your stock levels and optimize your inventory with ease.',
    benefits: [
      'Real-time stock tracking',
      'Automated reorder notifications',
      'Detailed inventory reports and analytics'
    ],
    image: '/placeholder-img.png',
    price: 30
  },
  onlineStore: {
    title: 'Launch Your Online Store',
    description:
      'Create a beautiful and functional e-commerce website to sell your products online.',
    benefits: [
      'Customizable templates for quick setup',
      'Secure payment gateway integration',
      'Mobile-responsive design for all devices'
    ],
    image: '/placeholder-img-preview.png',
    price: 30
  },
  bump: {
    title: 'Boost Your Sales with Bump',
    description:
      'Increase your average order value with our smart upselling tool.',
    benefits: [
      'Suggest relevant add-ons during checkout',
      'Customize offers based on customer behavior',
      'Track and analyze bump offer performance'
    ],
    image: '/placeholder-img.png',
    price: 30
  },
  marketing: {
    title: 'Promote your business with blast campaigns',
    description:
      'Increase bookings and engage with your clients by sharing special offers and important updates over email and text message.',
    benefits: [
      'Customise the message content to suit your style',
      'Target all clients, specific client groups or individuals',
      'Access powerful real-time campaign reporting'
    ],
    image: '/placeholder-img.png',
    price: 30
  }
};

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const feature = searchParams.get('feature')?.toLowerCase() || 'invoicing';
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const content =
    featureContent[feature as keyof typeof featureContent] ||
    featureContent.invoicing;

  const handleStartNow = async () => {
    setIsLoading(true);
    try {
      // First, create or retrieve the price
      const priceResponse = await axios.post(
        '/api/subscription/product/create',
        {
          productName: `${
            feature.charAt(0).toUpperCase() + feature.slice(1)
          } Subscription`,
          currency: 'aud',
          unit_amount: content.price * 100,
          interval: 'month',
          accountId: session?.user.stripeAccount
        }
      );

      const { price } = priceResponse.data;

      // Now create the subscription
      const subscriptionResponse = await axios.post(
        '/api/subscription/create',
        {
          priceId: price.id,
          feature: feature,
          accountId: session?.user.stripeAccount
        }
      );

      const { url } = subscriptionResponse.data;
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Error creating subscription:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="absolute right-0 top-0 -z-10 h-1/3 w-1/3 bg-gradient-to-bl from-cyan-200 to-transparent opacity-50" />
        <PageContainer>
          <div className="mx-auto mt-16 w-full max-w-5xl text-center">
            <h1 className="mb-4 text-4xl font-bold text-primary">
              {content.title}
            </h1>
            <p className="mx-auto mb-6 max-w-3xl text-xl text-secondary-foreground">
              {content.description}
            </p>
            <div className="mb-12 text-3xl font-bold text-primary">
              ${content.price}{' '}
              <span className="text-xl font-normal text-secondary-foreground">
                per month
              </span>
            </div>
            <div className="flex flex-col items-center gap-12 md:flex-row">
              <div className="flex-1">
                <ul className="space-y-4 text-left">
                  {content.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 space-x-4">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleStartNow}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Start now'}
                  </Button>
                  <Button variant="outline">Learn more</Button>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="rounded-lg bg-white p-6 shadow-lg">
                  <Image
                    src={content.image}
                    alt="Feature Preview"
                    width={400}
                    height={300}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}

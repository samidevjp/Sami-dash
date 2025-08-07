import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  CheckCircle2,
  Shield,
  Clock4,
  AlertCircle
} from 'lucide-react';
import FormLayout from './FormLayout';
import { motion } from 'framer-motion';
import Image from 'next/image';
import wabiLogo from '@/public/wabi-black.svg';

type CheckoutFormProps = {
  selectedSubscription: any[];
  subscriptions: any[];
  updateFields: (fields: { cardToken?: string }) => void;
};

export default function CheckoutForm({
  selectedSubscription,
  subscriptions,
  updateFields
}: CheckoutFormProps) {
  const [cardError, setCardError] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [cardToken, setCardToken] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const [bundlePakcage, setBundlePackage] = useState<any[]>([]);

  useEffect(() => {
    if (
      !Array.isArray(selectedSubscription) ||
      selectedSubscription.length === 0
    ) {
      setBundlePackage([]);
      return;
    }
    const fullPackage = subscriptions.find((sub) => sub.plan === 2);
    const merged: Record<string, Record<string, boolean>> = {};

    for (const sub of selectedSubscription) {
      const perms = sub.account_permissions || {};

      for (const category in perms) {
        if (!merged[category]) {
          merged[category] = {};
        }

        const subCategory = perms[category];

        for (const key in subCategory) {
          merged[category][key] = merged[category][key] || subCategory[key];
        }
      }
    }
    const allValues = Object.values(merged).flatMap((obj) =>
      Object.values(obj as Record<string, boolean>)
    );
    const allTrue = allValues.every((val) => val === true);

    if (allTrue) {
      setBundlePackage([fullPackage]);
    } else {
      setBundlePackage(selectedSubscription);
    }
  }, [selectedSubscription, subscriptions]);

  useEffect(() => {
    console.log('selectedSubscription', selectedSubscription);
  }, [selectedSubscription]);
  // Effect to disable the continue button if card details are not valid
  useEffect(() => {
    // Find the continue button
    const continueButton = document.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    if (continueButton) {
      if (!cardToken) {
        continueButton.disabled = true;
        continueButton.title = 'Please enter valid card details to continue';
      } else {
        continueButton.disabled = false;
        continueButton.title = '';
      }
    }
  }, [cardToken]);

  const handleCardChange = async (event: any) => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsComplete(event.complete);
    // Reset card token when user starts editing
    if (!event.complete) {
      setCardToken(null);
      updateFields({ cardToken: undefined });
    }

    // Clear error if the field is empty
    if (event.empty) {
      setCardError('');
    }

    if (event.error) {
      setCardError(event.error.message);
      setCardToken(null);
      updateFields({ cardToken: undefined });
      return;
    }

    if (event.complete) {
      try {
        const { token, error } = await stripe.createToken(cardElement);

        if (!error && token) {
          setCardBrand(token.card?.brand || '');
          setCardToken(token.id);
          updateFields({ cardToken: token.id });
          setCardError('');
        } else if (error) {
          setCardError(
            error.message || 'Card error. Please check your card details.'
          );
          setCardToken(null);
          updateFields({ cardToken: undefined });
        }
      } catch (err) {
        setCardError(
          'An error occurred while processing your card. Please try again.'
        );
        setCardToken(null);
        updateFields({ cardToken: undefined });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getSubscriptionPrice = (bundlePakcage: any[]) => {
    return bundlePakcage.reduce(
      (total, sub) => total + (Number(sub.monthly_price) || 0),
      0
    );
  };

  return (
    <FormLayout
      title="Complete Your Purchase"
      description="Review your subscription and enter payment details to get started."
      fullWidth
    >
      <div className="gap-6 rounded-lg bg-white p-4 md:grid md:grid-cols-2">
        <div className="rounded-sm bg-primary/10 p-6">
          <div className="p-4 md:p-8">
            <div className="py-8">
              <div className="mb-12 border-b border-gray-300 pb-12">
                <p className="mb-6 text-center font-medium text-muted-foreground">
                  Total Amount
                </p>
                <div className="mb-6 text-center text-5xl font-bold">
                  {formatPrice(getSubscriptionPrice(bundlePakcage))}
                  <span className="text-xs font-medium text-muted-foreground">
                    /month
                  </span>
                </div>
                <div className="space-y-4">
                  {bundlePakcage.map((sub, index) => (
                    <div className="flex flex-col" key={index}>
                      <div key={index} className="text text-center font-medium">
                        {sub.name}
                      </div>
                      <div
                        key={index}
                        className="text-center text-xs text-muted-foreground"
                      >
                        {sub.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className=" mb-8">
                <p className="mb-8 text-center font-medium text-muted-foreground">
                  Order Summary
                </p>
                <div className=" px-4">
                  <div className="mb-4 flex justify-between text-sm">
                    <span className="text-muted-foreground">Subscription</span>
                    <span>
                      {formatPrice(getSubscriptionPrice(bundlePakcage))}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total (monthly)</span>
                    <span className="text-lg">
                      {formatPrice(getSubscriptionPrice(bundlePakcage))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 rounded-lg bg-accent/5 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock4 className="h-4 w-4 text-primary" />
                  <span>Instant access after payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-16 flex items-center px-6 pb-8 md:mt-0 md:p-6">
          <div className="">
            <h3 className="mb-6 text-xl font-semibold text-primary md:mb-8">
              Payment Details
            </h3>

            <div className="md:px-4">
              <div className="">
                <div
                  className={`relative rounded-lg border p-4 shadow-sm transition-all duration-200 ${
                    cardError
                      ? 'border-danger'
                      : 'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'
                  }`}
                >
                  <div className="absolute left-4 top-4">
                    {cardError ? (
                      <AlertCircle className="h-5 w-5 text-danger" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="pl-8">
                    <CardElement
                      onChange={handleCardChange}
                      options={{
                        hidePostalCode: true,
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#32325d',
                            '::placeholder': { color: '#aab7c4' },
                            padding: '10px 0'
                          },
                          invalid: { color: '#fa755a' }
                        }
                      }}
                    />
                  </div>
                  {isComplete && !cardError && cardToken && (
                    <div className="absolute right-1 top-4">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>

                {cardError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ml-4 mt-2 flex items-center gap-2 text-sm text-danger"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {cardError}
                  </motion.p>
                )}

                {cardBrand && cardToken && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-2 pl-2 text-sm text-green-500"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Card type: {cardBrand}
                  </motion.p>
                )}

                <div className="mb-8 mt-8 rounded-lg px-2 text-sm text-muted-foreground">
                  <p>
                    Your subscription will start immediately after successful
                    payment. You can cancel or change your plan at any time from
                    your dashboard.
                  </p>
                </div>

                {!cardToken && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <p>
                        Please enter valid card details to complete registration
                      </p>
                    </div>
                  </motion.div>
                )}
                <Button
                  type="submit"
                  className="mt-8 w-full bg-gray-800 py-6"
                  disabled={!cardToken}
                >
                  Complete Payment
                </Button>
              </div>
            </div>
          </div>
          <Image
            src={wabiLogo}
            alt="Wabi Logo"
            width={50}
            height={50}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          />
        </div>
      </div>
    </FormLayout>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
// This should be moved to an environment variable
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function PaymentForm({
  customerId,
  businessId
}: {
  customerId: string;
  businessId: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const handleCardChange = async (event: any) => {
    const cardElement = elements?.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }
    const { token, error } = await stripe!.createToken(cardElement);
    if (event.complete && !error) {
      setCardBrand(token.card?.brand || null);
      setToken(token.id || null);
      console.log('token', token);
      setPaymentToken(token.id || null);
    } else if (error) {
      //   setErrorMessage("Card error. Please check your card details.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create a payment method using the card element
      //   const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      //     type: 'card',
      //     card: cardElement,
      //     billing_details: {
      //       name,
      //       email,
      //     },
      //   });

      //   if (stripeError) {
      //     setError(stripeError.message || 'Payment failed');
      //     setIsProcessing(false);
      //     return;
      //   }

      // Send the payment token to your API

      // const response = await fetch('/api/customer-payment', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     customerId,
      //     businessId,
      //     name,
      //     email,
      //     token
      //     //   paymentMethodId: paymentMethod.id,
      //   })
      // });

      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.message || 'Something went wrong');
      // }

      alert(
        'the token being saved is: ' +
          token +
          ' and the user id is: ' +
          customerId
      );
      // Payment was successful
      setSuccess(true);

      // Optionally redirect after successful payment
      // router.push(`/customer/payment-success?id=${data.paymentId}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-green-800">
          Payment Successful!
        </h3>
        <p className="mt-3 text-green-600">
          Thank you for your payment. You will receive a confirmation email
          shortly.
        </p>
        <button
          onClick={() => router.refresh()}
          className="mt-6 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
      <div className="mb-6">
        <h2 className="mb-1 text-xl font-bold text-gray-800">
          Payment Details
        </h2>
        <p className="text-sm text-gray-500">
          Please enter your information to complete the payment
        </p>
      </div>

      {error && (
        <div className="animate-fade-in mb-6 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                required
                placeholder="John Doe"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                required
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="card"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Credit Card Details
            </label>
            <div>
              <CardElement
                onChange={handleCardChange}
                options={{
                  hidePostalCode: true,
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#32325d',
                      '::placeholder': { color: '#aab7c4' },
                      padding: '10px'
                    },
                    invalid: { color: '#fa755a' }
                  }
                }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Your card information is securely processed by Stripe.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className={`flex w-full items-center justify-center rounded-md border border-transparent px-4 py-3 text-sm font-medium text-white shadow-sm ${
              isProcessing || !stripe
                ? 'cursor-not-allowed bg-indigo-400'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            } transition-colors`}
          >
            {isProcessing ? (
              <>
                <svg
                  className="-ml-1 mr-3 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              'Complete Payment'
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center space-x-2">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            ></path>
          </svg>
          <span className="text-xs text-gray-500">
            All transactions are secure and encrypted
          </span>
        </div>
      </form>
    </div>
  );
}

export default function CustomerPaymentForm({
  customerId,
  businessId
}: {
  customerId: string;
  businessId: string;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Elements stripe={stripePromise}>
        <PaymentForm customerId={customerId} businessId={businessId} />
      </Elements>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { loadConnectAndInitialize } from '@stripe/connect-js/pure';
import axios from 'axios';

const apiKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '';
const appearance = {
  theme: 'flat',
  variables: {
    fontFamily: 'font-normal',
    fontStyle: 'normal',
    fontLineHeight: '1.5',
    borderRadius: '10px',
    colorBackground: '#06040B',
    accessibleColorOnColorPrimary: '#06040B'
  },
  rules: {
    '.Block': {
      backgroundColor: '#06040B',
      boxShadow: 'none',
      padding: '12px'
    },
    '.Input': {
      padding: '12px'
    },
    '.Input:disabled, .Input--invalid:disabled': {
      color: 'lightgray'
    },
    '.Tab': {
      padding: '10px 12px 8px 12px',
      border: 'none'
    },
    '.Tab:hover': {
      border: 'none',
      boxShadow:
        '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
    },
    '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
      border: 'none',
      backgroundColor: '#06040B',
      boxShadow:
        '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
    },
    '.Label': {
      fontWeight: '500'
    }
  }
};

const useStripeConnect = (connectedAccountId: any) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await axios.post('/api/account_session', {
          account_id: connectedAccountId
        });
        const { client_secret: clientSecret } = response.data;
        // console.log('clientSecret', clientSecret)
        return clientSecret;
      } catch (error) {
        console.error('An error occurred: ', error);
        return null;
      }
    };

    const initializeStripeConnect = async () => {
      if (connectedAccountId) {
        const connectInstance = await loadConnectAndInitialize({
          publishableKey: apiKey,
          fetchClientSecret,
          appearance: appearance
        });
        setStripeConnectInstance(connectInstance);
      }
    };

    // if (typeof window !== "undefined") {
    //   initializeStripeConnect();
    // }
    initializeStripeConnect();
  }, [connectedAccountId]);

  return { stripeConnectInstance };
};

export default useStripeConnect;

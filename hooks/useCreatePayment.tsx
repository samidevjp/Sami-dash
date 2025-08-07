import { useApi } from './useApi';

export const useCreatePayment = () => {
  // const { findBusinessProfile } = useReadBusinessProfile();
  const { createPayment } = useApi();

  const processNextPayment = async (value: number) => {
    console.log('value', value);
    try {
      // const { paymentIntent, error: createIntentError } = await createPaymentIntent({
      //   amount: value,
      //   currency: 'aud',
      //   onBehalfOf: findBusinessProfile[0].stripe_account_id?.connected_account_id,
      //   paymentMethodTypes: ['card_present'],
      //   captureMethod: 'manual',
      //   transferDataDestination: findBusinessProfile[0].stripe_account_id?.connected_account_id,
      // });

      // if (createIntentError || !paymentIntent) {
      //   console.log('Error creating payment intent', createIntentError);
      //   if (createIntentError.message === 'discoverReaders must be called before createPaymentIntent') {
      //     throw new Error('No readers connected. Please connect a reader and try again.');
      //   }
      //   throw new Error(createIntentError.message);
      // }

      // const { paymentIntent: paymentIntentMethod, error: collectError } = await collectPaymentMethod({
      //   paymentIntent,
      // });

      // if (collectError) {
      //   console.log('error', collectError);
      //   cancelPaymentIntent(paymentIntent);
      //   throw new Error(collectError.message);
      // }

      // if (!paymentIntentMethod) return false;

      // const { paymentIntent: confirmedPaymentIntent, error: confirmError } = await confirmPaymentIntent(paymentIntentMethod);

      // if (confirmError) {
      //   throw new Error('Error confirming payment intent');
      // }

      // const paymentIntentTest = {
      //   payment_intent_id: confirmedPaymentIntent.id,
      // };

      // const payment = await createPayment(paymentIntentTest);
      // return payment;
      return { id: '123' };
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  const splitPayment = async (
    type: 'item' | 'totalValue',
    values: number[],
    tipAmount: any
  ) => {
    return values;
  };

  return { splitPayment, processNextPayment };
};

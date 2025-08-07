import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { title, unit_amount, accountId, imageUrl } = await req.json();

      const productData: any = {
        name: title
      };

      // Add images if provided (from URL or uploaded file)
      if (imageUrl && imageUrl.trim() !== '') {
        productData.images = [imageUrl];
      }
      const product = await stripe.products.create(productData, {
        stripeAccount: accountId
      });
      const priceList = await stripe.prices.list({ stripeAccount: accountId });
      const priceExists = priceList.data.find(
        (price: any) => price.product === product.id
      );
      if (priceExists) {
        return NextResponse.json({
          product: product,
          price: priceExists
        });
      }
      //  else {
      const price = await stripe.prices.create(
        {
          unit_amount: unit_amount * 100,
          currency: 'aud',
          product: product.id
        },
        { stripeAccount: accountId }
      );
      console.log('price', price);

      return NextResponse.json({
        product: product,
        price: price
      });
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create a payment link:',
        error
      );
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  }
}

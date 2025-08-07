import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/utils';

export async function PATCH(req: Request) {
  try {
    const { id, title, imageUrl, accountId } = await req.json();

    if (!id || !accountId) {
      return NextResponse.json(
        { error: 'Missing product ID or account ID' },
        { status: 400 }
      );
    }

    const nameUpdate = title && title.trim() !== '' ? title.trim() : undefined;

    if (imageUrl === '') {
      console.log('Clearing images with dummy overwrite first');

      const updatedProduct = await stripe.products.update(
        id,
        {
          name: nameUpdate,
          images: null
        },
        {
          stripeAccount: accountId
        }
      );
      return NextResponse.json({ product: updatedProduct });
    }

    const updateData: any = {};

    if (nameUpdate) {
      updateData.name = nameUpdate;
    }

    if (imageUrl && imageUrl.trim() !== '') {
      updateData.images = [imageUrl];
    }

    const updatedProduct = await stripe.products.update(id, updateData, {
      stripeAccount: accountId
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
// import { stripe } from '../../../../lib/utils';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const formData = await req.formData();

      // Extract fields from formData
      const accountId = formData.get('accountId') as string;
      const type = formData.get('type') as string;
      const name = formData.get('name') as string;

      // Extract files from formData
      // const icon = formData.get('icon') as File;
      const logo = formData.get('file') as File;
      // console.log('logo:', logo);
      // console.log('icon:', icon);
      const logoBuffer = Buffer.from(await logo.arrayBuffer()); // Convert the arrayBuffer to a Buffer
      // const logoBuffer = await logo.arrayBuffer();

      // console.log('logoBuffer:', logoBuffer);

      const file = await stripe.files.create(
        {
          // @ts-ignore
          purpose: type,
          file: {
            data: logoBuffer,
            name: name
          },
          file_link_data: { create: true }
        },
        {
          stripeAccount: accountId
        }
      );
      // console.log('file:', file);
      return NextResponse.json({
        file
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

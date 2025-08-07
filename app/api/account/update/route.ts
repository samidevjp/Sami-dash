import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract fields from formData
    const accountId = formData.get('accountId') as string;
    const primaryColor = formData.get('primaryColor') as string;
    const secondaryColor = formData.get('secondaryColor') as string;

    // Extract files from formData
    const icon = formData.get('icon') as string;
    const logo = formData.get('logo') as string;
    // Prepare the branding update object
    const brandingUpdate: any = {};
    if (primaryColor) brandingUpdate.primary_color = primaryColor;
    if (secondaryColor) brandingUpdate.secondary_color = secondaryColor;

    // Upload files to Stripe (if provided)
    if (icon) {
      //   const iconBuffer = Buffer.from(await icon.arrayBuffer()); // Convert the arrayBuffer to a Buffer

      //   const uploadedIcon = await stripe.files.create(
      //     {
      //       purpose: 'business_icon',
      //       file: {
      //         data: iconBuffer,
      //         name: icon.name,
      //         // type: 'application/octet-stream'
      //       },
      //       file_link_data: { create: true }
      //     },
      //     { stripeAccount: accountId }
      //   );
      brandingUpdate.icon = icon;
    }

    if (logo) {
      // const logoBuffer = await logo.arrayBuffer();
      // console.log('logo', logo);
      // console.log('logoBuffer:', logoBuffer);

      // const uploadedLogo = await stripe.files.create(
      //   {
      //     purpose: 'business_logo',
      //     file: {
      //       data: Buffer.from(logoBuffer),
      //       name: logo.name,
      //       // type: 'application/octet-stream'
      //     },
      //     file_link_data: { create: true }
      //   },
      //   { stripeAccount: accountId }
      // );
      brandingUpdate.logo = logo;
    }

    // const uploadedFiles = await stripe.files.list(
    //   {
    //     purpose: 'business_logo',
    //     limit: 10
    //   },
    //   {
    //     stripeAccount: accountId
    //   }
    // );
    // console.log('Uploaded Files:', uploadedFiles.data);
    // Update Stripe account with branding settings
    // brandingUpdate.logo = uploadedFiles.data[0].id;
    // console.log('brandingUpdate:', brandingUpdate);
    const updatedAccount = await stripe.accounts.update(
      accountId,
      {
        settings: {
          branding: brandingUpdate
        }
      },
      { stripeAccount: accountId }
    );
    // console.log('updatedAccount:', updatedAccount);
    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    console.error('Error updating Stripe branding:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

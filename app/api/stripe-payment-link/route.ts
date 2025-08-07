import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/utils';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const {
        account,
        items,
        metadata = {},
        tip = 0,
        discounts = [],
        customAmounts = []
      } = await req.json();
      console.log('items', items);
      console.log('metadata', metadata);
      console.log('tip', tip);
      console.log('discounts', discounts);
      console.log('customAmounts', customAmounts);

      // Process items - use existing price_id or create new products/prices
      const pricePromises = items.map(async (item: any) => {
        // If item already has a price_id, use it directly
        if (item.price_id) {
          return {
            price: item.price_id,
            quantity: item.quantity
          };
        }

        // Otherwise, create new product and price (for items without price_id)
        const productData: any = {
          name: item.title || item.name || 'Product'
        };

        // Add images if provided (from URL or uploaded file)
        if (item.imageUrl && item.imageUrl.trim() !== '') {
          productData.images = [item.imageUrl];
        }

        const product = await stripe.products.create(productData, {
          stripeAccount: account
        });

        const price = await stripe.prices.create(
          {
            unit_amount: Math.round((item.price || item.amount || 0) * 100),
            currency: 'aud',
            product: product.id
          },
          { stripeAccount: account }
        );
        console.log('Created new price:', price);

        return {
          price: price.id,
          quantity: item.quantity
        };
      });

      const lineItems = await Promise.all(pricePromises);

      // Add tip as a line item if provided
      if (tip > 0) {
        try {
          // Create a tip product and price
          const tipProduct = await stripe.products.create(
            {
              name: 'Tip',
              description: 'Service tip'
            },
            { stripeAccount: account }
          );

          const tipPrice = await stripe.prices.create(
            {
              unit_amount: Math.round(tip * 100), // Convert to cents
              currency: 'aud',
              product: tipProduct.id
            },
            { stripeAccount: account }
          );

          lineItems.push({
            price: tipPrice.id,
            quantity: 1
          });
        } catch (error) {
          console.error('Error creating tip line item:', error);
        }
      }

      // Add custom amounts as line items
      for (const customAmount of customAmounts) {
        if (customAmount.amount > 0) {
          try {
            const customProduct = await stripe.products.create(
              {
                name: customAmount.note || 'Additional Charge',
                description: `Custom amount: ${
                  customAmount.note || 'Additional Charge'
                }`
              },
              { stripeAccount: account }
            );

            const customPrice = await stripe.prices.create(
              {
                unit_amount: Math.round(customAmount.amount * 100), // Convert to cents
                currency: 'aud',
                product: customProduct.id
              },
              { stripeAccount: account }
            );

            lineItems.push({
              price: customPrice.id,
              quantity: 1
            });
          } catch (error) {
            console.error('Error creating custom amount line item:', error);
          }
        }
      }

      // Prepare payment link creation data
      const paymentLinkData: any = {
        line_items: lineItems
        // No promotion codes for Payment Links - we use Checkout Sessions for discounts
      };

      // Add metadata if provided (for booking tracking)
      if (Object.keys(metadata).length > 0) {
        paymentLinkData.metadata = metadata;
      }

      // For automatic discount application, use Checkout Session (better UX than Payment Links)
      if (discounts.length > 0) {
        try {
          console.log(
            'Creating Checkout Session with combined discount coupon (Stripe limit: 1 discount max)'
          );

          // Calculate total discount amount (Stripe only allows 1 discount per checkout session)
          const totalDiscountAmount = discounts.reduce(
            (sum: number, discount: any) => sum + discount.amount,
            0
          );

          // Create a single combined coupon with detailed metadata
          const discountTypes = discounts.map((d: any) => d.type).join(' + ');
          const discountDescriptions = discounts
            .map((d: any) => d.description)
            .join(' + ');

          // Create short name for Stripe (40 char limit)
          const shortName = `Auto Discount $${totalDiscountAmount.toFixed(2)}`;

          const coupon = await stripe.coupons.create(
            {
              amount_off: Math.round(totalDiscountAmount * 100), // Combined total amount
              currency: 'aud',
              duration: 'once',
              name: shortName, // Short name within 40 chars
              metadata: {
                booking_id: metadata.booking_id || '',
                guest_name: metadata.guest_name || '',
                created_for: 'auto_discount',
                discount_types: discountTypes, // Store all types
                individual_discounts: JSON.stringify(discounts) // Store individual breakdown
              }
            },
            { stripeAccount: account }
          );

          // Create checkout session with single combined discount (Stripe limitation)
          const checkoutSessionData: any = {
            line_items: lineItems,
            mode: 'payment',
            discounts: [{ coupon: coupon.id }], // Single combined coupon only
            // allow_promotion_codes: true, // Allow additional codes
            success_url: `${
              process.env.NEXTAUTH_URL || 'https://wabi-dashboard.vercel.app'
            }/dashboard?payment_completed=true&booking_id=${
              metadata.booking_id || ''
            }`,
            cancel_url: `${
              process.env.NEXTAUTH_URL || 'https://wabi-dashboard.vercel.app'
            }/dashboard?payment_cancelled=true`,
            automatic_tax: { enabled: false }
          };

          // Add metadata
          if (Object.keys(metadata).length > 0) {
            checkoutSessionData.metadata = metadata;
          }

          const checkoutSession = await stripe.checkout.sessions.create(
            checkoutSessionData,
            { stripeAccount: account }
          );

          console.log(
            'Created Checkout Session with combined discount coupon:',
            checkoutSession.id
          );

          return NextResponse.json({
            paymentLink: checkoutSession.url,
            payment_link_id: checkoutSession.id,
            url: checkoutSession.url,
            type: 'checkout_session',
            session_id: checkoutSession.id,
            discount_applied: true,
            discount_amount: totalDiscountAmount,
            discounts: discounts
          });
        } catch (error) {
          console.error(
            'Error creating checkout session with discount:',
            error
          );
          // If checkout session fails, return error - don't fall back to payment link
          // because we can't apply automatic discounts in payment links
          return NextResponse.json(
            {
              error:
                'Failed to create checkout session with discount. Payment links do not support automatic discounts.'
            },
            { status: 500 }
          );
        }
      }

      // For no discounts or as fallback, use regular Payment Link
      // Add completion redirect if booking data is present
      if (metadata.booking_id) {
        paymentLinkData.after_completion = {
          type: 'redirect',
          redirect: {
            url: `${
              process.env.NEXTAUTH_URL || 'https://wabi-dashboard.vercel.app'
            }/dashboard?payment_completed=true&booking_id=${
              metadata.booking_id
            }`
          }
        };
      }

      console.log('paymentLinkData', paymentLinkData);

      const paymentLink = await stripe.paymentLinks.create(paymentLinkData, {
        stripeAccount: account
      });

      console.log('paymentLink', paymentLink);

      return NextResponse.json({
        paymentLink: paymentLink.url,
        payment_link_id: paymentLink.id,
        url: paymentLink.url,
        type: 'payment_link'
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

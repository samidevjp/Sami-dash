import React from 'react';
import Image from 'next/image';
import { QrCode } from 'lucide-react';
import { getRelativeLuminance } from '@/utils/common';

interface GiftCardPreviewProps {
  formData: any;
  businessName: string | null;
  showStripImage: boolean;
}

const GiftCardPreview = ({
  formData,
  businessName,
  showStripImage
}: GiftCardPreviewProps) => {
  return (
    <div
      className="mx-auto max-w-[360px] rounded border p-4"
      style={{
        backgroundColor: formData.primaryColor,
        color: formData.secondaryColor
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {formData.logoImage && (
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src={
                  typeof formData.logoImage === 'string'
                    ? `${process.env.NEXT_PUBLIC_IMG_URL}${formData.logoImage}`
                    : URL.createObjectURL(formData.logoImage)
                }
                alt="logo"
                fill
                className="object-cover"
              />
            </div>
          )}
          <h3
            className="text-lg font-semibold"
            style={{ color: getRelativeLuminance(formData.primaryColor) }}
          >
            {showStripImage ? formData.title || 'Gift Card Name' : businessName}
          </h3>
        </div>
        {showStripImage && (
          <div className="text-right font-semibold">
            <p className="text-xs ">Business</p>
            <p style={{ color: getRelativeLuminance(formData.primaryColor) }}>
              {businessName}
            </p>
          </div>
        )}
      </div>

      {/* Show strip image only if applicable */}
      {showStripImage && formData.stripImage && (
        <div className="relative my-2 h-32 w-full overflow-hidden rounded">
          <Image
            src={
              typeof formData.stripImage === 'string'
                ? `${process.env.NEXT_PUBLIC_IMG_URL}${formData.stripImage}`
                : URL.createObjectURL(formData.stripImage)
            }
            alt="strip"
            fill
            className="object-cover"
          />
        </div>
      )}
      {!showStripImage && (
        <div className="relative my-2 flex h-24 w-full flex-col justify-center overflow-hidden rounded">
          <p className="font-semibold leading-4">
            <span className="text-xs">Offer</span>
          </p>
          <p
            className="text-2xl font-semibold "
            style={{ color: getRelativeLuminance(formData.primaryColor) }}
          >
            {formData.title}
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-between font-semibold">
        <div className="flex flex-col gap-0 leading-4">
          <p className="text-[10px] ">VALUE</p>
          <p style={{ color: getRelativeLuminance(formData.primaryColor) }}>
            ${formData.predefinedAmounts[0] || 0}
          </p>
        </div>
        <div>
          <p className="text-xs">VALID UNTIL</p>
          <p style={{ color: getRelativeLuminance(formData.primaryColor) }}>
            {formData.expirationDate || 'YYYY-MM-DD'}
          </p>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <div className="flex h-32 w-32 items-center justify-center rounded bg-white p-1">
          <QrCode size={128} className="text-black" />
        </div>
      </div>
    </div>
  );
};

export default GiftCardPreview;

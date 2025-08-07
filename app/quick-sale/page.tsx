'use client';
import React from 'react';
import ProductAndOrder from '@/components/pos/product-order';
import { PAYMENTORDERSTATUS } from '@/utils/enum';

export default function Page() {
  return (
    <div className="flex h-screen w-full flex-col overflow-y-scroll p-4 lg:overflow-hidden">
      <ProductAndOrder
        onClose={() => {}}
        pageType={PAYMENTORDERSTATUS.quicksale}
      />
    </div>
  );
}

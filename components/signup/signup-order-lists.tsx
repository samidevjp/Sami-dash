'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import SignupPaymentModal from './signup-payment-modal';
import person from '@/public/images/landing/common/jobs@2x.png';
import Image from 'next/image';
import SignupProductOrderList from '@/components/signup/signup-product-order-list';
interface OrderListsProps {
  guestName: string;
  items: any[];
  selectedProduct: any;
  setSelectedProduct: (product: any) => void;
  handleAddAddon: any;
  handleRemoveAddon: any;
  floorsName: any;
  orderListProducts: any;
  removeItem: any;
  calculateTotalPrice: any;
  onProfileClick: any;
  onTableClick: any;
}
const SignupOrderLists = ({
  guestName,
  items,
  selectedProduct,
  setSelectedProduct,
  handleAddAddon,
  handleRemoveAddon,
  floorsName,
  orderListProducts,
  removeItem,
  calculateTotalPrice,
  onProfileClick,
  onTableClick
}: OrderListsProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  return (
    <div className="flex h-full flex-col gap-2 rounded-lg bg-secondary p-4 md:max-h-[570px]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex cursor-pointer items-center">
          <Image
            className="mr-2 h-12 w-12 rounded-full bg-gray-200"
            src={person}
            alt="person"
          />
          <div onClick={onProfileClick}>
            <p className="font-bold">{guestName}</p>
            <p className="text-sm">0495748312</p>
          </div>
        </div>
        <div
          className="w-[70px] cursor-pointer rounded-lg border border-border bg-transparent px-1 py-2 text-center text-sm"
          onClick={onTableClick}
        >
          Table 6
        </div>
      </div>
      <div className="mb-2 flex justify-between text-sm">
        <p>
          {new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <p>2 guests, {floorsName}</p>
      </div>
      <SignupProductOrderList
        orderListProducts={orderListProducts}
        items={items}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        handleAddAddon={handleAddAddon}
        handleRemoveAddon={handleRemoveAddon}
        removeItem={removeItem}
      />

      <div className="mt-auto">
        <div className="mb-2 flex justify-between font-bold">
          <p>SUB-TOTAL</p>
          <p>${calculateTotalPrice(items).toFixed(2)}</p>
        </div>
        <Button
          className="h-12 w-full rounded-lg border border-white bg-black text-white"
          variant="outline"
          onClick={() => setIsPaymentModalOpen(true)}
        >
          Pay
        </Button>
      </div>

      <SignupPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={calculateTotalPrice(items)}
        guestName={guestName}
        items={[...orderListProducts, ...items]}
      />
    </div>
  );
};

export default SignupOrderLists;

'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { formatTimeStr, getFullname } from '@/utils/Utility';
import AllGuestsModal from './all-guests-modal';
import { useApi } from '@/hooks/useApi';
import { PAYMENTORDERSTATUS } from '@/utils/enum';
import ProductOrderList from './product-order-list';
const PhoneOrderList = ({
  items,
  selectedProduct,
  setSelectedProduct,
  removeItem,
  calculateTotalPrice,
  customer,
  pageType,
  handleAddAddon,
  setCustomer,
  handlePayment,
  orderListProducts,
  selectedPhoneOrder,
  setSelectedPhoneOrder,
  handleRemoveAddon,
  fetchPhoneOrder,
  setOpenAddonModal
}: {
  items: any[];
  selectedProduct: any;
  setSelectedProduct: (product: any) => void;
  removeItem: (index: number) => void;
  calculateTotalPrice: (items: any[]) => any;
  customer: any;
  pageType: number;
  handleAddAddon: any;
  handleRemoveAddon: any;
  setCustomer: (customer: any) => void;
  handlePayment: () => void;
  orderListProducts: any;
  selectedPhoneOrder?: any;
  setSelectedPhoneOrder: (phoneOrder: any) => void;
  fetchPhoneOrder?: any;
  setOpenAddonModal?: any;
}) => {
  const itemsRef = useRef<HTMLDivElement>(null);
  const { createOrder } = useApi();
  useEffect(() => {
    if (itemsRef.current) {
      itemsRef.current.scrollTop = itemsRef.current.scrollHeight;
    }
  }, [items]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const [isOpenAllGuestsModal, setIsOpenAllGuestsModal] = useState(false);
  const changeGuest = async (guest: any) => {
    if (selectedPhoneOrder) {
      const param = {
        ...selectedPhoneOrder,
        customer: {
          email: guest.email || 'noname@email.com',
          phone: guest.phone || '---',
          name: getFullname(guest) || 'No Name'
        }
      };

      const response = await createOrder(param);
      const responseCustomer = response.data.phoneOrder.customer;
      setSelectedPhoneOrder((prevItem: any) => ({
        ...prevItem,
        customer: responseCustomer
      }));
      fetchPhoneOrder();
    }
    setCustomer({
      name: getFullname(guest),
      phone: guest.phone,
      email: guest.email
    });

    setIsOpenAllGuestsModal(false);
  };
  return (
    <div className="flex h-full flex-col gap-2 rounded-lg bg-secondary p-4 shadow">
      {pageType === PAYMENTORDERSTATUS.quicksale && (
        <div className="mb-4">
          <Input
            name="name"
            value={customer.name}
            onChange={handleCustomerChange}
            placeholder="Customer Name"
            className="mb-2"
          />
          <Input
            name="phone"
            value={customer.phone}
            onChange={handleCustomerChange}
            placeholder="Phone Number"
            className="mb-2"
          />
        </div>
      )}
      {pageType === PAYMENTORDERSTATUS.phoneOrder && (
        <div className="mb-4">
          <div className="flex justify-between">
            <p>Phone Order</p>
            <p className="text-sm">
              {formatTimeStr(selectedPhoneOrder?.order_date)}
            </p>
          </div>
          {selectedPhoneOrder ? (
            <div
              className="cursor-pointer text-xs"
              onClick={() => setIsOpenAllGuestsModal(true)}
            >
              <p>{selectedPhoneOrder.customer?.name}</p>
              <p>{selectedPhoneOrder.customer?.phone}</p>
              <p>{selectedPhoneOrder.customer?.email}</p>
            </div>
          ) : customer?.name.length > 0 ? (
            <div
              className="cursor-pointer text-xs"
              onClick={() => setIsOpenAllGuestsModal(true)}
            >
              <p>{customer.name}</p>
              <p>{customer.phone}</p>
              <p>{customer.email}</p>
            </div>
          ) : (
            <p
              className="cursor-pointer text-xs"
              onClick={() => setIsOpenAllGuestsModal(true)}
            >
              No Name
            </p>
          )}
        </div>
      )}
      {isOpenAllGuestsModal && (
        <AllGuestsModal
          isOpenAllGuestsModal={isOpenAllGuestsModal}
          setIsOpenAllGuestsModal={setIsOpenAllGuestsModal}
          changeGuest={changeGuest}
        />
      )}
      <ProductOrderList
        orderListProducts={orderListProducts}
        items={items}
        handleRemoveAddon={handleRemoveAddon}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        handleAddAddon={handleAddAddon}
        removeItem={removeItem}
        setOpenAddonModal={setOpenAddonModal}
      />
      <div className="mt-auto">
        <div className="mb-2 flex justify-between font-bold">
          <p>SUB-TOTAL</p>
          <p>${calculateTotalPrice(items).toFixed(2)}</p>
        </div>
      </div>
      <Button
        className="h-12 w-full rounded-lg border border-white bg-black text-white"
        variant="outline"
        onClick={handlePayment}
      >
        Pay
      </Button>
    </div>
  );
};

export default PhoneOrderList;

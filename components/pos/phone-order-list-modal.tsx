import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '../ui/dialog';
import { getSum } from '@/lib/utils';
import ProductAndOrder from './product-order';
import { useApi } from '@/hooks/useApi';
import { formatTimeStr } from '@/utils/Utility';
import { PAYMENTORDERSTATUS } from '@/utils/enum';
interface PhoneOrderListModalProps {
  isOpenPhoneOrderModal: boolean;
  setIsOpenPhoneOrderModal: (value: boolean) => void;
  phoneOrderList: any;
  setPhoneOrderList: (value: any) => void;
  propAllCategories: any;
  propSetAllCategories: (value: any) => void;
}
const PhoneOrderListModal = ({
  isOpenPhoneOrderModal,
  setIsOpenPhoneOrderModal,
  phoneOrderList,
  setPhoneOrderList,
  propAllCategories,
  propSetAllCategories
}: PhoneOrderListModalProps) => {
  const { getPhoneOrderList } = useApi();
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const [selectedPhoneOrder, setSelectedPhoneOrder] = useState(null);
  const openPaymentModal = (phoneOrder: any) => {
    setSelectedPhoneOrder(phoneOrder);
    setIsOpenPaymentModal(true);
  };
  const fetchPhoneOrder = async () => {
    try {
      const response = await getPhoneOrderList();
      setPhoneOrderList(response.data.phoneOrders);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Dialog
      open={isOpenPhoneOrderModal}
      onOpenChange={() => setIsOpenPhoneOrderModal(false)}
      modal={true}
    >
      <DialogContent className="h-screen min-w-[100dvw] content-start">
        <ul
          className="grid overflow-y-auto pt-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gridGap: '0.5rem'
          }}
        >
          {phoneOrderList?.map((item: any, index: number) => (
            <li
              key={index}
              className="relative flex h-40 w-40 cursor-pointer items-center justify-center rounded-lg border border-primary bg-secondary shadow transition-all hover:opacity-60"
              onClick={() => openPaymentModal(item)}
            >
              <p className="text-xs">{item.customer.name}</p>
              <div className="absolute bottom-0 flex w-full justify-between border-t border-border p-2 text-[8px]">
                <p>{formatTimeStr(item.order_date)}</p>
                <p>${getSum(item.products).toFixed(2)}</p>
              </div>
            </li>
          ))}
          {(() => {
            if (phoneOrderList.length < 24) {
              return Array.from({ length: 24 - phoneOrderList.length }).map(
                (_, index) => (
                  <li
                    onClick={() => openPaymentModal(null)}
                    key={`placeholder-${index}`}
                    className="relative flex h-40 w-40 cursor-pointer items-center justify-center rounded-lg border border-border bg-secondary shadow transition-all hover:opacity-60"
                  ></li>
                )
              );
            } else {
              const totalItems = phoneOrderList.length;
              const nearestMultipleOfEight = Math.ceil(totalItems / 8) * 8;
              const placeholdersNeeded = nearestMultipleOfEight - totalItems;

              return Array.from({ length: placeholdersNeeded }).map(
                (_, index) => (
                  <li
                    onClick={() => openPaymentModal(null)}
                    key={`placeholder-${index}`}
                    className="relative flex h-40 w-40 cursor-pointer items-center justify-center rounded-lg border border-border bg-secondary shadow transition-all hover:opacity-60"
                  ></li>
                )
              );
            }
          })()}
        </ul>
        <Dialog
          open={isOpenPaymentModal}
          onOpenChange={() => setIsOpenPaymentModal(!isOpenPaymentModal)}
          modal={true}
        >
          <DialogOverlay className="min-h-full min-w-full p-4 backdrop-blur-3xl">
            <ProductAndOrder
              pageType={PAYMENTORDERSTATUS.phoneOrder}
              selectedPhoneOrder={selectedPhoneOrder}
              setSelectedPhoneOrder={setSelectedPhoneOrder}
              onClose={() => setIsOpenPaymentModal(false)}
              propAllCategories={propAllCategories}
              propSetAllCategories={propSetAllCategories}
              fetchPhoneOrder={fetchPhoneOrder}
            />
          </DialogOverlay>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneOrderListModal;

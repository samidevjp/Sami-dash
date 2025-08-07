'use client';
import React, { useState } from 'react';
import moment from 'moment';
import { Button } from '../ui/button';
import PaymentModal from './payment-modal';
import { Avatar } from '../ui/avatar';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import AllGuestsModal from './all-guests-modal';
import { useApi } from '@/hooks/useApi';
import ProductOrderList from './product-order-list';
import LocalOrders from './local-orders';

interface OrderListsProps {
  guestName: string;
  items: any[];
  selectedProduct: any;
  setSelectedProduct: (product: any) => void;
  handleAddAddon: any;
  bookingData: any;
  setBookingData: any;
  floorsName: any;
  orderListProducts: any;
  removeItem: any;
  calculateTotalPrice: any;
  table: any;
  onProfileClick: any;
  onTableClick: any;
  handleRemoveAddon: any;
  updateData: any;
  setOpenAddonModal: any;
  localOrders?: any[];
}
const OrderLists = ({
  guestName,
  items,
  selectedProduct,
  setSelectedProduct,
  handleAddAddon,
  bookingData,
  setBookingData,
  floorsName,
  orderListProducts,
  removeItem,
  calculateTotalPrice,
  handleRemoveAddon,
  table,
  onProfileClick,
  onTableClick,
  updateData,
  setOpenAddonModal,
  localOrders = []
}: OrderListsProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { createBooking } = useApi();
  const getFloorName = () => {
    const floor = floorsName?.find(
      (floor: any) => floor.id === table?.floor_id
    );
    return floor?.name;
  };
  const { toast } = useToast();
  const changeGuest = async (guestInfo: any) => {
    const params = {
      start_date: bookingData.start_date,
      partial_seated: bookingData.partial_seated,
      reservation_note: bookingData.reservation_note,
      uuid: bookingData.uuid,
      booking_taken: bookingData.booking_taken,
      table_lock: bookingData.table_lock,
      status: bookingData.status,
      no_limit: bookingData.no_limit,
      end_date: bookingData.end_date,
      table: bookingData.table,
      id: bookingData.id,
      table_ids: [bookingData.table[0].id],
      table_id: bookingData.table[0].id,
      created_at: bookingData.created_at,
      finished_date: bookingData.finished_date,
      guest: guestInfo,
      party_size: bookingData.party_size,
      shift_id: bookingData.shift_id,
      type: bookingData.type
    };
    try {
      const updatedBooking = await createBooking(params);

      setBookingData(params);
      setIsOpenAllGuestsModal(false);
      updateData();
      toast({
        title: 'Success',
        description: 'Guest information updated successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error updating guest information:', error);
      toast({
        title: 'Error',
        description: 'Failed to update guest information',
        variant: 'destructive'
      });
    }
  };

  const [isOpenAllGuestsModal, setIsOpenAllGuestsModal] =
    useState<boolean>(false);

  return (
    <div className="flex h-full flex-col gap-2 rounded-lg bg-secondary p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex cursor-pointer items-center">
          {bookingData?.guest?.photo ? (
            <Image
              src={process.env.NEXT_PUBLIC_IMG_URL + bookingData?.guest?.photo}
              alt="Avatar"
              width={48}
              height={48}
              className="mr-2 h-12 w-12 rounded-full bg-white"
              onClick={() => setIsOpenAllGuestsModal(true)}
            />
          ) : (
            <Avatar
              onClick={() => setIsOpenAllGuestsModal(true)}
              className="mr-2 h-12 w-12 rounded-full bg-white"
            />
          )}
          <div onClick={onProfileClick}>
            <p className="font-bold">{guestName}</p>
            <p className="text-sm">{bookingData?.guest?.phone}</p>
          </div>
        </div>
        <div
          className="w-[70px] cursor-pointer rounded-lg border border-border bg-transparent px-1 py-2 text-center text-sm"
          onClick={onTableClick}
        >
          {table?.name}
        </div>
      </div>
      <div className="mb-2 flex justify-between text-sm">
        <p>{moment(bookingData?.start_date).format('h:mm A')}</p>
        <p>{`${bookingData?.party_size} guests, ${getFloorName()}`}</p>
      </div>
      <ProductOrderList
        orderListProducts={orderListProducts}
        items={items}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        handleAddAddon={handleAddAddon}
        handleRemoveAddon={handleRemoveAddon}
        removeItem={removeItem}
        setOpenAddonModal={setOpenAddonModal}
      />
      <LocalOrders localOrders={localOrders} table={table} />
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
      <AllGuestsModal
        isOpenAllGuestsModal={isOpenAllGuestsModal}
        setIsOpenAllGuestsModal={setIsOpenAllGuestsModal}
        changeGuest={changeGuest}
      />
      {/* for POS, phone order and quick sale call this in product-order.tsx */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={calculateTotalPrice(items)}
        guestName={guestName}
        tableId={table?.name}
        items={[...orderListProducts, ...items]}
      />
    </div>
  );
};

export default OrderLists;

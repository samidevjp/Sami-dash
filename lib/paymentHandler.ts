import { toast } from '@/components/ui/use-toast';
import { BOOKINGSTATUS } from '@/utils/enum';
import { v4 as uuid } from 'uuid';

export const handleQuickSalePayment = async ({
  total,
  items,
  guestName,
  currentEmployee,
  createOrder,
  createTransactionApi,
  createTransaction,
  transactionData
}: any): Promise<any> => {
  const orderParam = {
    pos_device_id: 1,
    order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    uuid: uuid(),
    products: items.map((item: any) => ({
      ...item,
      uuid: uuid(),
      is_printed: false,
      isCancelled: false,
      is_deleted: false,
      currentTimestamp: Date.now() * 1000,
      option_ids: []
    })),
    employee_id: currentEmployee?.id,
    take_away: true,
    customer: {
      email: 'noname@email.com',
      uuid: uuid(),
      phone: '---',
      name: guestName || 'No Name'
    }
  };

  const response = await createOrder(orderParam);
  const response2 = await createTransaction(
    total,
    transactionData.tipAmount,
    currentEmployee,
    transactionData.customAmount,
    transactionData.discount,
    transactionData.surcharge,
    createTransactionApi,
    response.data.phoneOrder.uuid,
    response.data.phoneOrder.id,
    transactionData.payments,
    2
  );
  return response2;
};

export const handlePhoneOrderPayment = async ({
  total,
  currentEmployee,
  createTransaction,
  createTransactionApi,
  transactionData,
  phoneOrder,
  onClosePhoneOrder
}: any) => {
  await createTransaction(
    total,
    transactionData.tipAmount,
    currentEmployee,
    transactionData.customAmount,
    transactionData.discount,
    transactionData.surcharge,
    createTransactionApi,
    phoneOrder.uuid,
    phoneOrder.id,
    transactionData.payments,
    2
  );

  if (onClosePhoneOrder) onClosePhoneOrder();
};

export const handleOnAccountPayment = async ({
  currentEmployee,
  createonAccountTransaction,
  createTransactionApi,
  transactionData,
  docket
}: any) => {
  await createonAccountTransaction(
    transactionData.tipAmount,
    currentEmployee,
    transactionData.customAmount,
    createTransactionApi,
    transactionData.payments,
    transactionData.discount,
    transactionData.surcharge,
    docket
  );
};

export const handleBookingPayment = async ({
  total,
  currentEmployee,
  createTransaction,
  createTransactionApi,
  addBookingOrder,
  booking,
  items,
  transactionData,
  handleFinishBooking
}: any) => {
  const itemsUpdated = items.map((item: any) => ({
    ...item,
    isCancelled: false,
    is_deleted: false,
    is_pop_up: false,
    price_type: item.price_type || 1
  }));

  if (!booking.order_id || items.length > 0) {
    const param: any = {
      status: booking.status || 0,
      table_id: booking.table[0].id,
      booking_id: booking.id,
      guest: booking.guest,
      products: [...itemsUpdated],
      pos_device_id: 7,
      employee_id: currentEmployee?.id,
      booking_uuid: booking.uuid,
      uuid: booking.order_uuid || uuid()
    };

    const response = await addBookingOrder(param);
    await createTransaction(
      total,
      transactionData.tipAmount,
      currentEmployee,
      transactionData.customAmount,
      transactionData.discount,
      transactionData.surcharge,
      createTransactionApi,
      response.data.order.uuid,
      response.data.order.id,
      transactionData.payments,
      1
    );

    if (booking.status !== BOOKINGSTATUS.finished) {
      await handleFinishBooking();
    }

    toast({
      title: 'Booking Finished',
      description: 'Booking finished successfully',
      variant: 'success'
    });
  }
};

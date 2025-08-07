import { formatDate } from '@/lib/utils';
import { v4 as uuid } from 'uuid';
import { toast } from '@/components/ui/use-toast';

const createOrder = async (
  items: any,
  employee: any,
  createOrder: any,
  booking: any
) => {
  const updatedItems = items
    ?.filter((item: any) => !item.custom_item)
    .map((item: any) => {
      const {
        created_at,
        is_pop_up,
        is_deleted,
        status,
        isCancelled,
        is_printed,
        updated_at,
        addOns,
        custom_item,
        ...rest
      } = item;

      return {
        ...rest,
        uuid: uuid(),
        is_pop_up: is_pop_up === 1 ? true : is_pop_up === 0 ? false : is_pop_up,
        is_deleted: is_deleted === 1 ? true : is_deleted === 0 ? false : false,
        status: status === 1 ? true : status === 0 ? false : status,
        isCancelled:
          isCancelled === 1 ? true : isCancelled === 0 ? false : false,
        is_printed: is_printed === 1 ? true : is_printed === 0 ? false : false,
        currentTimestamp: Date.now(),
        price: item.price,
        addOns: item.addOns ? item.addOns : [],
        note: item.note ? item.note : ''
      };
    });

  const formattedDate = formatDate(new Date());
  const orderCreated = {
    // id: booking.payments.order_id,
    pos_device_id: 1,
    order_date: formattedDate,
    uuid: uuid(),
    products: updatedItems,
    employee_id: employee?.id,
    take_away: false,
    customer: {
      email: 'brunoTest@email.com',
      uuid: uuid(),
      phone: '---',
      name: 'BrunoTest'
    }
  };

  // const bookingOrderId = booking.payments?.order_id;
  // if (bookingOrderId) {
  //   // @ts-ignore
  //   orderCreated.id = bookingOrderId;
  // }
  // orderCreated.uuid = booking.payments?.orders[0].uuid || orderCreated.uuid;

  try {
    const orderResponse = await createOrder(orderCreated);
    console.log('orderResponse', orderResponse);
    return orderResponse.data.phoneOrder;
  } catch (err) {
    console.log('apiError', err);
    throw err;
  }
};

const handleAddOrderToBooking = async (
  bookingData: any,
  items: any,
  currentEmployee: any,
  addBookingOrder: any
) => {
  const param: any = {
    status: bookingData.status || 0,
    table_id: bookingData.table[0].id,
    booking_id: bookingData.id,
    guest: bookingData.guest,
    products: [...items],
    pos_device_id: 7,
    employee_id: currentEmployee?.id
  };

  if (bookingData.uuid) {
    param.booking_uuid = bookingData.uuid;
  }
  if (bookingData.order_uuid) {
    param.uuid = bookingData.order_uuid;
  } else {
    param.uuid = uuid();
  }
  try {
    const response = await addBookingOrder(param);
    toast({
      title: 'Success',
      variant: 'success',
      description: 'Order added to booking'
    });
    return response.data;
  } catch (error) {
    console.error('An error occurred:', error);
    toast({
      title: 'Error',
      variant: 'destructive',
      // @ts-ignore
      description: error.message || ''
    });
  }
};
const UNITTYPE = {
  percentage: 1,
  amount: 2
};
const formatValue = (target: any, type = UNITTYPE.amount) => {
  if (target?.length > 0) {
    return target.map((item: any) => {
      return {
        type: type,
        id: item.id,
        name: item.name,
        amount: item.amount,
        value: item.amount
      };
    });
  } else return null;
};

const createonAccountTransaction = async (
  tip: any,
  employee: any,
  customAmount: any,
  createTransactionApi: any,
  payments: any,
  discount: any,
  surcharge: any,
  docket: any
) => {
  const randonNumber = Date.now();
  const formattedDate = formatDate(new Date());
  const transaction = {
    pos_cash_drawer_id: 0,
    order_uuid: docket.uuid,
    id: docket.id,
    uuid: uuid(),
    tip: formatValue(docket.tip || tip, UNITTYPE.amount),
    employee_id: employee?.id,
    order_id: docket.order_id,
    sub_total: docket.total,
    payments: [
      {
        receipt_id: `P-00000${randonNumber}`,
        methods: payments
      }
    ],
    order_type: docket.order_type,
    surcharge: formatValue(docket.surcharge || surcharge, UNITTYPE.percentage),
    transaction_date: formattedDate,
    receipt_id: '',
    custom_amount: customAmount ? customAmount : [],
    discount: formatValue(docket.discount || discount, UNITTYPE.amount),
    transaction_id: docket.transaction_id
  };

  try {
    const createdTransaction = await createTransactionApi(transaction);
    console.log('createdTransaction', createdTransaction.data);
    return createdTransaction.data;
  } catch (err) {
    console.log('transactionError', err);
    throw err;
  }
};

const createTransaction = async (
  totalItems: any,
  tipAmount: any,
  employee: any,
  customAmount: any,
  discount: any,
  surcharge: any,
  createTransactionApi: any,
  orderUuid: string,
  orderId: number,
  payments: any,
  orderType: number = 1
) => {
  const randonNumber = Date.now();
  const formattedDate = formatDate(new Date());

  const transaction = {
    pos_cash_drawer_id: 0,
    order_uuid: orderUuid,
    uuid: uuid(),
    tip: {
      type: 2,
      value: tipAmount.toString(),
      name: ''
    },
    employee_id: employee?.id,
    order_id: orderId,
    sub_total: totalItems,
    payments: [
      {
        receipt_id: `P-00000${randonNumber}`,
        methods: payments
      }
    ],
    order_type: orderType,
    surcharge: [
      {
        type: 1,
        value: surcharge.toString(),
        name: 'Credit surcharge'
      }
    ],
    transaction_date: formattedDate,
    receipt_id: '',
    custom_amount: customAmount ? customAmount : [],
    discount: {
      type: 1,
      value: discount.toString(),
      name: ''
    },
    transaction_id: `WB0000${randonNumber}`
  };
  // console.log('transactionparams', transaction);
  try {
    const createdTransaction = await createTransactionApi(transaction);
    // console.log('createdTransaction', createdTransaction.data);
    return createdTransaction.data;
  } catch (err) {
    console.log('transactionError', err);
    throw err;
  }
};

const createOrderAndTransaction = async (
  totalItems: any,
  tipAmount: any,
  employee: any,
  customAmount: any,
  discount: any,
  surcharge: any,
  createTransactionApi: any,
  booking: any,
  payments: any
) => {
  try {
    const transaction = await createTransaction(
      totalItems,
      tipAmount,
      employee,
      customAmount,
      surcharge,
      discount,
      createTransactionApi,
      booking.order_uuid,
      booking.order_id,
      payments
    );
    // const orderToBooking = await handleAddOrderToBooking(booking, items, employee, addBookingOrder);

    console.log('transaction', transaction);

    toast({
      title: 'Payment successful',
      description: 'Payment successful',
      variant: 'success'
    });

    return { transaction };
  } catch (err) {
    console.log('Error in createOrderAndTransaction:', err);
    toast({
      title: 'Error',
      description: 'An error occurred during the process',
      variant: 'destructive'
    });
    throw err;
  }
};

export {
  createOrder,
  createTransaction,
  createonAccountTransaction,
  createOrderAndTransaction
};

'use client';
import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import Image from 'next/image';
import { CircleCheck, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import TransactionThumb from '../transactions/TransactionThumb';
import PaymentModal from '@/components/pos/payment-modal';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Heading } from '@/components/ui/heading';

export default function Page() {
  const {
    getOnAccount,
    getGuestDocket,
    getBusinessProfile,
    getStripeCustomer,
    createStripeCustomer,
    createStripeInvoiceOnAccount
  } = useApi();
  const [guestsOnAccount, setGuestsOnAccount] = useState<any[]>([]);
  const handleGetOnAccount = async () => {
    try {
      const response = await getOnAccount();
      setGuestsOnAccount(response.data.guests);
    } catch (err) {
      console.error(err);
    }
  };
  const [businessProfile, setBusinessProfile] = useState<any | null>(null);

  const asyncBusinessProfile = async () => {
    try {
      const response = await getBusinessProfile();
      setBusinessProfile(response.data.business_profile);
    } catch (error) {
      console.error('error', error);
    }
  };

  const [stripeCustomers, setStripeCustomers] = useState<any[]>([]);

  const fetchCustomers = async (allCustomers: any = []) => {
    try {
      const response = await getStripeCustomer({
        limit: 40,
        starting_after: allCustomers[allCustomers.length - 1]?.id
      });

      const updatedCustomers = [...allCustomers, ...response.data];
      setStripeCustomers(updatedCustomers);
      if (response.has_more) {
        await fetchCustomers(updatedCustomers);
      }
    } catch (error) {
      console.error('An error occurred while fetching customers:', error);
    }
  };

  const [onAccountDockets, setOnAccountDockets] = useState<any[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
  const openPaymentModal = (docket: any) => {
    setIsOpenPaymentModal(true);
    setSelectedTransaction(docket);
  };
  const handleonClosePaymentModal = async () => {
    setIsOpenPaymentModal(false);
    const account_reseponse = await getGuestDocket({
      id: selectedGuest.id,
      docket_type: 'on_account'
    });
    if (account_reseponse) {
      if (account_reseponse.data.length > 0) {
        setOnAccountDockets(account_reseponse.data);
      } else {
        setOnAccountDockets([]);
        setIsOpenModal(false);
        handleGetOnAccount();
      }
    }
  };
  const [mode, setMode] = useState<string>('default');
  const changeMode = (mode: string) => {
    setMode(mode);
  };

  const openGuestDetails = async (guest: any) => {
    setIsOpenModal(true);
    setIsLoadingTransaction(true);
    const account_reseponse = await getGuestDocket({
      id: guest.id,
      docket_type: 'on_account'
    });
    if (account_reseponse) {
      console.log('account_reseponse.data', account_reseponse.data);
      setOnAccountDockets(account_reseponse.data);
    }
    setSelectedGuest(guest);
    setIsLoadingTransaction(false);
  };

  const [selectedDockets, setSelectedDockets] = useState<any[]>([]);

  const handleSelecteDockets = (docket: any) => {
    if (selectedDockets.includes(docket)) {
      setSelectedDockets(selectedDockets.filter((item) => item !== docket));
    } else {
      setSelectedDockets([...selectedDockets, docket]);
    }
  };
  useEffect(() => {
    setSelectedDockets([]);
  }, [mode]);

  useEffect(() => {
    handleGetOnAccount();
    asyncBusinessProfile();
    fetchCustomers();
  }, []);

  const addOptionalAmount = (docket: any) => {
    let products = docket.orders[0].products.flatMap((product: any) => {
      let mainProduct = {
        description: product.title,
        amount: product.price,
        quantity: product.quantity
      };

      // Map add-ons to individual product entries
      let addOnProducts = product.addOns
        ? product.addOns.map((addOn: any) => ({
            description: `${product.title} - ${addOn.name}`,
            amount: addOn.price,
            quantity: addOn.quantity
          }))
        : [];

      // Return an array containing the main product and all add-ons as individual entries
      return [mainProduct, ...addOnProducts];
    });

    if (docket?.tip?.amount) {
      products.push({
        description: 'Tip',
        amount: docket.tip.amount,
        quantity: 1
      });
    }
    if (docket?.discount?.amount) {
      products.push({
        description: 'Discount',
        amount: Number(-docket.discount.amount),
        quantity: 1
      });
    }
    if (docket?.surcharge) {
      docket.surcharge.map((surcharge: any) => {
        products.push({
          description: surcharge.name,
          amount: surcharge.amount,
          quantity: 1
        });
      });
    }
    return products;
  };

  const closeModal = () => {
    if (isSendingInvoice) return;
    setIsOpenModal(!isOpenModal);
    setMode('default');
  };

  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [sentInvoiceId, setSentInvoiceId] = useState<any>([]);
  const sendInvoice = async () => {
    setIsSendingInvoice(true);
    try {
      let customer = stripeCustomers.find(
        (customer) => customer.email === selectedGuest.email
      );
      if (!customer) {
        customer = await createStripeCustomer({
          customer: null,
          email: selectedGuest.email,
          description: selectedGuest.name,
          guest_id: selectedGuest.id
        });
      }
      let sendInvoices = [];
      for (const docket of selectedDockets) {
        addOptionalAmount(docket);
        const invoiceStripe = await createStripeInvoiceOnAccount({
          customer: customer.id,
          items: addOptionalAmount(docket),
          pos_transaction_id: docket.id
        });
        sendInvoices.push(docket.id);
      }
      setSentInvoiceId([...sentInvoiceId, ...sendInvoices]);
      toast({
        title: 'Invoice sent',
        description: 'Invoice has been sent successfully',
        variant: 'success'
      });
      setSelectedDockets([]);
      setIsSendingInvoice(false);
    } catch (error) {
      setIsSendingInvoice(false);
      closeModal();
      console.error(error);
    }
  };

  return (
    <div className="h-screen overflow-y-auto px-8 pb-12">
      <div className="mb-4">
        <Heading
          title={`onAccount`}
          description="Manage onAccount"
          titleClass="text-xl"
          descriptionClass="text-sm"
        />
      </div>
      {guestsOnAccount.length > 0 ? (
        <ul
          className="grid p-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gridGap: '0.5rem'
          }}
        >
          {guestsOnAccount?.map((guest, index) => (
            <li
              key={index}
              className="flex cursor-pointer flex-col gap-2 rounded-lg bg-secondary p-2 transition-all duration-300 hover:opacity-60"
              onClick={() => openGuestDetails(guest)}
            >
              <div className="flex w-full items-center rounded-sm">
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full">
                  {guest.profile_pic ? (
                    <Image
                      src={`${
                        process.env.NEXT_PUBLIC_IMG_URL + guest.profile_pic
                      }`}
                      alt="User"
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        if (!e.currentTarget.dataset.error) {
                          e.currentTarget.dataset.error = 'true';
                          e.currentTarget.src =
                            'https://dummyimage.com/200x200/667085/667085.gif';
                          e.currentTarget.srcset =
                            'https://dummyimage.com/200x200/667085/667085.gif';
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray text-white">
                      {guest.name
                        .split(' ')
                        .map((word: string) => word[0])
                        .join('')}
                    </div>
                  )}
                </div>

                <div className="ml-4" style={{ width: 'calc(100% - 80px)' }}>
                  <p className="text-xs font-medium">{guest.name}</p>
                  <p className="text-tiny">
                    {guest?.mobile || 'No Phone available'}
                  </p>
                  <p className="w-inherit overflow-hidden text-ellipsis whitespace-nowrap break-all text-tiny">
                    {guest?.email || 'No email available'}
                  </p>
                </div>
              </div>
              <p className="text-left text-xs">${guest.total.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex h-[90%] w-full items-center justify-center">
          <p className="text-xl">No guests on account</p>
        </div>
      )}
      <Dialog modal={true} open={isOpenModal} onOpenChange={() => closeModal()}>
        <DialogContent className="flex h-[90dvh] min-w-[80dvw] flex-col">
          {isLoadingTransaction ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-spin" />
            </div>
          ) : (
            <>
              <ul className="relative grid grid-cols-2 gap-4 overflow-y-auto pb-8 pt-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {(() => {
                  if (onAccountDockets?.length > 0) {
                    return onAccountDockets?.map(
                      (transaction: any, idx: number) => (
                        <li
                          key={`${transaction.order_id}-${idx}`}
                          className={`relative cursor-pointer ${
                            mode === 'send' &&
                            (transaction.stripe_invoice_id ||
                              sentInvoiceId.includes(transaction.id))
                              ? 'pointer-events-none'
                              : ''
                          }`}
                          onClick={
                            mode === 'default'
                              ? () => openPaymentModal(transaction)
                              : () => handleSelecteDockets(transaction)
                          }
                        >
                          <TransactionThumb
                            transaction={transaction}
                            businessProfile={businessProfile}
                            isSelected={selectedDockets.includes(transaction)}
                            isDisabled={
                              mode === 'send' &&
                              (transaction.stripe_invoice_id ||
                                sentInvoiceId.includes(transaction.id))
                            }
                          />
                          {mode === 'send' &&
                            (transaction.stripe_invoice_id ||
                              sentInvoiceId.includes(transaction.id)) && (
                              <CircleCheck
                                size={40}
                                className="absolute inset-0 z-10  m-auto"
                              />
                            )}
                        </li>
                      )
                    );
                  } else {
                    return (
                      <div className="ml-2 cursor-pointer">
                        <p className="text-blue text-sm">
                          No available dockets
                        </p>
                      </div>
                    );
                  }
                })()}
              </ul>
              {isSendingInvoice && (
                <div className="absolute inset-0 z-10 m-auto flex h-full w-full items-center justify-center bg-background/60">
                  <Loader2 className="left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                </div>
              )}
              {mode === 'default' && (
                <div className="mt-auto flex justify-end">
                  <Button onClick={() => changeMode('send')} variant="submit">
                    Send Invoice
                  </Button>
                </div>
              )}

              {mode === 'send' && (
                <div className="mt-auto flex justify-end gap-2">
                  <Button
                    onClick={() => changeMode('default')}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => sendInvoice()}
                    variant="submit"
                    disabled={selectedDockets.length === 0}
                  >
                    Send
                  </Button>
                  <Button
                    onClick={() =>
                      setSelectedDockets(
                        onAccountDockets.filter(
                          (docket: any) => !docket.stripe_invoice_id
                        )
                      )
                    }
                    variant="secondary"
                  >
                    Select All
                  </Button>
                </div>
              )}
            </>
          )}
          {isOpenPaymentModal && (
            <PaymentModal
              isOpen={isOpenPaymentModal}
              onClose={handleonClosePaymentModal}
              total={selectedTransaction?.total}
              guestName={selectedGuest?.name}
              items={selectedTransaction.orders[0].products}
              propBooking={selectedTransaction.booking}
              tableId=""
              docket={selectedTransaction}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

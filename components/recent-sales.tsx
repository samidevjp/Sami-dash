'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { Modal } from './ui/modal';
import { Icons } from './icons';
import Link from 'next/link';
import { Button } from './ui/button';

export function RecentSales(props: any) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const formattedDate = (date: number) => {
    const timestamp = date * 1000;
    const dateObject = new Date(timestamp);
    const day = dateObject.getDate();
    const month = dateObject.toLocaleDateString('default', { month: 'short' });
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${hours}:${minutes}`;
  };

  const handleModalOpen = async (transaction: any) => {
    setModalOpen(true);
    setSelectedTransaction(transaction);
    // await getSelectedTransactionInfo(transaction);
  };

  return (
    <div className="space-y-2">
      {props?.transactions?.map((transaction: any) => {
        // const Icon = Icons[item.icon || 'arrowRight'];
        console.log('transaction', transaction);

        const Icon =
          Icons[
            transaction?.status === 'succeeded'
              ? 'check'
              : transaction?.metadata?.cash_received === 'true'
              ? 'check'
              : 'close'
          ];
        return (
          <div
            key={transaction.id}
            onClick={() => handleModalOpen(transaction)}
            className="flex items-center p-2 hover:bg-gray-200 hover:text-black"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback
                className={`${
                  transaction.status === 'succeeded'
                    ? 'bg-green-400'
                    : transaction?.metadata?.cash_received === 'true'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              >
                <Icon className={`size-5 flex-none`} />
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm text-muted-foreground">
                {transaction.calculated_statement_descriptor}
              </p>
              <p className="text-sm font-medium leading-none">
                {formattedDate(transaction.created)}
              </p>
            </div>
            <div className="ml-auto font-medium">
              {transaction.status === 'succeeded' ? '+' : ''}$
              {transaction.amount.toFixed(2) / 100}
            </div>
          </div>
        );
      })}
      {modalOpen && (
        <Modal
          title={`$${selectedTransaction.amount / 100}`}
          description="Payment details"
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Payment details</h2>
              <div className="flex items-center">
                <span className="text-sm font-medium">Status</span>
                <span
                  className={`ml-2 rounded-full px-2 py-1 text-sm font-semibold ${
                    selectedTransaction.status === 'succeeded'
                      ? 'bg-green-100 text-green-800'
                      : selectedTransaction?.metadata?.cash_received === 'true'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedTransaction?.metadata?.cash_received === 'true'
                    ? 'Cash Received'
                    : selectedTransaction.status.charAt(0).toUpperCase() +
                      selectedTransaction.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Date received</span>
                <span className="text-sm">
                  {formattedDate(selectedTransaction.created)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Amount</span>
                <span className="text-sm">{`${(
                  selectedTransaction.amount / 100
                ).toFixed(
                  2
                )} ${selectedTransaction.currency.toUpperCase()}`}</span>
              </div>
              {!props.payments && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Net</span>
                    <span className="text-sm">{`${(
                      selectedTransaction.amount_captured / 100
                    ).toFixed(
                      2
                    )} ${selectedTransaction.currency.toUpperCase()}`}</span>
                  </div>

                  <div className="flex items-center justify-center">
                    <Button>
                      <Link
                        href={selectedTransaction?.receipt_url}
                        target="_blank"
                      >
                        {' '}
                        View Receipt{' '}
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>

            <hr className="my-4" />

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Timeline</h2>
              {/* <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium">Payment succeeded</span>
                <span className="ml-auto text-sm">
                  {formattedDate(selectedTransaction.created)}
                </span>
              </div> */}
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-gray-400"></span>
                <span className="text-sm font-medium">Payment started</span>
                <span className="ml-auto text-sm">
                  {formattedDate(selectedTransaction.created)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

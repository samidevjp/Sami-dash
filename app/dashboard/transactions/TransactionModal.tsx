import React, { useRef } from 'react';
import { X } from 'lucide-react';
import moment from 'moment';
interface TransactionModalProps {
  isModalOpen: boolean;
  selectedTransaction: any;
  businessProfile: any;
  handlePrint: () => void;
  closeModal: () => void;
}
const TransactionModal: React.FC<TransactionModalProps> = ({
  isModalOpen,
  selectedTransaction,
  businessProfile,
  handlePrint,
  closeModal
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isModalOpen || !selectedTransaction) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 text-gray-500 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-sm rounded-lg shadow-lg"
        ref={printContentRef}
      >
        <button className="absolute right-2 top-2" onClick={closeModal}>
          <X />
        </button>
        <div className="mb-2 bg-white px-6 py-4 text-black">
          <h2 className="mb-1 text-2xl font-bold">
            {businessProfile.business_name}
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-md">
              {selectedTransaction.orders?.[0]?.guest?.first_name}{' '}
              {selectedTransaction.orders?.[0]?.guest?.last_name}{' '}
            </p>
            <div className="">
              <p className="mb-1 text-xs">
                {moment(selectedTransaction.transaction_date).format('hh:mm A')}
              </p>
              <p className="text-xs">
                {moment(selectedTransaction.transaction_date).format(
                  'DD/MM/YYYY'
                )}
              </p>
            </div>
          </div>
        </div>
        {/* Scrollable product list */}
        <div className="mb-2 bg-white px-6 py-4 text-black">
          <div className="h-60 overflow-y-auto">
            {selectedTransaction.orders[0].products.map(
              (product: any, index: any) => (
                <div key={index} className="mb-4">
                  <div className="mb-4 flex justify-between">
                    <p className="">{product.title}</p>
                    <p>
                      $
                      {(() => {
                        // Check if product is weight-based (price_type: 2)
                        if (
                          product.price_type === 2 &&
                          product.total_weight &&
                          product.based_weight
                        ) {
                          // Calculate price based on weight ratio
                          const calculatedPrice =
                            (product.total_weight / product.based_weight) *
                            product.price;
                          return calculatedPrice.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          });
                        } else {
                          // Regular product: price * quantity
                          return (
                            product.price * product.quantity
                          ).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          });
                        }
                      })()}
                    </p>
                  </div>
                  {product.addOns.length > 0 && (
                    <ul className="pl-8">
                      {product.addOns.map((addOn: any, i: any) => (
                        <li className="mb-2 flex justify-between" key={i}>
                          <p className="text-sm text-gray-500">{addOn.name}</p>
                          {addOn.price !== 0 && (
                            <p>
                              $
                              {addOn.price.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            )}
          </div>
        </div>
        <div className="mb-2 bg-white px-6 py-4 text-black">
          <div className="mb-2 flex justify-between">
            <p>SUB-TOTAL</p>
            <p>
              $
              {selectedTransaction.sub_total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
          <div className="flex justify-between">
            <p>TAX</p>
            <ul>
              <li>
                GST 10% $
                {(selectedTransaction.sub_total * 0.1).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </li>
            </ul>
          </div>
        </div>
        <div className="mb-2 bg-white px-6 py-4 text-black">
          <div className="flex justify-between">
            <p>TOTAL</p>
            <p className="text-xl">
              $
              {selectedTransaction.total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
        </div>
      </div>
      {/* <div className="mt-4 text-center">
        <Button
          className="w-44"
          onClick={handlePrint}
        >
          Print Bill
        </Button>
      </div> */}
    </div>
  );
};
export default TransactionModal;

import React from 'react';
import moment from 'moment';
interface Product {
  title: string;
  price: number;
  quantity: number;
  addOns: AddOn[];
  price_type?: number;
  total_weight?: number;
  based_weight?: number;
}
interface AddOn {
  name: string;
  price: number;
}
interface TransactionThumbProps {
  transaction: any;
  businessProfile: any;
  isSelected?: boolean;
  isDisabled?: boolean;
}
const TransactionThumb: React.FC<TransactionThumbProps> = ({
  transaction,
  businessProfile,
  isSelected = false,
  isDisabled = false
}) => {
  const getTotalAmount = () => {
    let sum =
      transaction.sub_total -
      Number(
        transaction?.discount?.amount ? transaction?.discount?.amount : 0
      ) +
      Number(transaction?.tip?.amount ? transaction?.tip?.amount : 0) +
      Number(
        transaction?.surcharge
          ? transaction?.surcharge?.reduce(
              (acc: number, surcharge: any) => acc + surcharge.amount,
              0
            )
          : 0
      );
    return sum.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  return (
    <div
      className={`relative z-10 overflow-hidden rounded-lg border bg-secondary shadow ${
        isSelected || transaction.isActive ? 'border-primary' : ''
      }
      ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <div className="absolute bottom-0 z-20 w-full bg-black bg-opacity-70 p-2 text-sm text-white">
        <p>
          {transaction.orders?.[0]?.guest?.first_name}{' '}
          {transaction.orders?.[0]?.guest?.last_name} -{' '}
          {transaction.orders?.[0]?.table_name}
        </p>
        <div className="flex justify-between">
          <p>${getTotalAmount()}</p>
          <p>{moment(transaction.transaction_date).format('hh:mm A')}</p>
        </div>
      </div>
      <div className="relative w-full cursor-pointer text-gray-700">
        <div className="mb-1 bg-white px-2 py-1">
          <h2 className="font-bold">{businessProfile?.business_name}</h2>
        </div>
        {/* Scrollable product list */}
        <div className="mb-1 bg-white px-2 py-1 text-xs ">
          <div className="h-16 overflow-hidden px-4">
            {transaction.orders?.[0]?.products?.map(
              (product: Product, index: number) => (
                <div key={index} className="mb-1">
                  <div className="flex justify-between">
                    <p>{product.title}</p>
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
                    <ul className="pl-3">
                      {product.addOns.map((addOn: AddOn, i: number) => (
                        <li className="flex justify-between" key={i}>
                          <p className="text-gray-500">{addOn.name}</p>
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
        <div className="mb-2 bg-white px-2 py-1 ">
          <div className="flex items-center justify-between">
            <p className="text-xs">TOTAL</p>
            <p className="text-lg font-bold">${getTotalAmount()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TransactionThumb;

import { Minus } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { Button } from '../ui/button';

type ProductOrderListProps = {
  orderListProducts: any[];
  items: any[];
  removeItem: (index: number) => void;
  handleAddAddon: (addon: any, action: 'remove' | 'add') => void;
  selectedProduct: any;
  handleRemoveAddon: (addon: any, item: any) => void;
  setSelectedProduct: (product: any) => void;
  setOpenAddonModal: (flag: boolean) => void;
};

const ProductOrderList = ({
  orderListProducts,
  items,
  removeItem,
  handleAddAddon,
  handleRemoveAddon,
  selectedProduct,
  setSelectedProduct,
  setOpenAddonModal
}: ProductOrderListProps) => {
  const getMeasurementUnit = (measurementType: number) => {
    const kg = 1;
    const g = 2;
    const oz = 3;
    const lb = 4;

    switch (measurementType) {
      case kg:
        return 'kg';
      case g:
        return 'g';
      case oz:
        return 'oz';
      case lb:
        return 'lb';
      default:
        return 'g';
    }
  };

  const getPriceDisplay = (product: any) => {
    if (product.price_type === 2) {
      // Weight-based product: calculate price based on total_weight and based_weight
      const calculatedPrice =
        (product.total_weight / product.based_weight) * product.price;
      return `$${calculatedPrice.toFixed(2)}`;
    } else {
      // Regular product: show quantity and total price
      return `${product.quantity > 1 ? `${product.quantity}x` : ''}$${(
        product.price * product.quantity
      ).toFixed(2)}`;
    }
  };
  const itemsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (itemsRef.current) {
      itemsRef.current.scrollTo({
        top: itemsRef.current?.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [items, orderListProducts]);
  return (
    <div
      ref={itemsRef}
      className="boxName max-h-[30dvh] overflow-auto lg:h-[500px] lg:max-h-none"
    >
      {orderListProducts.length > 0 && (
        <ul className="mb-2">
          {orderListProducts.map((product: any, index: number) => (
            <li key={index} className="mt-4">
              <div className="flex justify-between">
                <p className="text-sm">{product.title}</p>
                <p className="text-sm">
                  {product.price > 0 ? getPriceDisplay(product) : ''}
                </p>
              </div>
              {product?.addOns?.length > 0 && (
                <div>
                  {product.addOns.map((addOn: any, idx: number) => (
                    <div
                      key={idx}
                      className="mt-1 flex justify-between pl-2 text-sm"
                    >
                      <div>
                        <span style={{ color: '#bfbfbf' }}>{addOn.name}</span>
                      </div>
                      <div className="flex">
                        <span>
                          {addOn.quantity > 1 && `${addOn.quantity}x`}
                        </span>
                        <span className="w-14 text-right">
                          {addOn.price > 0 &&
                            `$${(addOn.price * addOn.quantity).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="pl-2 pt-1 text-xs text-red">{product.note}</p>
            </li>
          ))}
        </ul>
      )}
      {items.length > 0 && (
        <div className="grid gap-2">
          {items.map((item: any, index: number) => (
            <div
              className={`bg-secondary0 flex cursor-pointer flex-col justify-between rounded-lg border p-2 shadow ${
                selectedProduct?.id === item.id ? 'border-primary' : ''
              }`}
              key={index}
              onClick={() => {
                setSelectedProduct(() => item);
                setOpenAddonModal(true);
              }}
            >
              <div className="flex justify-between">
                <div className="flex items-center text-sm font-bold">
                  {item.title}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-400">
                    {item.price > 0 ? getPriceDisplay(item) : ''}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(index);
                    }}
                    className="h-4 w-4 rounded-full p-0"
                  >
                    <Minus size={10} />
                  </Button>
                </div>
              </div>
              {item?.addOns?.length > 0 && (
                <div className="flex flex-col gap-2 pl-4 pt-2">
                  {item.addOns.map((addon: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <div className="text-sm text-gray-400">{addon.name}</div>
                      <div className="flex items-center gap-2 ">
                        <div className="text-sm text-gray-500">
                          {addon.quantity > 1 && `${addon.quantity}x`}
                          {addon.price > 0 &&
                            `$${(addon.price * addon.quantity).toFixed(2)}`}
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAddon(addon, item);
                          }}
                          className="h-4 w-4 rounded-full p-0"
                        >
                          <Minus size={10} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="pl-2 pt-1 text-xs text-red">{item.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductOrderList;

'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw, Circle, CircleCheckBig, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BumpOrder, BumpOrderProduct, Employee } from '@/types';
import { getBumpDocketCardColor, getElapsedTimeOnBump } from '@/lib/utils';

export function SortableCard({
  order,
  finishBumpDocket,
  revertOrder,
  toggleProductStatus,
  allEmployees,
  showDocketModal
}: {
  order: BumpOrder;
  finishBumpDocket: (order: BumpOrder) => void;
  revertOrder: (order: BumpOrder) => void;
  toggleProductStatus: (
    orderId: number,
    productUuid: string,
    isFinish?: boolean
  ) => void;
  allEmployees: Employee[];
  showDocketModal: (order: BumpOrder) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: order.id });

  // Extend BumpOrder type to include original_product_count (frontend only)

  const typedOrder = order as BumpOrder;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  let employee = allEmployees?.find(
    (employee) => String(employee.id) === String(order.employee_id)
  );
  if (allEmployees.length === 1) {
    employee = allEmployees[0];
  }

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // price_type 1: 'item'
  // price_type 2: 'weight'
  const weightChecker = (product: BumpOrderProduct) => {
    if (product?.price_type == 2) {
      const kg = 1;
      const g = 2;
      const oz = 3;
      const lb = 4;
      switch (product?.measurement_type) {
        case kg:
          return `(${product?.total_weight?.toFixed(1)}kg)`;
        case g:
          return `(${product?.total_weight?.toFixed(1)}g)`;
        case oz:
          return `(${product?.total_weight?.toFixed(1)}oz)`;
        case lb:
          return `(${product?.total_weight?.toFixed(1)}lb)`;
        default:
          return `(${product?.total_weight?.toFixed(1)}kg)`;
      }
    }
  };

  const [hideMoreItems, setHideMoreItems] = useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      const isScrolled = content.scrollTop > 10;
      setHideMoreItems(isScrolled);
    };

    content.addEventListener('scroll', handleScroll);
    return () => content.removeEventListener('scroll', handleScroll);
  }, []);

  const isDocketInactive =
    order.status === 'sent' || order.status === 'inactive';
  const isAllAppearedItemsInactive =
    order.bump_order_products.every(
      (product) => product.status === 'inactive'
    ) || isDocketInactive;

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className="mb-0 flex h-full min-h-80 flex-col overflow-hidden border-none text-sm  shadow transition-all duration-300"
        style={{
          borderRadius: '3px'
        }}
      >
        <CardHeader
          className={`p-4 pb-2 text-gray-800 transition-opacity ${getBumpDocketCardColor(
            order.order_date,
            order.status
          )} ${
            isDocketInactive || isAllAppearedItemsInactive
              ? 'cursor-default'
              : 'cursor-pointer hover:opacity-50'
          }`}
          onClick={() => {
            if (!isDocketInactive && !isAllAppearedItemsInactive) {
              finishBumpDocket(order as BumpOrder);
            }
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <div className={`flex justify-between`}>
                <span className="text-xl font-semibold">
                  {order.order_type === 'phone order' ||
                  order.order_type === 'phoneOrder'
                    ? 'Phone Order'
                    : order.order_type === 'takeAway' ||
                      order.order_type === 'take away'
                    ? 'Take Away'
                    : order.table_name || 'N/A'}
                </span>
                <div></div>
              </div>
            </div>
          </div>
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="text-sm font-normal">
              {isDocketInactive
                ? 'Completed'
                : isAllAppearedItemsInactive
                ? 'Filtered items completed'
                : order.status === 'active'
                ? getElapsedTimeOnBump(order.order_date)
                : order.status === 'hold'
                ? 'Holded'
                : ''}
            </span>
            <span>
              {order.guest?.first_name} {order.guest?.last_name}
              {order?.customer?.name}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative overflow-hidden p-0">
          <div
            ref={contentRef}
            className="h-[212px] max-h-[212px] flex-grow overflow-y-auto"
          >
            <ul className=" text-sm">
              {order.bump_order_products.map((product, index) => (
                <li
                  key={`${product.uuid}-${index}`}
                  className={`text flex flex-col border-b p-3 font-bold transition-opacity hover:opacity-80 ${
                    isDocketInactive
                      ? 'cursor-auto bg-green-100 text-black opacity-80'
                      : product.status === 'inactive'
                      ? 'cursor-pointer bg-green-100 text-black opacity-80'
                      : 'cursor-pointer '
                  }`}
                  onClick={() => {
                    if (order.status === 'inactive') return;
                    toggleProductStatus(order.id, product.uuid);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p>
                      {product.quantity}
                      <span className="px-2 text-xs">x</span>
                      {product.title} {weightChecker(product)}
                    </p>
                    {product.status === 'inactive' || isDocketInactive ? (
                      <CircleCheckBig
                        size={16}
                        className="ml-2 text-green-500"
                      />
                    ) : (
                      <Circle size={16} className="ml-2 text-gray-500" />
                    )}
                  </div>
                  {product.bump_order_add_ons.length > 0 && (
                    <ul className="ml-4 pt-1 text-xs font-normal">
                      {product.bump_order_add_ons.map((addon, index) => (
                        <li key={`${addon.id}-${index}`}>
                          {addon.quantity}
                          <span className="px-1 pt-1 text-xs">x</span>
                          {addon.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {product.note && (
                    <p className="block pl-4 pr-2 text-xs text-red">
                      {product.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {order.bump_order_products.length > 4 && (
            <div
              className={`absolute bottom-0  left-0 right-0  z-10 cursor-pointer bg-background/90 p-2 text-center text-xs font-semibold text-primary transition-all duration-300 ${
                hideMoreItems
                  ? 'translate-y-full opacity-0'
                  : 'translate-y-0 opacity-100'
              }`}
              onClick={() => {
                if (contentRef.current) {
                  contentRef.current.scrollTo({
                    top: 180,
                    behavior: 'smooth'
                  });
                }
              }}
            >
              {order.bump_order_products.length - 4} more item
              {order.bump_order_products.length - 4 > 1 && 's'}
            </div>
          )}
        </CardContent>

        <div className="mt-auto p-2">
          <div className="mt-2 flex items-center justify-between">
            {isDocketInactive || isAllAppearedItemsInactive ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  revertOrder(order as BumpOrder);
                }}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                variant="secondary"
              >
                <RefreshCcw size={16} />
              </Button>
            ) : (
              isDocketInactive === false &&
              isAllAppearedItemsInactive === false && (
                <div className="flex w-full items-center justify-between">
                  <p className="text-xs text-gray-700">
                    Taken by: {employee?.first_name} {employee?.last_name}
                  </p>
                  <Button
                    className="h-8 w-8 rounded-full bg-primary p-0 text-white"
                    onClick={() => showDocketModal(order)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

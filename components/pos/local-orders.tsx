'use client';
import React from 'react';

interface LocalOrdersProps {
  localOrders?: any[];
  table?: any;
}

const LocalOrders = ({ localOrders = [], table }: LocalOrdersProps) => {
  const filteredLocalOrders = localOrders.filter(
    (localOrder: any) => localOrder.tableId === table?.id
  );

  if (!filteredLocalOrders || filteredLocalOrders.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-3">
      <p className="mb-1 text-xs font-semibold text-orange-700">
        The following items have not been saved. Please check your network
        connection.
      </p>
      <div className="max-h-32 overflow-y-auto">
        {filteredLocalOrders.map((localOrder: any, index: number) => (
          <div
            key={index}
            className="mb-2 rounded border border-orange-200 bg-white p-2 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600">
                {new Date(localOrder.createdAt).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-600">
              {localOrder.products?.length > 0 && (
                <div className="space-y-1">
                  {localOrder.products
                    .slice(0, 3)
                    .map((product: any, pIndex: number) => (
                      <div key={pIndex} className="flex justify-between">
                        <span className="truncate">{product.title}</span>
                        <span className="ml-2 flex-shrink-0">
                          {product.quantity}x
                        </span>
                      </div>
                    ))}
                  {localOrder.products.length > 3 && (
                    <div className="text-center text-orange-600">
                      +{localOrder.products.length - 3} item
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalOrders;

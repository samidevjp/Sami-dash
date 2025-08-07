'use client';
import React from 'react';
import { Circle, CircleCheckBig, X } from 'lucide-react';
import { Dialog, DialogContentWithoutClose } from '@/components/ui/dialog';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import { BumpOrder } from '@/types';
import { getBumpDocketCardColor, getElapsedTimeOnBump } from '@/lib/utils';

interface DocketModalProps {
  currentOrders: BumpOrder[];
  selectedOrder: BumpOrder | null;
  docketModalOpen: boolean;
  setDocketModalOpen: (open: boolean) => void;
  onClose: () => void;
  toggleProductStatus: (orderId: number, productUuid: string) => void;
}

export const DocketModal = ({
  currentOrders,
  selectedOrder,
  docketModalOpen,
  setDocketModalOpen,
  onClose,
  toggleProductStatus
}: DocketModalProps) => {
  const initialSlide = currentOrders.findIndex(
    (o) => o.id === selectedOrder?.id
  );

  return (
    <Dialog open={docketModalOpen} onOpenChange={setDocketModalOpen}>
      <DialogContentWithoutClose className="!h-auto !w-auto !max-w-none !border-none !bg-transparent !p-0 !shadow-none">
        <X
          className="absolute right-0 top-0 z-50 cursor-pointer  transition-opacity duration-200 hover:opacity-60"
          onClick={onClose}
          size={32}
        />
        <div className="relative z-0 max-h-[90vh] min-w-[90vw] max-w-[90vw]">
          <div
            className="fixed inset-0 z-[-1] h-full"
            onClick={() => setDocketModalOpen(false)}
          />
          <div className=" ">
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              initialSlide={initialSlide >= 0 ? initialSlide : 0}
              coverflowEffect={{
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false
              }}
              pagination={{ clickable: true }}
              modules={[EffectCoverflow, Pagination]}
              className="relative z-0 h-full"
            >
              {currentOrders.map((order) => (
                <SwiperSlide
                  key={order.id}
                  className="flex min-h-[90vh] !w-[90vw] !max-w-[600px] items-center justify-center"
                >
                  <div className="min-h-[80vh] w-full overflow-auto rounded-lg bg-background shadow-lg">
                    <div
                      className={`p-4 pb-2 ${getBumpDocketCardColor(
                        order.order_date,
                        order.status
                      )}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-lg font-bold">
                          Table: {order.table_name || 'N/A'}
                        </h3>
                        {order.phone_order_id !== 0 && (
                          <span className="text-sm text-gray-500">
                            Phone Order #{order.phone_order_id}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-lg">
                        <p className="text-sm font-normal">
                          {getElapsedTimeOnBump(order.order_date)}
                        </p>
                        <p className="font-semibold">
                          {order?.guest?.first_name} {order?.guest?.last_name}
                        </p>
                      </div>
                    </div>
                    <ul className="mb-4 max-h-[60vh] overflow-auto">
                      {order.bump_order_products.map((product) => (
                        <li
                          key={product.uuid}
                          className={`text flex cursor-pointer flex-col border-b p-4 font-bold transition-opacity hover:opacity-80 ${
                            product.status === 'inactive'
                              ? 'bg-green-100 text-black opacity-80'
                              : ''
                          }`}
                          onClick={() =>
                            toggleProductStatus(order.id, product.uuid)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <p>
                              {product.quantity}
                              <span className="px-2 text-xs">x</span>
                              {product.title}
                            </p>
                            {product.status === 'inactive' ? (
                              <CircleCheckBig
                                size={16}
                                className="ml-2 text-green-500"
                              />
                            ) : (
                              <Circle
                                size={16}
                                className="ml-2 text-gray-500"
                              />
                            )}
                          </div>
                          {product.bump_order_add_ons.length > 0 && (
                            <ul className="ml-4 text-xs font-normal">
                              {product.bump_order_add_ons.map((addon) => (
                                <li key={addon.id}>
                                  {addon.quantity}
                                  <span className="px-1 pt-1 text-xs">x</span>
                                  {addon.name}
                                </li>
                              ))}
                            </ul>
                          )}
                          {product.note && (
                            <p className="block pl-4 pr-2 text-xs text-red">
                              Note: {product.note}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </DialogContentWithoutClose>
    </Dialog>
  );
};
